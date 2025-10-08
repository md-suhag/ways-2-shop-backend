import config from "../config";
import {
  IContactUs,
  ICreateAccount,
  IResetPassword,
} from "../types/emailTemplate";

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: "Verify your account",
    html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
                    <!-- Logo -->
                    <img src="https://i.postimg.cc/g0ntw69p/logo.png" alt="ways2shop Logo" style="display: block; margin: 0 auto 20px; width:150px" />

                    <!-- Greeting -->
                    <h2 style="color: #D0A933; font-size: 24px; margin-bottom: 20px;">Hey, ${values.name}!</h2>

                    <!-- Verification Instructions -->
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for signing up for ways2shop. Please verify your email address to activate your account.</p>

                    <!-- OTP Section -->
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #D0A933; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>

                    <!-- Footer -->
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not sign up for ways2shop, please ignore this email.</p>
                    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2025 ways2shop. All rights reserved.</p>

                </div>
            </body>
        `,
  };

  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: "Reset your password",
    html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <img src="https://i.postimg.cc/g0ntw69p/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #D0A933; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                    </div>
                </div>
            </body>
        `,
  };
  return data;
};

const contactUs = (values: IContactUs) => {
  const data = {
    to: `${config.super_admin.email}`,
    subject: `New Contact Us Message : ${values.subject}`,
    html: `
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="https://i.postimg.cc/7L93vBnG/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <div style="text-align: left;">
            <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">📩 New Contact Us Message</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
              <strong>Name:</strong> ${values.name}
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
              <strong>Email:</strong> ${values.email}
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
              <strong>Subject:</strong> ${values.subject}
            </p>
            <div style="margin-top: 20px; padding: 15px; border-radius: 8px; background-color: #f4f4f4; color: #333; font-size: 15px; line-height: 1.6;">
              <strong>Message:</strong><br />
              ${values.message.replace(/\n/g, "<br/>")}
            </div>
          </div>
        </div>
      </body>
    `,
  };
  return data;
};

interface IDeleteAccount {
  email: string;
  otp: number;
  name: string;
}

const deleteAccountOtp = (values: IDeleteAccount) => {
  const data = {
    to: values.email,
    subject: "Confirm account deletion — One-time code",
    html: `
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
                <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    
                    <!-- Logo -->
                    <img src="https://i.postimg.cc/g0ntw69p/logo.png" alt="ways2shop Logo" style="display: block; margin: 0 auto 20px; width:150px" />

                    <!-- Greeting -->
                    <h2 style="color: #D0A933; font-size: 24px; margin-bottom: 20px;">Hello ${
                      values.name ?? "there"
                    },</h2>

                    <!-- Deletion Instructions -->
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                      You requested to delete your ways2shop account. To confirm this action, enter the one-time code below. This code is valid for 3 minutes.
                    </p>

                    <!-- OTP Section -->
                    <div style="text-align: center;">
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
                        <div style="background-color: #D0A933; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${
                          values.otp
                        }</div>
                        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you did not request account deletion, please ignore this email or contact support immediately.</p>
                    </div>

                    <!-- Footer -->
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not initiate this request, no changes will be made to your account.</p>
                    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2025 ways2shop. All rights reserved.</p>

                </div>
            </body>
        `,
  };

  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  contactUs,
  deleteAccountOtp,
};
