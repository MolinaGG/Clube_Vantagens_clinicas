import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AvailableSlot {
  id: string;
  clinic_id: string;
  date: string;
  time_slot: string;
  capacity: number;
  booked: number;
}

export default function AvailabilityPage() {
  const { clinic } = useAuth();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newSlot, setNewSlot] = useState({ time: '', capacity: 1 });

  useEffect(() => {
    if (clinic) loadSlots();
  }, [clinic, selectedDate]);

  const loadSlots = async () => {
    if (!clinic) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data } = await supabase
        .from('available_slots')
        .select('*')
        .eq('clinic_id', clinic.id)
        .eq('date', dateStr)
        .order('time_slot');

      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = async () => {
    if (!clinic || !newSlot.time) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('available_slots')
        .insert({
          clinic_id: clinic.id,
          date: dateStr,
          time_slot: newSlot.time,
          capacity: newSlot.capacity,
          booked: 0
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSlots([...slots, data]);
        setNewSlot({ time: '', capacity: 1 });
      }
    } catch (error: any) {
      alert('Erro ao adicionar horário: ' + error.message);
    }
  };

  const deleteSlot = async (slotId: string) => {
    if (!confirm('Deseja realmente remover este horário?')) return;

    try {
      await supabase.from('available_slots').delete().eq('id', slotId);
      setSlots(slots.filter(s => s.id !== slotId));
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const generateDefaultSlots = async () => {
    if (!clinic) return;

    const defaultTimes = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    const dateStr = selectedDate.toISOString().split('T')[0];

    try {
      const newSlots = defaultTimes.map(time => ({
        clinic_id: clinic.id,
        date: dateStr,
        time_slot: time,
        capacity: 3,
        booked: 0
      }));

      const { data } = await supabase
        .from('available_slots')
        .insert(newSlots)
        .select();

      if (data) {
        setSlots(data);
      }
    } catch (error) {
      console.error('Error generating slots:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Horários Disponíveis</h1>
        <p className="text-gray-600 mt-1">Gerencie os horários de atendimento</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={generateDefaultSlots}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Gerar Horários Padrão
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            type="time"
            value={newSlot.time}
            onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Horário"
          />
          <input
            type="number"
            min="1"
            max="10"
            value={newSlot.capacity}
            onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Vagas"
          />
          <button
            onClick={addSlot}
            disabled={!newSlot.time}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum horário cadastrado</h3>
          <p className="text-gray-500 mb-6">Adicione horários disponíveis para agendamentos</p>
          <button
            onClick={generateDefaultSlots}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Gerar Horários Padrão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`bg-white rounded-xl border-2 p-4 ${
                slot.booked >= slot.capacity
                  ? 'border-red-200 bg-red-50'
                  : slot.booked > 0
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-xl font-bold text-gray-900">{slot.time_slot}</span>
                </div>
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vagas:</span>
                  <span className="font-medium text-gray-900">{slot.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ocupadas:</span>
                  <span className="font-medium text-gray-900">{slot.booked}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disponíveis:</span>
                  <span className="font-bold text-green-600">{slot.capacity - slot.booked}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
