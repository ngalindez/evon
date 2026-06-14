'use client'
import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-field { display: flex; flex-direction: column; gap: 6px; }
.evon-field__label { font: var(--type-label); color: var(--text-primary); }
.evon-field__label .req { color: var(--danger); margin-left: 2px; }
.evon-field__hint { font: var(--type-body-sm); color: var(--text-tertiary); }
.evon-field__error { font: var(--type-body-sm); color: var(--danger-text); }
.evon-input-wrap {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface-card); border: 1px solid var(--border-default);
  border-radius: var(--radius-input); box-shadow: var(--shadow-inset);
  padding: 0 12px; transition: var(--transition-control);
}
.evon-input-wrap:focus-within { border-color: var(--brand); box-shadow: var(--focus-ring); }
.evon-input-wrap--error { border-color: var(--danger); }
.evon-input-wrap--error:focus-within { box-shadow: var(--focus-ring-danger); }
.evon-input-wrap--disabled { background: var(--surface-sunken); opacity: 0.7; cursor: not-allowed; }
.evon-input-wrap--sm { height: 36px; }
.evon-input-wrap--md { height: 42px; }
.evon-input {
  flex: 1; min-width: 0; border: 0; background: transparent; outline: none;
  font-family: var(--font-sans); font-size: var(--text-sm); color: var(--text-primary);
}
.evon-input::placeholder { color: var(--text-disabled); }
.evon-input--mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.evon-input-wrap .adorn { display: inline-flex; align-items: center; color: var(--text-tertiary); font-size: var(--text-sm); }
.evon-input-wrap .adorn svg { width: 16px; height: 16px; }
`

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  size?: 'sm' | 'md'
  prefix?: ReactNode
  suffix?: ReactNode
  mono?: boolean
}

export function Input({
  label,
  hint,
  error,
  required = false,
  size = 'md',
  prefix,
  suffix,
  mono = false,
  disabled = false,
  id,
  className = '',
  ...rest
}: InputProps) {
  useInjectedStyles('evon-input-styles', CSS)
  const reactId = useId()
  const inputId = id || reactId
  const wrapClasses = [
    'evon-input-wrap',
    `evon-input-wrap--${size}`,
    error ? 'evon-input-wrap--error' : '',
    disabled ? 'evon-input-wrap--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={['evon-field', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="evon-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      <div className={wrapClasses}>
        {prefix && <span className="adorn">{prefix}</span>}
        <input
          id={inputId}
          className={['evon-input', mono ? 'evon-input--mono' : ''].filter(Boolean).join(' ')}
          disabled={disabled}
          aria-invalid={!!error}
          {...rest}
        />
        {suffix && <span className="adorn">{suffix}</span>}
      </div>
      {error ? (
        <span className="evon-field__error">{error}</span>
      ) : (
        hint && <span className="evon-field__hint">{hint}</span>
      )}
    </div>
  )
}
