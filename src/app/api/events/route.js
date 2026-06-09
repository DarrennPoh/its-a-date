import { prisma } from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { authenticate } from '../../../lib/authMiddleware'

export async function POST(req) {
  const auth = authenticate(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { title, startTime, endTime, privacy, groupId } = body
    

    if (!title || !startTime || !endTime || !privacy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        privacy,
        groupId: groupId || null,
        users: {
          create: { userId: auth.userId }
        }
      }
    })

    return NextResponse.json({ message: 'Event created!', event }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req) {
  const auth = authenticate(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const userEvents = await prisma.userEvent.findMany({
      where: { userId: auth.userId },
      include: { event: true }
    })

    const events = userEvents.map(ue => ue.event)
    return NextResponse.json({ events })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}