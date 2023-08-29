import NextAuth, { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({ session, token, user }) => {
      if (process.env.ADMIN_EMAILS.includes(session?.user?.email)) {
        return session
      } else {
        return false
      }
    }
  }
}

export async function isAdminRequest (req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!process.env.ADMIN_EMAILS.includes(session?.user?.email)) {
    res.status(401)
    res.end()
    throw 'not an admin'
  }
}

export default NextAuth(authOptions)
