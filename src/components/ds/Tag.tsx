'use client'
import type { HTMLAttributes, ReactNode } from 'react'

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode
  mono?: boolean
  children?: ReactNode
}

export function Tag({ children, icon, mono = false, className = '', ...rest }: TagProps) {
  const classes = ['evon-tag', mono ? 'evon-tag--mono' : '', className].filter(Boolean).join(' ')
  return (
    <span className={classes} {...rest}>
      {icon}
      {children}
    </span>
  )
}
