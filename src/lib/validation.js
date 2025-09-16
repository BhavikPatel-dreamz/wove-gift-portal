import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  firstName: z.string().min(1, 'firstName is required').max(100, 'firstName must be less than 100 characters').optional(),
  lastName: z.string().min(1, 'lastName is required').max(100, 'lastName must be less than 100 characters').optional(),
   phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must be less than 15 digits').optional(),
  
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const addBrandSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required').max(100, 'Brand name must be less than 100 characters'),
  logo: z.any().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  tagline: z.string().optional(),
  color: z.string().optional(), 
})

export const updateBrandSchema = z.object({
  id: z.string().min(1, 'Brand ID is required'),
  brandName: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  tagline: z.string().optional(),
  color: z.string().optional()
})

export const deleteBrandSchema = z.object({
  id:z.string().min(1, 'Brand ID is required')
})

export const addOccasionSchema = z.object({
  name: z.string().min(1, 'Occasion name is required').max(100, 'Occasion name must be less than 100 characters'),
  emoji: z.string().min(1, 'Emoji is required'),
  description: z.string().optional().default('false'),
  isActive: z.boolean().optional(),
})

export const updateOccasionSchema = z.object({
  id: z.string().min(1, 'Occasion ID is required'),
  name: z.string().optional(),
  emoji: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const deleteOccasionSchema = z.object({
  id: z.string().min(1, 'Occasion ID is required'),
})