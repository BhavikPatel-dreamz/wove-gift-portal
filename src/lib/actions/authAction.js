import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export async function login(req) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) {
            return {
                success: false,
                message: "All fields are required",
                status: 400
            }
        }

        // Use a generic error message to prevent user enumeration attacks.
        const invalidCredentialsResponse = {
            success: false,
            message: "Invalid email or password",
            status: 401
        };

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return invalidCredentialsResponse;
        }

        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
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
            }),
            prisma.user.update({
                where: { id: user.id },
                data: { isVerify: true }
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
            message: "Internal server error",
            status: 500
        }
    }
}

export async function registration(req, res) {
    try {
        const body = await req.json();
        const { email, firstName, lastName, password, phone } = body;
        if (!email || !firstName || !lastName || !password) {
            return {
                success: false,
                message: "All fields are required"
            }
        }
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (existingUser) {
            return {
                success: false,
                message: "User already exists"
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email: email,
                firstName: firstName,
                lastName: lastName,
                password: hashedPassword,
                phone: phone,
                role: "customer",
                isActive: true
            }
        });
        const { password: _, ...userWithoutPassword } = newUser;
        return {
            success: true,
            user: userWithoutPassword
        }

    } catch (error) {

    }
}