'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchableSelectOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  maxDisplay?: number;
  onCreateNew?: (newValue: string) => Promise<SearchableSelectOption | void>;
  isLoading?: boolean;
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  searchable = true,
  maxDisplay = 5,
  onCreateNew,
  isLoading = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allOptions, setAllOptions] = useState(options);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAllOptions(options);
  }, [options]);

  const filteredOptions = allOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedOptions = filteredOptions.slice(0, maxDisplay);
  const selectedOption = allOptions.find(opt => opt.value === value);

  const handleSelect = (optValue: string | number) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateNew = async () => {
    if (!searchTerm.trim() || !onCreateNew) return;
    try {
      setIsCreating(true);
      const newOption = await onCreateNew(searchTerm.trim());
      if (newOption) {
        setAllOptions([...allOptions, newOption]);
        handleSelect(newOption.value);
      }
      setSearchTerm('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full px-4 py-2 text-left bg-white border border-slate-300 rounded-lg shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
        >
          <span className={selectedOption ? 'text-slate-900' : 'text-slate-500'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg">
            {searchable && (
              <div className="p-3 border-b border-slate-200">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {displayedOptions.length > 0 ? (
                displayedOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-100 transition-colors text-sm ${
                      value === opt.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  {searchTerm && onCreateNew ? 'No results. Click to create new.' : 'No options available'}
                </div>
              )}

              {searchTerm && onCreateNew && filteredOptions.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="w-full text-left px-4 py-2.5 border-t border-slate-200 bg-primary-50 hover:bg-primary-100 text-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : `+ Create "${searchTerm}"`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
