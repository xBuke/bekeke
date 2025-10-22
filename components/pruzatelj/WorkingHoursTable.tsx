import { WorkingHours } from '@/types';

interface WorkingHoursTableProps {
  workingHours: WorkingHours[];
}

const DAYS = [
  { id: 1, name: 'Ponedjeljak' },
  { id: 2, name: 'Utorak' },
  { id: 3, name: 'Srijeda' },
  { id: 4, name: 'Četvrtak' },
  { id: 5, name: 'Petak' },
  { id: 6, name: 'Subota' },
  { id: 0, name: 'Nedjelja' },
];

export default function WorkingHoursTable({ workingHours }: WorkingHoursTableProps) {
  // Create a map for quick lookup
  const hoursMap = new Map();
  workingHours.forEach(hour => {
    hoursMap.set(hour.day_of_week, hour);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Dan</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Radno vrijeme</th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => {
            const workingHour = hoursMap.get(day.id);
            return (
              <tr key={day.id} className="border-b last:border-b-0">
                <td className="py-3 px-4 font-medium">{day.name}</td>
                <td className="py-3 px-4">
                  {workingHour ? (
                    <span className="text-green-600">
                      {workingHour.start_time} - {workingHour.end_time}
                    </span>
                  ) : (
                    <span className="text-gray-500">Zatvoreno</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
