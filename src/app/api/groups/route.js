import { prisma } from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { authenticate } from '../../../lib/authMiddleware'

export async function POST(req) {
    const auth = authenticate (req)
    if (auth.error) return NextResponse.json({error:auth.error},{status:auth.status })

    try {
    const body = await req.json()
    const {name , privacy, color} = body 
    if (!name || !privacy ) {
        return NextResponse.json (
            {message : "Missing required fields "},
            {status : 400}
        )}
    const group = await prisma.group.create({
        data : {
        name , privacy, color:color || '#3B82F6' , members:{create :{userId:auth.userId}}
        }
    })
    return NextResponse.json ({message:'Group created!',group},{status:201})
    } catch (error) {
    return NextResponse.json ({error:error.message},{status: 500})
    }
}

export async function GET(req) {
    const auth = authenticate (req)
    if (auth.error) return NextResponse.json({error:auth.error},{status:auth.status })
    try {
    const groupMembers = await prisma.groupMember.findMany({
        where: {userId :auth.userId},
        include : {group :true}    
    })
    const members = groupMembers.map(gm => gm.group ) 
    return NextResponse.json ({groups:members})
 }  catch (error){
    return NextResponse.json ({error:error.message},{status: 500})
 }


}
