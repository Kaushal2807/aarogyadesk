import { SelectHTMLAttributes } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export default function FormSelect({ label, options, error, required, placeholder, id, className = '', ...props }: FormSelectProps) {
  const displayLabel = label ? label.replace(/\s*\*+$/, '').trim() : '';
  const isRequired = required || (label && label.includes('*'));

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-600 mb-2">
          {displayLabel} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`w-full py-2.5 px-3.5 text-sm border-2 rounded-[10px] bg-white transition-all duration-300 focus:outline-none ${
          error ? 'border-red-400' : 'border-slate-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
        }`}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
