import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export async function authMiddleware(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
        const session = await prisma.session.findUnique({
            where: {
                sessionToken: token,
            },
        });

        if (!session) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.userId,
            },
        });
        return user;
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return null;
    }
}