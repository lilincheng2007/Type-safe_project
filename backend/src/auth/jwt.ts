import jwt from 'jsonwebtoken'
import type { UserRole } from '../types.js'

const SECRET = process.env.JWT_SECRET ?? 'dev-delivery-jwt-secret-change-me'

export interface JwtPayload {
  sub: string
  role: UserRole
}

export function signToken(username: string, role: UserRole) {
  return jwt.sign({ sub: username, role }, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, SECRET) as JwtPayload
  return decoded
}
