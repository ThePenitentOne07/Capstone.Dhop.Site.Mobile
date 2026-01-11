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
  areas?: number[];
  danceTypes?: number[];
  name?: string;
}

export const getChoreographyUsers = ({
  pageNo = 1,
  pageSize = 10,
  areas,
  danceTypes,
  name,
}: ChoreographyUsersQuery = {}) => {
  const params: any = {
    pageNo,
    pageSize,
  };

  // Only add params that are actually chosen/selected
  if (name?.trim()) {
    params.name = name.trim();
  }

  if (areas && areas.length > 0) {
    params.areas = areas;
  }

  if (danceTypes && danceTypes.length > 0) {
    params.danceTypes = danceTypes;
  }

  // Use paramsSerializer to format arrays as repeated params instead of array notation
  const paramsSerializer = (params: any) => {
    const parts: string[] = [];
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        if (
          (key === "areas" || key === "danceTypes") &&
          Array.isArray(value) &&
          value.length > 0
        ) {
          // Format as areas=2&areas=4 or danceTypes=2&danceTypes=4
          value.forEach((id: number) => {
            parts.push(`${key}=${encodeURIComponent(id)}`);
          });
        } else if (key !== "areas" && key !== "danceTypes") {
          parts.push(`${key}=${encodeURIComponent(value)}`);
        }
      }
    });
    return parts.join("&");
  };

  console.log("API getChoreographyUsers params:", params);
  return api.get(`/users/CHOREOGRAPHY`, {
    params,
    paramsSerializer,
  });
};

// Fetch list of users with DANCER role
export const getDancerUsers = ({
  pageNo = 1,
  pageSize = 10,
  areas,
  danceTypes,
  name,
}: ChoreographyUsersQuery = {}) => {
  const params: any = {
    pageNo,
    pageSize,
  };

  // Only add params that are actually chosen/selected
  if (name?.trim()) {
    params.name = name.trim();
  }

  if (areas && areas.length > 0) {
    params.areas = areas;
  }

  if (danceTypes && danceTypes.length > 0) {
    params.danceTypes = danceTypes;
  }

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

export interface ChoreographyFeedbackItem {
  id: number;
  comment: string;
  rating: number;
  fromUser: string;
  status: string;
  toUser: string;
  createdAt: string;
}

export interface ChoreographyFeedbackResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  avgRating: number;
  items: ChoreographyFeedbackItem[];
}

export const getChoreographyFeedbacks = (
  choreographyId: string | number,
  pageNo: number = 1,
  pageSize: number = 2
) => {
  return api.get<ChoreographyFeedbackResponse>(
    `/choreography/${choreographyId}/feedbacks`,
    {
      params: { pageNo, pageSize },
    }
  );
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
  // crewMembers?: number;
  // manual selection: list of crew member IDs; auto selection: empty array
  crewId?: number[];
  // total number of people requested
  numberOfPeople?: number;
  bookingNature?: "STANDARD" | "URGENT";
  goalId?: number;
  referenceLink?: string;
  danceTypeIds?: number[];
  specificSong?: string;
  performanceDurationMinutes?: number;
  callTime?: string;
  desiredSongLinks?: string[];
}

