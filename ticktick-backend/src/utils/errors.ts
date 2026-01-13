export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'EMAIL_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_REFRESH'
  | 'TASK_NOT_FOUND'
  | 'LIST_NOT_FOUND'
  | 'TAG_NOT_FOUND'
  | 'SMARTLIST_NOT_FOUND'
  | 'HABIT_NOT_FOUND'
  | 'SYNC_CONFLICT'

export class ApiError extends Error {
  status: number
  code: ApiErrorCode
  details?: any

  constructor(status: number, code: ApiErrorCode, message?: string, details?: any) {
    super(message || code)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function err(code: ApiErrorCode, message?: string, details?: any) {
  return { error: { code, message: message || code, details } }
}
