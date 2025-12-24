export interface ChoreographerBooking {
    choreographerId: string;
    areaId: string;
    location: string;
    detail: string;
    bookingNature?: 'STANDARD' | 'URGENT';
    goalId?: number;
    numberOfStudents?: number;
    averageAge?: number;
    studentLevelId?: number;
    studentGender?: 'BOTH' | 'MALE' | 'FEMALE';
    desiredSongLinks?: string[];
    numberOfMaleStudents?: number;
    numberOfFemaleStudents?: number;
    trainingSessionRequests: {
        durationMinutes: number;
        scheduledTime: string;
    }[];
    bookingExtraServiceRequests?: {
        extraServiceId: number;
        quantity: number;
    }[];
}