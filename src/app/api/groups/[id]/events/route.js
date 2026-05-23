import { prisma } from '../../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { authenticate } from '../../../../../lib/authMiddleware'

export async function POST (req,{params}) {
    const {id} = await params 
    const auth = authenticate(req)
    if (auth.error) return NextResponse.json({error:auth.error},{status:auth.status})

    try {
        const groupId = parseInt(id)
        const body = await req.json()
        const {title, startTime, endTime, privacy } = body 
        if(!title || !startTime|| !endTime || !privacy )
          {return NextResponse.json({error:'Missing required fields'},{status:400})}
        const members = await prisma.groupMember.findMany({
            where: {groupId}
        })
        const event = await prisma.event.create({
            data :{
                title,
                startTime :new Date(startTime),
                endTime: new Date(endTime),
                privacy,
                groupId,
                users:{
                    create:members.map(member=>({userId:member.userId}))
                }
            }
        })

        return NextResponse.json({message:'Group event created !'},{status:201})

        } catch (error){
        return NextResponse.json({error:error.message},{status:500})

    }
}