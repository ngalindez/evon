'use client'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useInjectedStyles } from './useInjectedStyles'

const CSS = `
.evon-btn {
  --_bg: var(--brand);
  --_fg: var(--brand-on);
  --_bd: transparent;
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans); font-weight: var(--weight-semibold);
  line-height: 1; white-space: nowrap; text-decoration: none;
  border: 1px solid var(--_bd); border-radius: var(--radius-button);
  background: var(--_bg); color: var(--_fg);
  cursor: pointer; user-select: none;
  transition: var(--transition-control);
}
.evon-btn:active { transform: translateY(1px); }
.evon-btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.evon-btn[disabled], .evon-btn[aria-disabled="true"] {
  cursor: not-allowed; opacity: 0.5; transform: none;
}
.evon-btn--sm { height: 32px; padding: 0 var(--space-3); font-size: var(--text-sm); }
.evon-btn--md { height: 40px; padding: 0 var(--space-4); font-size: var(--text-sm); }
.evon-btn--lg { height: 48px; padding: 0 var(--space-6); font-size: var(--text-base); }
.evon-btn--full { width: 100%; }
.evon-btn--primary { --_bg: var(--brand); --_fg: var(--brand-on); }
.evon-btn--primary:hover { --_bg: var(--brand-hover); }
.evon-btn--primary:active { --_bg: var(--brand-active); }
.evon-btn--secondary { --_bg: var(--surface-card); --_fg: var(--text-primary); --_bd: var(--border-default); }
.evon-btn--secondary:hover { --_bg: var(--surface-hover); --_bd: var(--border-strong); }
.evon-btn--ghost { --_bg: transparent; --_fg: var(--text-secondary); --_bd: transparent; }
.evon-btn--ghost:hover { --_bg: var(--surface-hover); --_fg: var(--text-primary); }
.evon-btn--danger { --_bg: var(--danger); --_fg: #fff; }
.evon-btn--danger:hover { --_bg: var(--danger-text); }
.evon-btn--danger:focus-visible { box-shadow: var(--focus-ring-danger); }
.evon-btn__spinner {
  width: 15px; height: 15px; border-radius: 50%;
  border: 2px solid currentColor; border-top-color: transparent;
  animation: evon-btn-spin 0.6s linear infinite;
}
@keyframes evon-btn-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .evon-btn__spinner { animation-duration: 1.2s; } }
`

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: ReactNode
  variant?: Variant
  size?: Size
  iconLeft?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  useInjectedStyles('evon-button-styles', CSS)
  const classes = [
    'evon-btn',
    `evon-btn--${variant}`,
    `evon-btn--${size}`,
    fullWidth ? 'evon-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  const isDisabled = disabled || loading
  return (
    <button type={type} className={classes} disabled={isDisabled} {...rest}>
      {loading && <span className="evon-btn__spinner" aria-hidden="true" />}
      {!loading && iconLeft}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </button>
  )
}
