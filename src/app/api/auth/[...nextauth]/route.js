import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "../../../../lib/db"
import { createSession } from "../../../../lib/action/userAction/session"
import { randomUUID } from "node:crypto"

const OAUTH_PLACEHOLDER_PASSWORD_HASH =
  "$2b$12$3BKopnVxYSe3pkvi6eCwCu/31mhv6khNrIwYkQzenMV5LCaKb85.e"

function normalizeDbUser(user) {
  if (!user) {
    return null
  }

  return {
    ...user,
    emailVerified: user.emailVerified ?? null,
    image: user.image ?? user.avatar ?? null,
  }
}

const adapter = {
  ...PrismaAdapter(prisma),
  async getUserByAccount({ provider, providerAccountId }) {
    if (prisma.account?.findUnique) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      })

      return normalizeDbUser(account?.user)
    }

    const users = await prisma.$queryRaw`
      SELECT u.*
      FROM "accounts" a
      INNER JOIN "users" u ON u."id" = a."userId"
      WHERE a."provider" = ${provider}
      AND a."providerAccountId" = ${providerAccountId}
      LIMIT 1
    `

    return normalizeDbUser(users?.[0] || null)
  },
  async createUser(data) {
    const fullName = (data?.name || "").trim()
    const [firstNameFromName, ...lastNameParts] = fullName
      .split(/\s+/)
      .filter(Boolean)

    if (!data?.email) {
      throw new Error("Google account did not provide an email address")
    }

    return prisma.user.create({
      data: {
        email: data.email,
        firstName: firstNameFromName || "Google",
        lastName: lastNameParts.join(" ") || "User",
        password: OAUTH_PLACEHOLDER_PASSWORD_HASH,
        avatar: data.image || null,
        role: "CUSTOMER",
        isActive: true,
        isVerified: true,
      },
    })
  },
  async linkAccount(data) {
    if (prisma.account?.create) {
      return prisma.account.create({ data })
    }

    const accountId = randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "accounts" (
        "id",
        "userId",
        "type",
        "provider",
        "providerAccountId",
        "refresh_token",
        "access_token",
        "expires_at",
        "token_type",
        "scope",
        "id_token",
        "session_state",
        "oauth_token_secret",
        "oauth_token",
        "refresh_token_expires_in"
      )
      VALUES (
        ${accountId},
        ${data.userId},
        ${data.type},
        ${data.provider},
        ${data.providerAccountId},
        ${data.refresh_token ?? null},
        ${data.access_token ?? null},
        ${data.expires_at ?? null},
        ${data.token_type ?? null},
        ${data.scope ?? null},
        ${data.id_token ?? null},
        ${data.session_state ?? null},
        ${data.oauth_token_secret ?? null},
        ${data.oauth_token ?? null},
        ${data.refresh_token_expires_in ?? null}
      )
      ON CONFLICT ("provider", "providerAccountId")
      DO UPDATE SET
        "userId" = EXCLUDED."userId",
        "refresh_token" = EXCLUDED."refresh_token",
        "access_token" = EXCLUDED."access_token",
        "expires_at" = EXCLUDED."expires_at",
        "token_type" = EXCLUDED."token_type",
        "scope" = EXCLUDED."scope",
        "id_token" = EXCLUDED."id_token",
        "session_state" = EXCLUDED."session_state",
        "oauth_token_secret" = EXCLUDED."oauth_token_secret",
        "oauth_token" = EXCLUDED."oauth_token",
        "refresh_token_expires_in" = EXCLUDED."refresh_token_expires_in"
    `

    return data
  },
}

export const authOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async signIn() {
      return true
    }
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.id) {
        await createSession(user.id)
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  debug: true, // Enable debug mode to see detailed errors
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
