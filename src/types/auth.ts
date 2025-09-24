export interface IVerifyEmail   {
    email: string;
    oneTimeCode: number;
};

export interface ILoginData   {
    email: string;
    password: string;
};

export interface IAuthResetPassword   {
    newPassword: string;
    confirmPassword: string;
};

export interface IChangePassword   {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};
  