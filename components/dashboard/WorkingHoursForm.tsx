'use client';

import { useState, useEffect } from 'react';
import { ServiceProvider } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface WorkingHoursFormProps {
  provider: ServiceProvider;
}

interface DaySchedule {
  day_of_week: number;
  isWorking: boolean;
  start_time: string;
  end_time: string;
}

const DAYS = [
  { id: 1, name: 'Ponedjeljak', label: 'Pon' },
  { id: 2, name: 'Utorak', label: 'Uto' },
  { id: 3, name: 'Srijeda', label: 'Sri' },
  { id: 4, name: 'Četvrtak', label: 'Čet' },
  { id: 5, name: 'Petak', label: 'Pet' },
  { id: 6, name: 'Subota', label: 'Sub' },
  { id: 0, name: 'Nedjelja', label: 'Ned' },
];

export default function WorkingHoursForm({ provider }: WorkingHoursFormProps) {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);

  // Initialize schedules from existing working hours
  useEffect(() => {
    const initialSchedules: DaySchedule[] = DAYS.map(day => {
      const existingHours = provider.working_hours?.find(wh => wh.day_of_week === day.id);
      return {
        day_of_week: day.id,
        isWorking: !!existingHours,
        start_time: existingHours?.start_time || '09:00',
        end_time: existingHours?.end_time || '17:00'
      };
    });
    setSchedules(initialSchedules);
  }, [provider.working_hours]);

  const handleDayToggle = (dayOfWeek: number, isWorking: boolean) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day_of_week === dayOfWeek 
        ? { ...schedule, isWorking }
        : schedule
    ));
  };

  const handleTimeChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.day_of_week === dayOfWeek 
        ? { ...schedule, [field]: value }
        : schedule
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Delete existing working hours
      await supabase
        .from('working_hours')
        .delete()
        .eq('provider_id', provider.id);

      // Insert new working hours for days that are marked as working
      const workingSchedules = schedules.filter(schedule => schedule.isWorking);
      
      if (workingSchedules.length > 0) {
        const workingHoursData = workingSchedules.map(schedule => ({
          provider_id: provider.id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time
        }));

        const { error } = await supabase
          .from('working_hours')
          .insert(workingHoursData);

        if (error) throw error;
      }

      toast.success('Radno vrijeme uspješno spremljeno!');
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast.error('Greška pri spremanju radnog vremena');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Radno vrijeme</h3>
        <p className="text-sm text-gray-600">
          Postavite svoje radno vrijeme za svaki dan u tjednu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {DAYS.map((day) => {
            const schedule = schedules.find(s => s.day_of_week === day.id);
            if (!schedule) return null;

            return (
              <div key={day.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                {/* Day name and checkbox */}
                <div className="flex items-center space-x-3 min-w-[120px]">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={schedule.isWorking}
                    onCheckedChange={(checked) => handleDayToggle(day.id, !!checked)}
                  />
                  <label htmlFor={`day-${day.id}`} className="font-medium">
                    {day.name}
                  </label>
                </div>

                {/* Time inputs */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    <label htmlFor={`start-${day.id}`} className="text-sm text-gray-600">
                      Od:
                    </label>
                    <input
                      id={`start-${day.id}`}
                      type="time"
                      value={schedule.start_time}
                      onChange={(e) => handleTimeChange(day.id, 'start_time', e.target.value)}
                      disabled={!schedule.isWorking}
                      className="px-3 py-1 border rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <label htmlFor={`end-${day.id}`} className="text-sm text-gray-600">
                      Do:
                    </label>
                    <input
                      id={`end-${day.id}`}
                      type="time"
                      value={schedule.end_time}
                      onChange={(e) => handleTimeChange(day.id, 'end_time', e.target.value)}
                      disabled={!schedule.isWorking}
                      className="px-3 py-1 border rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  {!schedule.isWorking && (
                    <span className="text-sm text-gray-400 italic">
                      Zatvoreno
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Spremanje...' : 'Spremi radno vrijeme'}
          </Button>
        </div>
      </form>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Pregled radnog vremena:</h4>
        <div className="space-y-1 text-sm">
          {schedules.map(schedule => {
            const day = DAYS.find(d => d.id === schedule.day_of_week);
            return (
              <div key={schedule.day_of_week} className="flex justify-between">
                <span>{day?.name}:</span>
                <span>
                  {schedule.isWorking 
                    ? `${schedule.start_time} - ${schedule.end_time}`
                    : 'Zatvoreno'
                  }
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
