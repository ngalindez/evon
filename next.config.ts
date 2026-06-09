import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep server-only packages out of the client bundle (defense-in-depth for the
  // app -> server -> (connectors|infra|lib) dependency rule). See CLAUDE.md.
  serverExternalPackages: ['@prisma/client'],
}

export default nextConfig
