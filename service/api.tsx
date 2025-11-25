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
  return apiNoToken.post("/auth/verify-otp", { email, otp });
};

export const getUserInfo = () => {
  return api.get("/users/info");
};

export interface NotificationListParams {
  pageNo?: number;
  pageSize?: number;
}

export interface NotificationItemResponse {
  id: string;
  userUUID: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: NotificationItemResponse[];
}

export const getNotifications = ({
  pageNo = 1,
  pageSize = 20,
}: NotificationListParams = {}) => {
  return api.get<NotificationListResponse>("/notifications", {
    params: { pageNo, pageSize },
  });
};

export const markNotificationAsRead = (notificationId: string) => {
  return api.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = () => {
  return api.patch("/notifications/read-all");
};

// Fetch list of users with CHOREOGRAPHY role
export interface ChoreographyUsersQuery {
  pageNo?: number;
  pageSize?: number;
  areas?: number | null;
  minExperience?: number | null;
  maxExperience?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  name?: string;
}

export const getChoreographyUsers = ({
  pageNo = 1,
  pageSize = 10,
  areas,
  minExperience,
  maxExperience,
  minPrice,
  maxPrice,
  name,
}: ChoreographyUsersQuery = {}) => {
  const params = {
    pageNo,
    pageSize,
    areas: areas ?? undefined,
    minExperience: minExperience ?? undefined,
    maxExperience: maxExperience ?? undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
    name: name?.trim() || undefined,
  };
  console.log("API getChoreographyUsers params:", params);
  return api.get(`/users/CHOREOGRAPHY`, { params });
};

export interface GetChoreographyScheduleParams {
  id: number | string;
  startTime: string;
  endTime: string;
}

export const getChoreographySchedule = ({
  id,
  startTime,
  endTime,
}: GetChoreographyScheduleParams) => {
  const params = { id, startTime, endTime };
  console.log("API getChoreographySchedule params:", params);
  return api.get(`/choreography/schedule`, { params });
};
// Get choreographer details by ID
export const getChoreographerById = (choreographerId: string) => {
  return api.get(`/choreography/${choreographerId}`);
};

// Calculate total price for a choreographer booking
export const getChoreographerBookingTotalPrice = (
  payload: ChoreographerBooking
) => {
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

export const getBookingById = (bookingId: string | number) => {
  return api.get(`/booking`, {
    params: { bookingId },
  });
};

// Accept a choreographer booking
export const acceptChoreographerBooking = (
  bookingId: string,
  statusName: string = "BOOKING_ACTIVATE"
) => {
  // console.log("acceptChoreographerBooking request", { bookingId, statusName });
  return api.patch(
    `/booking/choreographer/status`,
    null,
    {
      params: { bookingId, statusName },
    }
  );
};

export const cancelChoreographerBooking = (bookingId: string | number) => {
  return api.patch(`/booking/cancel`, null, {
    params: { bookingId },
  });
};
// Check-in training session via QR
export const qrTrainingSession = (
  trainingSessionId: number,
  userId: number
) => {
  console.log("qrTrainingSession request", { trainingSessionId, userId });
  return api.post(`/training_session`, null, {
    params: { trainingSessionId, userId },
  });
};
// Generate QR for a training session
export const generateTrainingSessionQR = (trainingSessionId: number) => {
  return api.get(`/training_session/generating-QR`, {
    params: { trainingSessionId },
  });
};

export interface BookingFeedbackPayload {
  comment: string;
  rating: number;
  bookingId: number;
}

export const createBookingFeedback = (payload: BookingFeedbackPayload) => {
  return api.post(`/bookingfeedback`, payload);
};

export interface UpdateUserProfilePayload {
  avatar: string;
  name: string;
  phone: string;
}

export const updateUserProfile = (payload: UpdateUserProfilePayload) => {
  return api.patch(`/users/profile`, payload);
};

// Check wallet balance
export const checkUserBalance = () => {
  return api.post(`/wallets/check-balance`);
};