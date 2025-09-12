import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/apiAuth';


export async function login(req) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) {
            return {
                success: false,
                message: "All fields are required"
            }
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            return {
                success: false,
                message: "User not found"
            }
        }
        // Use a generic error message to prevent user enumeration attacks.
        const invalidCredentialsResponse = {
            success: false,
            message: "Invalid email or password"
        };

        const comparePassword = await bcrypt.compare(password, user.password);
        if (!user || !comparePassword) {
            return invalidCredentialsResponse;
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // Atomically delete old sessions and create a new one.
        await prisma.$transaction([
            prisma.session.deleteMany({ where: { userId: user.id } }),
            prisma.session.create({
                data: {
                    userId: user.id,
                    sessionToken: token,
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
                }
            })
        ])
        return {
            success: true,
            token: token
        }
    } catch (error) {
        console.error("Login error:", error.message);
        return {
            success: false,
            message: "Internal server error"
        }
    }
}

export async function userList(req,res) {
    try {
        const user = await authMiddleware(req,res)
        if (!user) {
            return {
                success: false,
                message: "Unauthorized"
            }
        }
        const userData = await prisma.user.findMany();
        // It's good practice to not expose password hashes, even to other authenticated users.
        userData.forEach(u => delete u.password);
        return { userData, success: true };

    } catch (error) {
        return {
            success: false,
            message: "Internal server error"
        }
    }
}