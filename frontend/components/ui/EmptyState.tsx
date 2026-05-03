import { ReactNode } from 'react';
import { BiBox } from 'react-icons/bi';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="text-center py-12 animate-[fadeInScale_0.5s_ease]">
      <div className="text-slate-300 text-5xl mb-3 inline-block animate-[float_3s_ease-in-out_infinite]">
        {icon || <BiBox />}
      </div>
      <p className="text-slate-500 text-base">{message}</p>
    </div>
  );
}
