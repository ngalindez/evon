import { Button } from '@/components/ds/Button'
import { Card } from '@/components/ds/Card'
import { Input } from '@/components/ds/Input'
import { Mail } from 'lucide-react'

export const metadata = { title: 'Ingresar · Evon' }

export default function LoginPage() {
  // TODO(evon): wire to Auth.js signIn('credentials', ...) once authorize() is implemented
  // (src/infra/auth/config.ts). See CLAUDE.md "Auth".
  return (
    <main className="evon-auth">
      <div className="evon-auth__brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/evon-logo.svg" alt="Evon" height={32} />
      </div>
      <Card padded className="evon-auth__card">
        <h1 className="evon-auth__title">Ingresar al panel</h1>
        <p className="evon-auth__subtitle">Acceso para administradores de consorcios.</p>
        <form className="evon-auth__form">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="vos@administracion.com.ar"
            required
            prefix={<Mail size={16} strokeWidth={1.9} />}
          />
          <Input
            label="Contraseña"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          <Button type="submit" fullWidth disabled>
            Ingresar
          </Button>
          <p className="evon-auth__note">
            ¿Olvidaste la contraseña? Escribinos a soporte@evon.com.ar.
          </p>
        </form>
      </Card>
    </main>
  )
}
