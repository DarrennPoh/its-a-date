import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export function authenticate(req) {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No token provided', status: 401 }
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, SECRET)
    return { userId: decoded.userId }
  } catch (err) {
    return { error: 'Invalid or expired token', status: 401 }
  }
}