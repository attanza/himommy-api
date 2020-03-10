export interface IUserFromSocialLogin {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role?: string;
  password: string;
  isActive: boolean;
  authProvider: string;
}
