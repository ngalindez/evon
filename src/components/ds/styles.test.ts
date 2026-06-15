import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const dsDir = path.resolve(process.cwd(), 'src/components/ds')
const dsCssPath = path.resolve(process.cwd(), 'src/styles/ds.css')
const globalsCssPath = path.resolve(process.cwd(), 'src/app/globals.css')

// One base class per design-system component. Guarantees every component's
// styles were migrated to the shipped stylesheet rather than dropped.
const COMPONENT_BASE_SELECTORS = [
  '.evon-alert',
  '.evon-badge',
  '.evon-btn',
  '.evon-card',
  '.evon-field',
  '.evon-progress',
  '.evon-stat',
  '.evon-statusdot',
  '.evon-tag',
]

describe('design-system styles ship with SSR (no FOUC)', () => {
  it('does not inject component styles at runtime', () => {
    const components = readdirSync(dsDir).filter((f) => f.endsWith('.tsx'))
    expect(components.length).toBeGreaterThan(0)
    for (const file of components) {
      const source = readFileSync(path.join(dsDir, file), 'utf8')
      expect(source, `${file} must not inject styles at runtime`).not.toContain('useInjectedStyles')
    }
    expect(existsSync(path.join(dsDir, 'useInjectedStyles.ts'))).toBe(false)
  })

  it('defines every component class in the shipped stylesheet', () => {
    expect(existsSync(dsCssPath)).toBe(true)
    const css = readFileSync(dsCssPath, 'utf8')
    for (const selector of COMPONENT_BASE_SELECTORS) {
      expect(css, `ds.css must define ${selector}`).toContain(selector)
    }
  })

  it('imports the design-system stylesheet from globals.css', () => {
    expect(readFileSync(globalsCssPath, 'utf8')).toContain('ds.css')
  })
})
