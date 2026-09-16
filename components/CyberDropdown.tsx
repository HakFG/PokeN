'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  value: string;
  label: string;
}

export type CyberDropdownOption = DropdownOption;

interface CyberDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  theme?: 'cyan' | 'amber';
  className?: string;
  placeholder?: string;
}

export default function CyberDropdown({
  value,
  onChange,
  options,
  theme = 'cyan',
  className = '',
  placeholder = 'Selecionar...',
}: CyberDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isAmber = theme === 'amber';
  const accentBorder = isAmber ? 'border-amber-400/60' : 'border-cyan-400/60';
  const accentGlow = isAmber
    ? 'shadow-[0_0_20px_rgba(251,191,36,0.35)]'
    : 'shadow-[0_0_20px_rgba(34,211,238,0.35)]';
  const chevronStroke = isAmber ? '#FBBF24' : '#22D3EE';
  const activeOptionBg = isAmber
    ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
    : 'bg-cyan-400/20 text-cyan-100 border-cyan-400/40';
  const activeDotBg = isAmber ? 'bg-amber-300 shadow-[0_0_8px_#fbbf24]' : 'bg-cyan-300 shadow-[0_0_8px_#22d3ee]';
  const indicatorDot = isAmber ? 'bg-amber-400' : 'bg-cyan-400';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Botão Trigger Redesenhado em Estilo Pokédex */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
          isOpen
            ? `${accentBorder} ${accentGlow} bg-[#0e1428] text-white`
            : 'border-white/10 bg-[#090D1C]/90 text-slate-200 hover:border-white/25 hover:bg-[#11182D] hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200 ${
              isOpen
                ? `${indicatorDot} shadow-[0_0_6px_currentColor]`
                : 'bg-slate-500 group-hover:bg-slate-300'
            }`}
          />
          <span className="truncate tracking-wide">{selectedOption?.label ?? placeholder}</span>
        </div>

        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
            isOpen
              ? 'border-white/20 bg-white/10'
              : 'border-white/10 bg-white/5 group-hover:border-white/20'
          }`}
        >
          <svg
            className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="none"
            stroke={chevronStroke}
            strokeWidth="2.4"
          >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Popover Flutuante com z-[100] garantido acima de qualquer card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 top-full z-[100] mt-1 max-h-64 w-full min-w-[210px] overflow-y-auto rounded-xl border border-white/20 bg-[#070A18]/98 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${accentGlow} scrollbar-thin`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isAmber
                ? 'rgba(251,191,36,0.5) rgba(15,23,42,0.8)'
                : 'rgba(34,211,238,0.5) rgba(15,23,42,0.8)',
            }}
          >
            <div className="space-y-0.5">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition-all duration-150 ${
                      isSelected
                        ? `${activeOptionBg} border shadow-sm`
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isSelected ? activeDotBg : 'bg-slate-600'
                        }`}
                      />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && (
                      <svg
                        className="h-3.5 w-3.5 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ color: chevronStroke }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
