import { Badge } from '@/components/ds/Badge'
import { Card } from '@/components/ds/Card'
import { ReseedButton } from '@/components/panel/ReseedButton'
import { prisma } from '@/infra/db/client'
import { Database, Lock, Settings as SettingsIcon, User } from 'lucide-react'
import { reseedDemoAction } from './actions'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Configuración · Evon' }

export default async function SettingsPage() {
  const [admin, counts, periodCount] = await Promise.all([
    prisma.buildingAdmin.findFirst({ orderBy: { createdAt: 'asc' } }),
    prisma.$transaction([
      prisma.building.count(),
      prisma.unit.count(),
      prisma.meterDevice.count(),
      prisma.cloudConnection.count(),
      prisma.tariff.count(),
    ]),
    prisma.billingPeriod.count(),
  ])
  const [buildings, units, devices, connections, tariffs] = counts

  const encryptionConfigured = !!process.env.ENCRYPTION_KEY
  const cronConfigured = !!process.env.CRON_SECRET

  return (
    <div className="evk-page">
      <div className="evk-page__head">
        <div>
          <p className="evk-eyebrow">Configuración</p>
          <h1 className="evk-h1">Ajustes</h1>
        </div>
        <Badge tone="warning" dot>
          Auth pendiente
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card
          title="Cuenta"
          subtitle="Administrador con el que se hizo el seed"
          action={<User size={18} strokeWidth={1.9} />}
        >
          {admin ? (
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '8px 16px',
                margin: 0,
              }}
            >
              <dt className="evk-eyebrow" style={{ margin: 0 }}>
                Nombre
              </dt>
              <dd style={{ margin: 0 }}>{admin.name}</dd>
              <dt className="evk-eyebrow" style={{ margin: 0 }}>
                Email
              </dt>
              <dd className="evk-mono" style={{ margin: 0 }}>
                {admin.email}
              </dd>
              <dt className="evk-eyebrow" style={{ margin: 0 }}>
                Auth
              </dt>
              <dd style={{ margin: 0 }}>
                <Badge tone="warning">Pendiente</Badge>
              </dd>
            </dl>
          ) : (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Sin administradores cargados. Re-cargá los datos demo abajo.
            </p>
          )}
        </Card>

        <Card
          title="Estado del piloto"
          subtitle="Conteo de objetos en la base local"
          action={<Database size={18} strokeWidth={1.9} />}
        >
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <CountRow label="Consorcios" value={buildings} />
            <CountRow label="Unidades funcionales" value={units} />
            <CountRow label="Disyuntores" value={devices} />
            <CountRow label="Conexiones al cloud" value={connections} />
            <CountRow label="Tarifas" value={tariffs} />
            <CountRow label="Períodos" value={periodCount} />
          </ul>
        </Card>

        <Card
          title="Infraestructura"
          subtitle="Variables de entorno detectadas"
          action={<Lock size={18} strokeWidth={1.9} />}
        >
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <CountRow
              label="ENCRYPTION_KEY"
              valueNode={
                encryptionConfigured ? (
                  <Badge tone="success">Configurada</Badge>
                ) : (
                  <Badge tone="danger">Falta</Badge>
                )
              }
            />
            <CountRow
              label="CRON_SECRET"
              valueNode={
                cronConfigured ? (
                  <Badge tone="success">Configurado</Badge>
                ) : (
                  <Badge tone="warning">Opcional en local</Badge>
                )
              }
            />
            <CountRow label="Base de datos" valueNode={<Badge tone="brand">Postgres</Badge>} />
            <CountRow label="ORM" valueNode={<Badge tone="neutral">Prisma 7</Badge>} />
          </ul>
        </Card>

        <Card
          title="Datos del piloto"
          subtitle="Restaura el estado inicial del demo"
          action={<SettingsIcon size={18} strokeWidth={1.9} />}
        >
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Borra todos los consorcios, unidades, disyuntores, lecturas, períodos y tarifas, y
            vuelve a cargar los datos de Torres del Río (8 unidades, 7 lecturas).
          </p>
          <ReseedButton action={reseedDemoAction} />
        </Card>
      </div>
    </div>
  )
}

function CountRow({
  label,
  value,
  valueNode,
}: {
  label: string
  value?: number
  valueNode?: React.ReactNode
}) {
  return (
    <li
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 'var(--text-sm)',
      }}
    >
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="evk-mono" style={{ fontWeight: 600 }}>
        {valueNode ?? value}
      </span>
    </li>
  )
}
