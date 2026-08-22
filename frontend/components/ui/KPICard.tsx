'use client';

import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  subtitle: string;
  value: number | string;
  icon: ReactNode;
  bgClass: string;
  iconBgClass: string;
  textClass: string;
  filter?: ReactNode;
}

export default function KPICard({ title, subtitle, value, icon, bgClass, iconBgClass, textClass, filter }: KPICardProps) {
  return (
    <div className={`${bgClass} rounded-xl shadow-md p-5 h-full transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`${iconBgClass} text-white p-3 rounded-lg text-xl shadow-sm flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h6 className={`${textClass} text-sm font-semibold leading-tight`}>{title}</h6>
            <p className={`${textClass} text-xs opacity-70 mt-0.5`}>{subtitle}</p>
          </div>
        </div>
        {filter && <div className="flex-shrink-0">{filter}</div>}
      </div>
      <h2 className={`text-4xl font-extrabold ${textClass} tracking-tight`}>{value}</h2>
    </div>
  );
}


