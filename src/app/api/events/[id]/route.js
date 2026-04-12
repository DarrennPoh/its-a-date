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