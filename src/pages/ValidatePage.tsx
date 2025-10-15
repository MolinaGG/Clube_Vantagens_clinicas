import { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, Search, User, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types/database';

export default function ValidatePage() {
  const { clinic } = useAuth();
  const [searchCode, setSearchCode] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentValidations, setRecentValidations] = useState<Appointment[]>([]);

  useEffect(() => {
    if (clinic) loadRecentValidations();
  }, [clinic]);

  const loadRecentValidations = async () => {
    if (!clinic) return;
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*, service:services(*)')
        .eq('clinic_id', clinic.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (data) setRecentValidations(data);
    } catch (error) {
      console.error('Error loading validations:', error);
    }
  };

  const searchAppointment = async () => {
    if (!clinic || !searchCode.trim()) return;

    setLoading(true);
    setAppointment(null);

    try {
      const { data } = await supabase
        .from('appointments')
        .select('*, service:services(*)')
        .eq('clinic_id', clinic.id)
        .eq('id', searchCode.trim())
        .maybeSingle();

      if (data) {
        setAppointment(data);
      } else {
        alert('Agendamento não encontrado');
      }
    } catch (error) {
      console.error('Error searching appointment:', error);
      alert('Erro ao buscar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const validateAppointment = async () => {
    if (!appointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (error) throw error;

      alert('Agendamento validado com sucesso!');
      setAppointment({ ...appointment, status: 'completed' });
      loadRecentValidations();
      setSearchCode('');
    } catch (error) {
      console.error('Error validating:', error);
      alert('Erro ao validar agendamento');
    }
  };

  const formatCurrency = (value: number) => `R$ ${(value / 100).toFixed(2).replace('.', ',')}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  const statusColors: Record<string, string> = {
    scheduled: 'border-blue-500 bg-blue-50',
    confirmed: 'border-green-500 bg-green-50',
    completed: 'border-gray-500 bg-gray-50',
    cancelled: 'border-red-500 bg-red-50',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Validar Agendamento</h1>
        <p className="text-gray-600 mt-1">Confirme a presença do paciente</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <QrCode className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código do Agendamento
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchAppointment()}
              placeholder="Digite ou escaneie o código"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchAppointment}
              disabled={loading || !searchCode.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </div>
        </div>

        {appointment && (
          <div className={`mt-6 max-w-md mx-auto border-2 rounded-xl p-6 ${statusColors[appointment.status]}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detalhes do Agendamento</h3>
              {appointment.status === 'completed' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : appointment.status === 'cancelled' ? (
                <XCircle className="w-8 h-8 text-red-600" />
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Paciente</p>
                  <p className="font-medium text-gray-900">{appointment.user_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-medium text-gray-900">{formatDate(appointment.appointment_date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Horário</p>
                  <p className="font-medium text-gray-900">{appointment.appointment_time.substring(0, 5)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Serviço</p>
                <p className="font-medium text-gray-900 mb-2">{appointment.service?.name || 'N/A'}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(appointment.price_paid)}</p>
              </div>
            </div>

            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <button
                onClick={validateAppointment}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Validar Atendimento
              </button>
            )}
          </div>
        )}
      </div>

      {recentValidations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Validações Recentes</h2>
          <div className="space-y-3">
            {recentValidations.map((val) => (
              <div key={val.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{val.user_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(val.appointment_date)} às {val.appointment_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-900">{formatCurrency(val.price_paid)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
