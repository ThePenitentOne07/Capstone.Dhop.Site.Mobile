import api, { apiNoToken } from "../config/axios";
import { LoginFormValues } from "../models/login";
import { SignUpFormValues } from "../models/signUp";
import { ChoreographerBooking } from "../models/choreographerBooking";
export const loginUser = (values: LoginFormValues) => {
    return apiNoToken.post("/auth/login", values);
  };
  export const signUpUser = (values: SignUpFormValues) => {
    return apiNoToken.post("/auth/register", values);
  };
  export const otpSignUp = (email: string, otp: string) => {
    return apiNoToken.post("/auth/otp", { email, otp });
  };
  
  export const getUserInfo = () => {
    return api.get("/users/info");
  };

// Fetch list of users with CHOREOGRAPHY role
export const getChoreographyUsers = (pageNo: number = 1, pageSize: number = 10) => {
  return api.get(`/users/CHOREOGRAPHY`, { params: { pageNo, pageSize } });
};
  
// Calculate total price for a choreographer booking
export const getChoreographerBookingTotalPrice = (payload: ChoreographerBooking) => {
  return api.post(`/booking/choreographer/total-price`, payload);
};
  
// Create a choreographer booking
export const createChoreographerBooking = (payload: ChoreographerBooking) => {
  return api.post(`/booking/choreographer`, payload);
};
// Get list of choreographer bookings
export const getChoreographerBookings = () => {
  return api.get(`/booking/choreographer`);
};
// Accept a choreographer booking
export const acceptChoreographerBooking = (bookingId: string, statusName: string = "BOOKING_ACTIVATE") => {
  console.log('acceptChoreographerBooking request', { bookingId, statusName });
  return api.get(`/booking/choreographer/status`, {params:{bookingId, statusName} });
};
// Check-in training session via QR
export const qrTrainingSession = (trainingSessionId: number, userId: number) => {
  console.log('qrTrainingSession request', { trainingSessionId, userId });
  return api.post(`/training_session`, null, { params: { trainingSessionId, userId } });
};
// Generate QR for a training session
export const generateTrainingSessionQR = (trainingSessionId: number) => {
  return api.get(`/training_session/generating-QR`, { params: { trainingSessionId } });
};

export interface UpdateUserProfilePayload {
  avatar: string;
  name: string;
  phone: string;
}

export const updateUserProfile = (payload: UpdateUserProfilePayload) => {
  return api.patch(`/users/profile`, payload);
};