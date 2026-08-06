import { prisma } from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { authenticate } from '../../../../lib/authMiddleware'

export async function GET(req) {
  const auth = authenticate(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: { id: user.id, username: user.username }
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}