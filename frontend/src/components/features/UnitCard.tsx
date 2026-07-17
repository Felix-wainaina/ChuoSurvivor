import { Link } from 'react-router-dom';
import type { Unit } from '../../types/unit';

interface UnitCardProps {
  unit: Unit;
}

export default function UnitCard({ unit }: UnitCardProps) {
  return (
    <Link 
      to={`/unit/${unit.id}`} 
      className={`block h-48 rounded-3xl border-2 p-6 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${unit.theme.bg} ${unit.theme.border}`}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Top Section: Icon & Dynamic Badge */}
        <div className="flex justify-between items-start">
          <span className="text-3xl">{unit.theme.icon}</span>
          {unit.dateType && unit.dateValue && (
            <span className="text-xs font-bold bg-white/80 border border-slate-200 px-3 py-1 rounded-full text-slate-600">
              {unit.dateType}: {unit.dateValue}
            </span>
          )}
        </div>

        {/* Bottom Section: Name & Material Count */}
        <div>
          <h3 className={`text-xl font-black ${unit.theme.text} mb-1`}>
            {unit.name}
          </h3>
          <p className="text-sm font-medium text-slate-500">
            {unit.materialCount} {unit.materialCount === 1 ? 'material' : 'materials'}
          </p>
        </div>
      </div>
    </Link>
  );
}