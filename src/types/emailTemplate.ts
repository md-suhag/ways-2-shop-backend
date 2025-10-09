export interface ICreateAccount {
  name: string;
  email: string;
  otp: number;
}

export interface IResetPassword {
  email: string;
  otp: number;
}

export interface IContactUs {
  name: string;
  email: string;
  subject: string;
  message: string;
}
export interface ISendOtp {
  email: string;
  otp: number;
  name: string;
}
