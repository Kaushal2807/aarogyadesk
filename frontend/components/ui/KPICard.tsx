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
    <div className={`${bgClass} rounded-2xl shadow-lg p-5 h-full transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`${iconBgClass} text-white p-3 rounded-xl text-xl shadow-sm`}>
            {icon}
          </div>
          <div>
            <h6 className={`${textClass} text-sm font-semibold`}>{title}</h6>
            <p className={`${textClass} text-xs opacity-70 mt-0.5`}>{subtitle}</p>
          </div>
        </div>
        {filter}
      </div>
      <h2 className={`text-4xl font-extrabold ${textClass} tracking-tight`}>{value}</h2>
      <p className={`text-sm ${textClass} opacity-70 mt-1.5`}>{subtitle}</p>
    </div>
  );
}
