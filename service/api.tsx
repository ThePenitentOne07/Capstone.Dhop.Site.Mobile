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

// Fetch list of users with DANCER role
export const getDancerUsers = ({
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
  console.log("API getDancerUsers params:", params);
  return api.get(`/users/DANCER`, { params });
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

// Get dancer details by ID
export const getDancerById = (dancerId: string | number) => {
  return api.get(`/dancers/${dancerId}`);
};

// Get dancer schedule
export const getDancerSchedule = ({
  id,
  startTime,
  endTime,
}: GetChoreographyScheduleParams) => {
  // Backend expects `dancerId` as the query param name (not generic `id`)
  const params = { dancerId: id, startTime, endTime };
  console.log("API getDancerSchedule params:", params);
  return api.get(`/dancers/schedule`, { params });
};

// Calculate total price for a dancer booking
// Matches backend body:
// {
//   "dancerId": 16,
//   "areaId": 37,
//   "location": "...",
//   "detail": "...",
//   "crewId": [42,43,44],
//   "numberOfPeople": 3,
//   "bookingDate": "2025-12-15",
//   "startTime": "14:00",
//   "endTime": "16:00",
//   "bookingExtraServiceRequests": [...]
// }
export interface DancerBooking {
  dancerId: string;
  areaId: string;
  location: string;
  detail: string | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingExtraServiceRequests?: {
    extraServiceId: number;
    quantity: number;
  }[];
  crewMembers?: number;
  // manual selection: list of crew member IDs; auto selection: empty array
  crewId?: number[];
  // total number of people requested
  numberOfPeople?: number;
}

export const getDancerBookingTotalPrice = (
  payload: DancerBooking
) => {
  return api.post(`/booking/dancers/total-price`, payload);
};

// Create a dancer booking
export const createDancerBooking = (payload: DancerBooking) => {
  return api.post(`/booking/dancers`, payload);
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

// Get list of dancer bookings for the logged-in dancer
export const getDancerBookings = () => {
  // Backend returns an array of bookings like:
  // [
  //   { id, address, bookingDate, statusName, numberOfTeamMember, price, area, customer, ... }
  // ]
  return api.get(`/booking/dancers`);
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

// Accept a dancer booking
export const acceptDancerBooking = (
  bookingId: string,
  statusName: string = "BOOKING_ACTIVATE"
) => {
  return api.patch(
    `/booking/dancers/status`,
    null,
    {
      params: { bookingId, statusName },
    }
  );
};

export const cancelDancerBooking = (bookingId: string | number) => {
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

export interface ComplaintTypeResponse {
  type: string;
  description: string;
  roles?: string[];
}

export const getComplaintTypes = () => {
  return api.get<ComplaintTypeResponse[]>(`/api/complain/types`);
};

export interface SubmitComplaintPayload {
  bookingId: number | string;
  content: string;
  complainType: string;
  evidenceUrls?: string[];
}

export const submitBookingComplaint = (payload: SubmitComplaintPayload) => {
  return api.post(`/api/complain/booking`, payload);
};

export interface UserComplaintItem {
  id: number;
  bookingId: number;
  content: string;
  statusCode: string;
  statusName: string;
  complainTypeCode: string;
  complainTypeName: string;
  complainTypeDescription: string;
  evidenceUrls?: string[];
  fromUserName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserComplaintsResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: UserComplaintItem[];
}

export interface UserComplaintsQuery {
  pageNo?: number;
  pageSize?: number;
}

export const getUserComplaints = ({
  pageNo = 0,
  pageSize = 20,
}: UserComplaintsQuery = {}) => {
  return api.get<UserComplaintsResponse>(`/api/complain/user`, {
    params: { pageNo, pageSize },
  });
};