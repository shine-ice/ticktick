import { db, unwrapInsertedId } from '../../db/knex'

export const SyncRepo = {
  async ensureUserVersionRow(userId: number) {
    const row = await db('sync_user_versions').where({ user_id: userId }).first()
    if (!row) {
      await db('sync_user_versions').insert({
        user_id: userId,
        last_version: 0,
        updated_at: new Date().toISOString()
      })
    }
  },

  async nextVersion(userId: number) {
    await this.ensureUserVersionRow(userId)
    const row = await db('sync_user_versions').where({ user_id: userId }).first()
    const next = Number(row.last_version) + 1
    await db('sync_user_versions')
      .where({ user_id: userId })
      .update({ last_version: next, updated_at: new Date().toISOString() })
    return next
  },

  async recordChange(
    userId: number,
    entityType: string,
    entityId: number,
    op: string,
    version: number,
    payload: any
  ) {
    const inserted = await db('sync_changes').insert({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      op,
      changed_at: new Date().toISOString(),
      version,
      payload_json: payload ? JSON.stringify(payload) : null
    })
    unwrapInsertedId(inserted)
  },

  async pullSince(userId: number, sinceVersion: number, pageSize: number) {
    const rows = await db('sync_changes')
      .where({ user_id: userId })
      .andWhere('version', '>', sinceVersion)
      .orderBy('version', 'asc')
      .limit(pageSize)

    const changes = rows.map((r: any) => ({
      version: r.version,
      entityType: r.entity_type,
      entityId: r.entity_id,
      op: r.op,
      changedAt: r.changed_at,
      payload: r.payload_json ? JSON.parse(r.payload_json) : null
    }))

    const nextSinceVersion = changes.length ? changes[changes.length - 1].version : sinceVersion
    return { changes, nextSinceVersion, hasMore: rows.length === pageSize }
  }
}
