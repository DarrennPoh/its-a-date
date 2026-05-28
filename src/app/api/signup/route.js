import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();

    const { username, email, password } = body

    const existingUser = await prisma.user.findUnique({ where: { username } });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const existingEmail = await prisma.user.findUnique({where:{email}});
    if (existingEmail) {
      return NextResponse.json({error:'Email already in use'},{status:400});
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword }
    });

    return NextResponse.json({ message: 'User created!', userId: user.id }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}