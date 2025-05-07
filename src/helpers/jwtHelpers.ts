import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const generateToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: string
) =>
  jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn } as SignOptions);

const verifyToken = (token: string, secret: Secret) =>
  jwt.verify(token, secret) as JwtPayload;

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
