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
  maxDisplay = 100,
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

  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 140),
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const displayLabel = label ? label.replace(/\s*\*+$/, '').trim() : '';
  const isRequired = required || (label && label.includes('*'));

  return (
    <div className={`relative ${displayLabel ? "space-y-1.5" : "w-full"}`} ref={containerRef}>
      {displayLabel ? (
        <label className="block text-xs font-medium text-slate-700">
          {displayLabel}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      ) : null}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="w-full px-3 py-1.5 text-xs text-left bg-white border border-slate-300 rounded-lg shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
        >
          <span className={selectedOption ? 'text-slate-900 font-medium truncate pr-1' : 'text-slate-400 truncate pr-1'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {isOpen && menuCoords && (
          <div
            className="fixed z-[99999] bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden animate-[dropdownFadeIn_0.15s_ease]"
            style={{
              top: `${menuCoords.top}px`,
              left: `${menuCoords.left}px`,
              width: `${menuCoords.width}px`,
              maxWidth: '260px',
            }}
          >
            {searchable && (
              <div className="p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                />
              </div>
            )}

            <div
              className="max-h-36 overflow-y-auto overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {displayedOptions.length > 0 ? (
                displayedOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3.5 py-2 hover:bg-primary-50 hover:text-primary-600 transition-colors text-xs ${
                      value === opt.value ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400 text-center">
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
