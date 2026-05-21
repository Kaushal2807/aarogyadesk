'use client';

import { useState, useCallback, useEffect } from 'react';

interface ToothChartData {
  upperRight: string;
  upperLeft: string;
  lowerRight: string;
  lowerLeft: string;
}

interface ToothChartProps {
  onChange?: (data: ToothChartData) => void;
  initialValues?: Partial<ToothChartData>;
}

export default function ToothChart({ onChange, initialValues }: ToothChartProps) {
  const [teeth, setTeeth] = useState<Record<string, Set<string>>>({
    ur: new Set(initialValues?.upperRight?.split(',').filter(Boolean) || []),
    ul: new Set(initialValues?.upperLeft?.split(',').filter(Boolean) || []),
    lr: new Set(initialValues?.lowerRight?.split(',').filter(Boolean) || []),
    ll: new Set(initialValues?.lowerLeft?.split(',').filter(Boolean) || []),
  });

  const toggleTooth = useCallback((quadrant: string, tooth: string) => {
    setTeeth((prev) => {
      const next = { ...prev };
      const set = new Set(next[quadrant]);
      if (set.has(tooth)) {
        set.delete(tooth);
      } else {
        set.add(tooth);
      }
      next[quadrant] = set;
      return next;
    });
  }, [onChange]);

  // call onChange after teeth state updates (in effect), not during render
  useEffect(() => {
    if (!onChange) return;
    onChange({
      upperRight: [...teeth.ur].join(','),
      upperLeft: [...teeth.ul].join(','),
      lowerRight: [...teeth.lr].join(','),
      lowerLeft: [...teeth.ll].join(','),
    });
  }, [teeth, onChange]);

  const Quadrant = ({ label, quad, range }: { label: string; quad: string; range: number[] }) => (
    <div className="text-center">
      <div className="text-[13px] font-semibold text-slate-700 mb-1.5">{label}</div>
      <div className="flex justify-center gap-1.5">
        {range.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => toggleTooth(quad, String(num))}
            className={`w-8 h-8 rounded-md text-sm font-semibold transition-all duration-200 ${
              teeth[quad]?.has(String(num))
                ? 'bg-primary-500 text-white border-primary-700 shadow-sm'
                : 'bg-slate-50 text-slate-500 border border-indigo-200 hover:border-primary-400 hover:bg-primary-50'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="text-center">
      {/* Upper Row */}
      <div className="flex justify-center gap-4">
        <Quadrant label="Upper Right" quad="ur" range={[8,7,6,5,4,3,2,1]} />
        <Quadrant label="Upper Left" quad="ul" range={[1,2,3,4,5,6,7,8]} />
      </div>
      {/* Gap */}
      <div className="h-4" />
      {/* Lower Row */}
      <div className="flex justify-center gap-4">
        <Quadrant label="Lower Right" quad="lr" range={[8,7,6,5,4,3,2,1]} />
        <Quadrant label="Lower Left" quad="ll" range={[1,2,3,4,5,6,7,8]} />
      </div>
    </div>
  );
}
