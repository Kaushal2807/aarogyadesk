import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export default function FormInput({ label, error, required, id, className = '', ...props }: FormInputProps) {
  const displayLabel = label ? label.replace(/\s*\*+$/, '').trim() : '';
  const isRequired = required || (label && label.includes('*'));

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-600 mb-2">
        {displayLabel} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        className={`w-full py-2.5 px-3.5 text-sm border-2 rounded-[10px] bg-white transition-all duration-300 focus:outline-none ${
          error ? 'border-red-400 focus:ring-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-slate-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
        }`}
        required={required}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
