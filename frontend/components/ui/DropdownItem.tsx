import { ReactNode } from 'react';

interface DropdownItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

export default function DropdownItem({ icon, children, onClick, divider }: DropdownItemProps) {
  return (
    <>
      {divider && <div className="my-1 border-t border-slate-200" />}
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-primary-500 hover:translate-x-1 transition-all rounded-lg mx-1"
      >
        {icon && <span className="w-5 text-center">{icon}</span>}
        {children}
      </button>
    </>
  );
}
