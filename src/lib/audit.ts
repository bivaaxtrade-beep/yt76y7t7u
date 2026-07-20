import { run } from '../db/mysql-db.ts';
import logger from './logger.ts';

export async function createAuditLog(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any,
  ipAddress?: string
) {
  try {
    await run(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (err) {
    logger.error('Failed to create audit log:', err);
  }
}

export async function logLogin(userId: string, ipAddress?: string, userAgent?: string, status: string = 'success') {
  try {
    await run(
      `INSERT INTO login_history (user_id, ip_address, user_agent, status)
       VALUES (?, ?, ?, ?)`,
      [userId, ipAddress, userAgent, status]
    );
  } catch (err) {
    logger.error('Failed to log login:', err);
  }
}

