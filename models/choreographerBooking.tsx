export interface ChoreographerBooking {
    choreographerId: string;
    areaId: string;
    location: string;
    detail: string;
    trainingSessionRequests: {
        durationMinutes: number;
        scheduledTime: string;
    }[];
    bookingExtraServiceRequests?: {
        extraServiceId: number;
        quantity: number;
    }[];
}