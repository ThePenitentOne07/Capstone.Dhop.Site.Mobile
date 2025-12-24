import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import BookingType, {
  BookingNature,
} from "../../components/ChoreoGrapherBooking/BookingType";
import Step1 from "../../components/ChoreoGrapherBooking/Step1";
import Step2 from "../../components/ChoreoGrapherBooking/Step2";
import Step3 from "../../components/ChoreoGrapherBooking/Step3";
import Step4 from "../../components/ChoreoGrapherBooking/Step4";
import Step5 from "../../components/ChoreoGrapherBooking/Step5";
import type { OccupiedSession } from "../../components/ChoreoGrapherBooking/Step2";

const TOTAL_STEPS = 6;

export default function ChoreographerBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Helper function to safely parse JSON
  const safeJsonParse = (value: any, defaultValue: any = undefined) => {
    if (!value) return defaultValue;
    if (typeof value === "object") return value;
    if (typeof value !== "string") return defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      return defaultValue;
    }
  };

  const id = String(params.userId || "");
  const name = (params.name as string) || "";
  const avatar = params.avatar as string | undefined;
  const price = params.price ? Number(params.price) : 0;
  const about = params.about as string | undefined;
  const yearExperience = params.yearExperience
    ? Number(params.yearExperience)
    : undefined;
  const danceType = safeJsonParse(params.danceType, []);
  const area = safeJsonParse(params.area, []);
  const extraServices = safeJsonParse(params.extraServices, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({
    bookingNature: "STANDARD" as BookingNature,
  });

  const handleTypeNext = (bookingNature: BookingNature) => {
    setBookingData({ ...bookingData, bookingNature });
    setCurrentStep(2);
  };
  const handleStep1Next = (numberOfDays: number) => {
    setBookingData({ ...bookingData, numberOfDays });
    setCurrentStep(3);
  };
  const handleStep2Next = (
    selectedDatesISO: string[],
    occupiedSessionsByDate: Record<string, OccupiedSession[]>
  ) => {
    setBookingData({
      ...bookingData,
      selectedDatesISO,
      occupiedSessionsByDate,
    });
    setCurrentStep(4);
  };
  const handleStep3Next = (
    sessions: { dateISO: string; startTime: string; durationMinutes: number }[]
  ) => {
    setBookingData({ ...bookingData, sessions });
    setCurrentStep(5);
  };
  const handleStep4Submit = (payload: {
    location: string;
    description?: string;
    areaId: number;
    bookingExtraServiceRequests: { extraServiceId: number; quantity: number }[];
    goalId?: number;
    numberOfStudents?: number;
    averageAge?: number;
    studentLevelId?: number;
    studentGender?: "BOTH" | "MALE" | "FEMALE";
    desiredSongLinks?: string[];
    numberOfMaleStudents?: number;
    numberOfFemaleStudents?: number;
    bookingNature?: "STANDARD" | "URGENT";
  }) => {
    setBookingData({ ...bookingData, ...payload });
    setCurrentStep(6);
  };
  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };
  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /> */}

      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity
          onPress={() => handleBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Đặt lịch biên đạo múa</Text>
          <Text style={styles.headerSubtitle}>
            Bước {currentStep}/{TOTAL_STEPS}
          </Text>
        </View>
      </Animated.View>

      {/* Progress Bar */}
      <Animated.View
        entering={FadeInDown.delay(100)}
        style={styles.progressContainer}
      >
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentStep / TOTAL_STEPS) * 100}%` },
            ]}
          />
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {currentStep === 1 && (
          <BookingType
            providerType="CHOREOGRAPHER"
            defaultValue={bookingData.bookingNature}
            onNext={handleTypeNext}
          />
        )}
        {currentStep === 2 && (
          <Step1
            onNext={handleStep1Next}
            choreographerName={name}
            choreographerPrice={price}
          />
        )}
        {currentStep === 3 && (
          <Step2
            choreographerId={id}
            numberOfDays={bookingData.numberOfDays}
            bookingNature={bookingData.bookingNature}
            onNext={handleStep2Next}
          />
        )}
        {currentStep === 4 && (
          <Step3
            selectedDatesISO={bookingData.selectedDatesISO || []}
            occupiedSessionsByDate={bookingData.occupiedSessionsByDate || {}}
            bookingNature={bookingData.bookingNature}
            onSubmit={handleStep3Next}
          />
        )}
        {currentStep === 5 && (
          <Step4
            providerType="CHOREOGRAPHER"
            sessions={bookingData.sessions || []}
            onSubmit={handleStep4Submit}
            choreographerAreas={area}
            extraServices={extraServices}
            bookingNature={bookingData.bookingNature}
          />
        )}
        {currentStep === 6 && (
          <Step5
            choreographerId={id}
            areaId={bookingData.areaId}
            location={bookingData.location}
            detail={bookingData.description}
            sessions={bookingData.sessions || []}
            bookingExtraServiceRequests={
              bookingData.bookingExtraServiceRequests || []
            }
            bookingNature={bookingData.bookingNature}
            goalId={bookingData.goalId}
            numberOfStudents={bookingData.numberOfStudents}
            averageAge={bookingData.averageAge}
            studentLevelId={bookingData.studentLevelId}
            studentGender={bookingData.studentGender}
            desiredSongLinks={bookingData.desiredSongLinks}
            numberOfMaleStudents={bookingData.numberOfMaleStudents}
            numberOfFemaleStudents={bookingData.numberOfFemaleStudents}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: "#1F2937",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    color: "#1F2937",
    marginBottom: 4,
    fontFamily: "RobotoMono_700Bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF7A00",
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  placeholderText: {
    fontSize: 18,
    color: "#6B7280",
  },
});
