const db = require('../db');

async function auditLog({
  userId,
  action,
  entity,
  entityId = null,
  metadata = {},
  req
}) {
  try {
    await db.query(
      `INSERT INTO audit_logs
       (user_id, action, entity, entity_id, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        action,
        entity,
        entityId,
        metadata,
        req.ip,
        req.headers['user-agent']
      ]
    );
  } catch (err) {
    // IMPORTANT: audit logging must NEVER break business logic
    console.error('AUDIT LOG FAILED:', err);
  }
}

module.exports = { auditLog };
