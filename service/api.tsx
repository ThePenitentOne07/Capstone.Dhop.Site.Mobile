import api, { apiNoToken } from "../config/axios";
import { LoginFormValues } from "../models/login";
import { SignUpFormValues } from "../models/signUp";
export const loginUser = (values: LoginFormValues) => {
    return apiNoToken.post("/auth/login", values);
  };
  export const signUpUser = (values: SignUpFormValues) => {
    return apiNoToken.post("/auth/register", values);
  };
  export const otpSignUp = (email: string, otp: string) => {
    return apiNoToken.post("/auth/otp", { email, otp });
  };
  