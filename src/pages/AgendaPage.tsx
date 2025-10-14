import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types/database';

export default function AgendaPage() {
  const { clinic } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinic) loadAppointments();
  }, [clinic, selectedDate]);

  const loadAppointments = async () => {
    if (!clinic) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data } = await supabase
        .from('appointments')
        .select('*, service:services(*)')
        .eq('clinic_id', clinic.id)
        .eq('appointment_date', dateStr)
        .order('appointment_time');
      
      setAppointments(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `R$ ${(value / 100).toFixed(2).replace('.', ',')}`;

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
        <p className="text-gray-600 mt-1">Gerenciamento de agendamentos</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
          <p className="text-gray-500">Não há agendamentos para esta data</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[apt.status]}`}>
                  {statusLabels[apt.status]}
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(apt.price_paid)}</p>
                  <p className={`text-sm ${apt.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {apt.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Paciente</p>
                    <p className="font-medium text-gray-900">{apt.user_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Horário</p>
                    <p className="font-medium text-gray-900">{apt.appointment_time.substring(0, 5)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Serviço</p>
                <p className="font-medium text-gray-900">{apt.service?.name || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
