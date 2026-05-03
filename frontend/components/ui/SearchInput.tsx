'use client';

import { BiSearch } from 'react-icons/bi';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2.5 pl-10 pr-4 text-sm border-2 border-slate-200 rounded-[10px] focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] bg-white transition-all duration-300"
      />
    </div>
  );
}
