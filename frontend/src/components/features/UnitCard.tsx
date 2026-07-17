// src/components/features/UnitCard.tsx
import type { Unit } from '../../types/unit';

interface UnitCardProps {
  unit: Unit;
}

export default function UnitCard({ unit }: UnitCardProps) {
  return (
    <div className={`${unit.theme.bg} ${unit.theme.border} border rounded-2xl p-6 flex flex-col cursor-pointer transition-transform hover:-translate-y-1`}>
      <div className="text-3xl mb-4">{unit.theme.icon}</div>
      <h3 className={`text-xl font-bold ${unit.theme.text} mb-1`}>{unit.name}</h3>
      <span className={`${unit.theme.text} opacity-80 text-sm font-medium`}>
        {unit.materialCount} materials
      </span>
    </div>
  );
}