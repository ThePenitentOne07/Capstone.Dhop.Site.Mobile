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
import Step1Date from "../../components/DancerBooking/Step1Date";
import Step2Crew, {
  Step2CrewSelection,
} from "../../components/DancerBooking/Step2Crew";
import Step3Dancer from "../../components/DancerBooking/Step3Dancer";
import Step4 from "../../components/ChoreoGrapherBooking/Step4";
import Step5Dancer from "../../components/DancerBooking/Step5Dancer";
import type { OccupiedSession } from "../../components/DancerBooking/Step1Date";

const TOTAL_STEPS = 6;

export default function DancerBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

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

  const id = String(params.userId || params.id || "");
  const name = (params.name as string) || "";
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

  const handleStep1Next = (
    selectedDatesISO: string[],
    occupiedSessionsByDate: Record<string, OccupiedSession[]>
  ) => {
    setBookingData({
      ...bookingData,
      selectedDatesISO,
      occupiedSessionsByDate,
    });
    setCurrentStep(3);
  };

  const handleStep2Next = (payload: Step2CrewSelection) => {
    setBookingData({ ...bookingData, ...payload });
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
    referenceLink?: string;
    danceTypeIds?: number[];
    specificSong?: string;
    performanceDurationMinutes?: number;
    bookingNature?: "STANDARD" | "URGENT";
    callTime?: string;
    desiredSongLinks?: string[];
  }) => {
    setBookingData({ ...bookingData, ...payload });
    setCurrentStep(6);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1));
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Đặt lịch nhóm nhảy</Text>
          <Text style={styles.headerSubtitle}>
            Bước {currentStep}/{TOTAL_STEPS}
          </Text>
        </View>
      </Animated.View>

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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {currentStep === 1 && (
          <BookingType
            providerType="DANCER"
            defaultValue={bookingData.bookingNature}
            onNext={handleTypeNext}
          />
        )}

        {currentStep === 2 && (
          <Step1Date
            dancerId={id}
            bookingNature={bookingData.bookingNature}
            onNext={handleStep1Next}
          />
        )}

        {currentStep === 3 && (
          <Step2Crew
            dancerId={id}
            defaultValue={bookingData.crewMembers || 4}
            onNext={handleStep2Next}
          />
        )}

        {currentStep === 4 && (
          <Step3Dancer
            selectedDatesISO={bookingData.selectedDatesISO || []}
            occupiedSessionsByDate={bookingData.occupiedSessionsByDate || {}}
            bookingNature={bookingData.bookingNature}
            onSubmit={handleStep3Next}
          />
        )}

        {currentStep === 5 && (
          <Step4
            providerType="DANCER"
            sessions={bookingData.sessions || []}
            onSubmit={handleStep4Submit}
            choreographerAreas={area}
            extraServices={extraServices}
            bookingNature={bookingData.bookingNature}
          />
        )}

        {currentStep === 6 && (
          <Step5Dancer
            dancerId={id}
            areaId={bookingData.areaId}
            location={bookingData.location}
            detail={bookingData.description ?? null}
            sessions={bookingData.sessions || []}
            bookingExtraServiceRequests={
              bookingData.bookingExtraServiceRequests || []
            }
            crewMembers={bookingData.crewMembers}
            selectionMode={bookingData.selectionMode}
            dancerName={name}
            price={price}
            yearExperience={yearExperience}
            danceType={danceType}
            bookingNature={bookingData.bookingNature}
            goalId={bookingData.goalId}
            referenceLink={bookingData.referenceLink}
            specificSong={bookingData.specificSong}
            performanceDurationMinutes={bookingData.performanceDurationMinutes}
            callTime={bookingData.callTime}
            desiredSongLinks={bookingData.desiredSongLinks}
            actItems={bookingData.actItems}
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
    fontFamily: "RobotoMono_700Bold",
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
    fontFamily: "RobotoMono_400Regular",
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
    paddingBottom: 32,
  },
});
