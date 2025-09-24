import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createToken = (payload: object, secret: Secret, expireTime: any) => {
    const options: SignOptions = {
        expiresIn: expireTime,
    };
    return jwt.sign({ ...payload }, secret, options);
};

const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelper = { createToken, verifyToken };