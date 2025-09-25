import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

const createAdminZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        password: z.string({ required_error: 'Password is required' }),
        role: z.string({ required_error: 'Role is required' })
    })
});
const createUserZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        password: z.string({ required_error: 'Password is required' }).min(8,{message:"Password length should be minimum 8"}),
        contact:z.string({required_error:"Contact is required"}),
        role: z.enum([USER_ROLES.CUSTOMER,USER_ROLES.PROVIDER]),
        businessCategory: z.array(z.string()).optional()
    })
});

export const UserValidation = { createAdminZodSchema,createUserZodSchema };  