export interface BookingGoal {
  id: number;
  name: string;
  description?: string;
  providerType: "DANCER" | "CHOREOGRAPHER";
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getBookingGoalsActive = (
  providerType: "DANCER" | "CHOREOGRAPHER"
) => {
  return api.get(`/booking-goals/active`, {
    params: { providerType },
  });
};

export interface StudentLevel {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export const getStudentLevelsActive = () => {
  return api.get(`/student-levels/active`);
};

export const getDancerBookingTotalPrice = (payload: DancerBooking) => {
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
export interface GetChoreographerBookingsParams {
  status?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

export const getChoreographerBookings = (
  params?: GetChoreographerBookingsParams
) => {
  return api.get(`/booking/choreographer`, {
    params: {
      status: params?.status,
      pageNo: params?.pageNo || 1,
      pageSize: params?.pageSize || 10,
      sortBy: params?.sortBy || "id:DESC",
    },
  });
};

// Get list of dancer bookings for the logged-in dancer
export interface GetDancerBookingsParams {
  status?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

export const getDancerBookings = (params?: GetDancerBookingsParams) => {
  return api.get(`/booking/dancers`, {
    params: {
      status: params?.status,
      pageNo: params?.pageNo || 1,
      pageSize: params?.pageSize || 10,
      sortBy: params?.sortBy || "id:DESC",
    },
  });
};

export const dancerAcceptBooking = (bookingId: number) => {
  return api.patch(`/dancers/apply-booking`, { bookingId });
};
export const dancerCompleteWork = (bookingId: number, qrCodeData: string) => {
  return api.post(`/dancers/complete-work`, { bookingId, qrCodeData });
};
export const dancerStartWorking = (bookingId: number) => {
  return api.patch(`/dancers/start-work-booking`, { bookingId });
};
export interface GetDancerBookingsParams {
  status?: string;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

export const dancerGetBooking = (params?: GetDancerBookingsParams) => {
  return api.get(`/dancers/bookings`, {
    params: {
      status: params?.status,
      pageNo: params?.pageNo || 1,
      pageSize: params?.pageSize || 10,
      sortBy: params?.sortBy || "id:DESC",
    },
  });
};

export const getBookingById = (bookingId: string | number) => {
  return api.get(`/booking/${bookingId}`);
};

export const confirmBookingCompletion = (bookingId: number) => {
  return api.post(`/booking/confirm-completion`, { bookingId });
};

// Accept a choreographer booking
export const acceptChoreographerBooking = (
  bookingId: string,
  statusName: string = "BOOKING_ACTIVATE"
) => {
  // console.log("acceptChoreographerBooking request", { bookingId, statusName });
  return api.patch(`/booking/choreographer/status`, null, {
    params: { bookingId, statusName },
  });
};

export const cancelChoreographerBooking = (bookingId: string | number) => {
  return api.patch(`/booking/cancel`, null, {
    params: { bookingId },
  });
};

// Accept a dancer booking
// export const acceptDancerBooking = (
//   bookingId: string,
//   statusName: string = "BOOKING_ACTIVATE"
// ) => {
//   return api.patch(
//     `/booking/dancers/status`,
//     null,
//     {
//       params: { bookingId, statusName },
//     }
//   );
// };

export const cancelDancerBooking = (bookingId: string | number) => {
  return api.patch(`/booking/cancel`, null, {
    params: { bookingId },
  });
};

export const updateDancerBooking = (bookingId: number, payload: any) => {
  return api.patch(`/booking/${bookingId}`, payload);
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

// Generate QR for a booking
export const generateBookingQR = (bookingId: number) => {
  return api.get(`/booking/${bookingId}/qr-code`);
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
  customerRefundAmount?: number;
  processByUserName?: string;
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

export const cancelComplaint = (complaintId: number) => {
  return api.put(`/api/complain/${complaintId}/cancel`);
};

// Chat Box AI Query
export interface ChatBoxQueryRequest {
  message: string;
}

export interface DancerData {
  id: number;
  danceCrewName: string;
  avatar: string;
  yearExperience: number;
  danceTypes: string[];
  areas: string[];
}

export interface ChoreographerData {
  id: number;
  nickName: string;
  avatar: string;
  yearExperience: number;
  danceTypes: string[];
  areas: string[];
}

export interface ChatBoxQueryResponse {
  type: "dancer" | "choreographer" | "general";
  data?: DancerData[] | ChoreographerData[];
  message?: string;
}

export const chatBoxQuery = (payload: ChatBoxQueryRequest) => {
  return api.post<ChatBoxQueryResponse>(`/chat-box/query`, payload);
};
// Register FCM token for push notifications
export interface RegisterFCMTokenPayload {
  token: string;
  deviceType: "ios" | "android";
}

export const registerFCMToken = (payload: RegisterFCMTokenPayload) => {
  return api.post(`/fcm/tokens/register`, payload);
};

// Unregister FCM token (when user logs out)
export const unregisterFCMToken = () => {
  return api.delete(`/fcm/tokens`);
};

// pay booking
export const payBooking = (bookingId: number) => {
  return api.post(`/booking/${bookingId}/pay`);
};
