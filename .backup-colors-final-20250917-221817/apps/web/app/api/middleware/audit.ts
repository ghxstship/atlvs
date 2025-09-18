import { NextRequest } from 'next/server'

interface AuditContext {
  ip: string
  userAgent: string
}

export function createAuditContext(request: NextRequest): AuditContext {
  return {
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  }
}

export function logAuditEvent(
  action: string,
  context: AuditContext,
  metadata?: Record<string, any>
) {
  console.log('Audit Event:', {
    action,
    timestamp: new Date().toISOString(),
    ip: context.ip,
    userAgent: context.userAgent,
    metadata
  })
}
