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
    <div className={`${bgClass} rounded-2xl shadow-md p-4 h-full`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className={`${iconBgClass} text-white p-3 rounded-xl text-xl shadow`}>
            {icon}
          </div>
          <div>
            <h6 className={`${textClass} text-sm font-semibold`}>{title}</h6>
            <p className={`${textClass.replace('700', '500')} text-xs opacity-80`}>{subtitle}</p>
          </div>
        </div>
        {filter}
      </div>
      <h2 className={`text-3xl font-bold ${textClass}`}>{value}</h2>
      <p className={`text-sm ${textClass.replace('700', '600')} mt-1`}>{subtitle}</p>
    </div>
  );
}
