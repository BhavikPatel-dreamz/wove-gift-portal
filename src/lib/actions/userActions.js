import prisma from '../prisma';
import { authMiddleware } from '../middleware/apiAuth';


export async function userList(req) {
    try {
        const sessionData = await authMiddleware(req)
        if (!sessionData) {
            return {
                success: false,
                message: "Unauthorized"
            }
        }
        const userData = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
            }
        });
        return { userData, success: true };

    } catch (error) {
        return {
            success: false,
            message: "Internal server error"
        }
    }
}

