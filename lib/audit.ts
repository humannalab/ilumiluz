/**
 * Ações auditáveis no ilumiluz-store.
 * Adaptado do Bartho Finance — domínio trocado de finanças para loja.
 */

export const AuditAction = {
  // Auth
  AUTH_LOGIN_SUCCESS:      'auth.login.success',
  AUTH_LOGIN_FAILED:       'auth.login.failed',
  AUTH_LOGIN_FAILURE:      'auth.login.failure',
  AUTH_LOGIN_LOCKED:       'auth.login.locked',
  AUTH_LOGOUT:             'auth.logout',
  AUTH_SIGNUP:             'auth.signup',
  AUTH_SIGNUP_SUCCESS:     'auth.signup.success',
  AUTH_PASSWORD_RESET:     'auth.password.reset',
  AUTH_PASSWORD_CHANGED:   'auth.password.changed',
  AUTH_TOTP_ENABLED:       'auth.totp.enabled',
  AUTH_TOTP_DISABLED:      'auth.totp.disabled',
  AUTH_TOTP_VERIFIED:      'auth.totp.verified',
  AUTH_2FA_SUCCESS:        'auth.2fa.success',
  AUTH_2FA_FAILURE:        'auth.2fa.failure',
  AUTH_2FA_BACKUP_USED:    'auth.2fa.backup_used',
  AUTH_NEW_DEVICE:         'auth.new_device',
  AUTH_ACCOUNT_LOCKED:     'auth.account.locked',

  // Carrinho
  CART_ITEM_ADDED:         'cart.item.added',
  CART_ITEM_REMOVED:       'cart.item.removed',
  CART_CLEARED:            'cart.cleared',
  CART_CHECKOUT_START:     'cart.checkout.start',

  // Pedidos
  ORDER_CREATED:           'order.created',
  ORDER_PAID:              'order.paid',
  ORDER_PAYMENT_FAILED:    'order.payment.failed',
  ORDER_CANCELLED:         'order.cancelled',
  ORDER_REFUNDED:          'order.refunded',
  ORDER_SHIPPED:           'order.shipped',
  ORDER_DELIVERED:         'order.delivered',

  // Conta do usuário
  USER_PROFILE_UPDATED:    'user.profile.updated',
  USER_ADDRESS_ADDED:      'user.address.added',
  USER_ADDRESS_REMOVED:    'user.address.removed',
  USER_ACCOUNT_DELETED:    'user.account.deleted',
  USER_DATA_EXPORTED:      'user.data.exported',

  // Admin
  ADMIN_ORDER_UPDATED:     'admin.order.updated',
  ADMIN_AUDIT_VIEWED:      'admin.audit.viewed',
} as const

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction]

import { db as prisma } from './db'
import { Prisma } from '@prisma/client'

interface LogAuditParams {
  userId?:    string
  action:     AuditActionType
  metadata?:  Prisma.InputJsonObject
  ipAddress?: string | null
  ip?:        string | null  // alias — aceito de código legado
  userAgent?: string | null
}

export async function logAudit({
  userId,
  action,
  metadata,
  ipAddress,
  ip,
  userAgent,
}: LogAuditParams): Promise<void> {
  // Falha silenciosa — auditoria nunca deve quebrar o fluxo principal
  try {
    await prisma.auditLog.create({
      data: { userId, action, metadata, ipAddress: ipAddress ?? ip ?? null, userAgent },
    })
  } catch (err) {
    console.error('[audit] Failed to log action', action, err)
  }
}
