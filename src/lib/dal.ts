import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { Role } from '@/types'

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export const requireSession = cache(async () => {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
})

export const requireRole = cache(async (...roles: Role[]) => {
  const session = await requireSession()
  const userRole = (session.user.role as Role) || 'user'
  if (!roles.includes(userRole)) redirect('/')
  return session
})

export const requireAdmin = cache(async () => {
  return requireRole('admin', 'owner')
})

export const requireOwner = cache(async () => {
  return requireRole('owner')
})

export function isAdmin(role?: string | null): boolean {
  return role === 'admin' || role === 'owner'
}

export function isOwner(role?: string | null): boolean {
  return role === 'owner'
}
