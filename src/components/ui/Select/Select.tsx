'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  id?: string;
}

export const Select = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  icon,
  error,
  id,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={styles.root} ref={selectRef}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      {/* Trigger + Dropdown wrapper — dropdown is positioned relative to this */}
      <div className={styles.triggerWrapper}>
        <button
          type="button"
          id={selectId}
          className={cn(styles.trigger, isOpen && styles.open, error && styles.error)}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={styles.triggerContent}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.triggerText}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>
          <svg
            className={cn(styles.chevron, isOpen && styles.chevronOpen)}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {isOpen && (
          <ul className={styles.dropdown} role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                className={cn(styles.option, value === option.value && styles.optionSelected)}
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleSelect(option.value)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description && (
                  <span className={styles.optionDescription}>{option.description}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Helper text — lives outside the positioned wrapper so dropdown overlays it */}
      {selectedOption?.description && (
        <p className={styles.helperText}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 6.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="7" cy="4.5" r="0.75" fill="currentColor" />
          </svg>
          {selectedOption.description}
        </p>
      )}
    </div>
  );
};
