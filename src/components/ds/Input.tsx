'use client'
import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

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
