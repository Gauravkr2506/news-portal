import 'server-only'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // set true after configuring SMTP
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url)
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url)
    },
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    admin({
      adminRole: ['admin', 'owner'],
      defaultRole: 'user',
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'https://newsedition.in',
  ],
})

export type Auth = typeof auth
