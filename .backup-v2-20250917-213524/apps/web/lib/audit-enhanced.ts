interface AuditContext {
  userId?: string
  organizationId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
}

interface AuditEvent {
  action: string
  resource: string
  timestamp: string
  context: AuditContext
  metadata?: Record<string, any>
}

export function createAuditEvent(
  action: string,
  resource: string,
  context: AuditContext,
  metadata: Record<string, any> = {}
): AuditEvent {
  return {
    action,
    resource,
    timestamp: new Date().toISOString(),
    context: { ...context },
    metadata: { ...metadata }
  }
}

export function logAuditEvent(event: AuditEvent) {
  console.log('Audit Event:', event)
}

export function enhanceAuditContext(
  baseContext: AuditContext,
  additional: Record<string, any> = {}
): AuditContext {
  return {
    ...baseContext,
    ...additional
  }
}
