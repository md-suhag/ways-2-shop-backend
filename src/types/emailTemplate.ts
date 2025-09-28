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
