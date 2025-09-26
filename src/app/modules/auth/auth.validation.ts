import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

const createVerifyEmailZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        oneTimeCode: z.number({ required_error: 'One time code is required' })
    })
});

const createLoginZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
        password: z.string({ required_error: 'Password is required' })
    })
});
  
const createForgetPasswordZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
    })
});
  
const createResetPasswordZodSchema = z.object({
    body: z.object({
        newPassword: z.string({ required_error: 'Password is required' }),
        confirmPassword: z.string({
            required_error: 'Confirm Password is required',
        })
    })
});
  
const createChangePasswordZodSchema = z.object({
    body: z.object({
        currentPassword: z.string({
            required_error: 'Current Password is required',
        }),
        newPassword: z.string({ required_error: 'New Password is required' }).min(8,{message:"Minimum password length must be atleast 8"}),
        confirmPassword: z.string({
            required_error: 'Confirm Password is required',
        }).min(8,{message:"Minimum password length must be atleast 8"}),
    })
});
const resendOtpZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email address' }),
    })
});

// social login schema
const createSocialLoginZodSchema = z.object({
  body: z.object({
    appId: z
      .string({ required_error: 'App ID is required' })
      .nonempty('App ID cannot be empty'),
    role:z.enum([USER_ROLES.CUSTOMER,USER_ROLES.PROVIDER])
  }),
});


export const AuthValidation = {
    createVerifyEmailZodSchema,
    createForgetPasswordZodSchema,
    createLoginZodSchema,
    createResetPasswordZodSchema,
    createChangePasswordZodSchema,
    resendOtpZodSchema,
    createSocialLoginZodSchema
};