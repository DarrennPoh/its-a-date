import { prisma } from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { authenticate } from '../../../../lib/authMiddleware'

export async function GET(req, { params }) {
  const { id } = await params 
  const auth = authenticate(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const eventId = parseInt(id)
    const userEvent = await prisma.userEvent.findUnique({
      where: {
        userId_eventId: {
          userId: auth.userId,
          eventId
        }
      },
      include: { event: true }
    })

    if (!userEvent) {
        return NextResponse.json({error:'Event not found'},{status:404})
    }   return NextResponse.json({event:userEvent.event})

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


export async function DELETE(req,{params}) {
 const { id } = await params
 const auth = authenticate(req)
 if (auth.error) return NextResponse.json ({error:auth.error},{status:auth.status})

 try {
    const eventId = parseInt(id)
    const userEvent = await prisma.userEvent.findUnique({
        where:{
            userId_eventId: {
                userId:auth.userId,
                eventId
            }
        }
    })
    if (!userEvent) {
        return NextResponse.json({error:'Event not found'},{status:404})
    }

    await prisma.userEvent.delete({
        where:{userId_eventId:{
            userId:auth.userId,
            eventId
        }}
    }); // deleting userEvent link first

    await prisma.event.delete({
        where:{id:eventId}
    }); // deleting actual event 
 
    return NextResponse.json({message:'Event deleted'})
 }

 catch (error) {
    return NextResponse.json({error:error.message},{status:500})
 }
    
}

export async function PUT(req, { params }) {
  const { id } = await params
  const auth = authenticate(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const eventId = parseInt(id)
    const { title, startTime, endTime, privacy } = await req.json()

    // 1. Verify the event actually belongs to the user trying to modify it
    const userEvent = await prisma.userEvent.findUnique({
      where: {
        userId_eventId: {
          userId: auth.userId,
          eventId
        }
      }
    })

    if (!userEvent) {
      return NextResponse.json({ error: 'Unauthorized or event not found' }, { status: 404 })
    }

    // 2. Perform database update on the target event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        privacy
      }
    })

    return NextResponse.json({ message: 'Event updated successfully', event: updatedEvent }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}