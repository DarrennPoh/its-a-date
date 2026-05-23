import { prisma } from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { authenticate } from '../../../../lib/authMiddleware'

export async function GET(req, {params}) {
    const {id} = await params 
    const auth = authenticate (req)
    if (auth.error) return NextResponse.json({error:auth.error},{status:auth.status })
    
    try {
    const groupId = parseInt(id)
    const group = await prisma.group.findUnique({
        where :{id:groupId},
        include:{
            members:{
                include:{user:true}
            }
        }
    })

    if (!group) {
        return NextResponse.json ({message : "Not found "},{status : 404}
        )}
    return NextResponse.json({group})

    }
    
   catch (error) {
    return NextResponse.json({error:error.message},{status:500})
   }
}