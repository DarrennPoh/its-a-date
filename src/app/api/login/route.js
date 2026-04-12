import  {prisma}  from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    // ❌ user not found
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

  const passwordIsValid = bcrypt.compareSync(password ,user.password);
  if (!passwordIsValid) {
    return NextResponse.json(
        {message:"Invalid Password"},
        {status:401}
    );
  }

  const token = jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:"1d"});
  return NextResponse.json({
    token,
    userId:user.id,
    username: user.username
});
 } catch (error) {
    console.log('LOGIN ERROR:',error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}