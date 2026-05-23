import { prisma } from '../../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { authenticate } from '../../../../../lib/authMiddleware'

export async function POST(req, {params}) {
    const { id } = await params 
    const auth = authenticate(req)
    if (auth.error) return NextResponse.json({error:auth.error},{status:auth.status})
    
    try {
    const groupId = parseInt(id)
    const body = await req.json()
    const { userId } = body 

    await prisma.groupMember.create({
        data:{
            groupId,
            userId
        }
    })
    
    return NextResponse.json({message:'Member added!'},{status:201})

    } catch (error) {return NextResponse.json({ error: error.message }, { status: 500 })}
}

export async function DELETE(req,{params}) {
    const {id} = await params 
    const auth = authenticate(req)
    if (auth.error) return NextResponse.json({error:auth.error},{status:auth.status})
    
    try {
    const groupId = parseInt(id)
    const body = await req.json()
    const { userId } = body 

    await prisma.groupMember.delete({
        where:{
            groupId_userId:{
                groupId,
                userId
            }
        
        }
    })
    return NextResponse.json({message:'Member removed!'},{status:201})

    } catch(error) {return NextResponse.json({ error: error.message }, { status: 500 })}

}