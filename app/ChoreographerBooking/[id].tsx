import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Step1 from '../../components/ChoreoGrapherBooking/Step1';
import Step2 from '../../components/ChoreoGrapherBooking/Step2';
import Step3 from '../../components/ChoreoGrapherBooking/Step3';
import Step4 from '../../components/ChoreoGrapherBooking/Step4';
import Step5 from '../../components/ChoreoGrapherBooking/Step5';
import type { OccupiedSession } from '../../components/ChoreoGrapherBooking/Step2';


export default function ChoreographerBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Helper function to safely parse JSON
  const safeJsonParse = (value: any, defaultValue: any = undefined) => {
    if (!value) return defaultValue;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return defaultValue;
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
  const yearExperience = params.yearExperience ? Number(params.yearExperience) : undefined;
  const danceType = safeJsonParse(params.danceType, []);
  const area = safeJsonParse(params.area, []);
  const extraServices = safeJsonParse(params.extraServices, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>({});

  const handleStep1Next = (numberOfDays: number) => {
    setBookingData({ ...bookingData, numberOfDays });
    setCurrentStep(2);
  };
  const handleStep2Next = (
    selectedDatesISO: string[],
    occupiedSessionsByDate: Record<string, OccupiedSession[]>
  ) => {
    setBookingData({ ...bookingData, selectedDatesISO, occupiedSessionsByDate });
    setCurrentStep(3);
  };
  const handleStep3Next = (sessions: { dateISO: string; startTime: string; durationMinutes: number }[]) => {
    setBookingData({ ...bookingData, sessions });
    setCurrentStep(4);
  };
  const handleStep4Submit = (payload: { location: string; description?: string; areaId: number; bookingExtraServiceRequests: { extraServiceId: number; quantity: number }[] }) => {
    setBookingData({ ...bookingData, ...payload });
    setCurrentStep(5);
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
        <TouchableOpacity onPress={() => handleBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Đặt lịch biên đạo múa</Text>
          <Text style={styles.headerSubtitle}>Bước {currentStep}/5</Text>
        </View>
      </Animated.View>

      {/* Progress Bar */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {currentStep === 1 && (
          <Step1 
            onNext={handleStep1Next}
            choreographerName={name}
            choreographerPrice={price}
          />
        )}
        {currentStep === 2 && (
          <Step2
            choreographerId={id}
            numberOfDays={bookingData.numberOfDays}
            onNext={handleStep2Next}
          />
        )}
        {currentStep === 3 && (
          <Step3
            selectedDatesISO={bookingData.selectedDatesISO || []}
            occupiedSessionsByDate={bookingData.occupiedSessionsByDate || {}}
            onSubmit={handleStep3Next}
          />
        )}
        {currentStep === 4 && (
          <Step4 
            sessions={bookingData.sessions || []} 
            onSubmit={handleStep4Submit}
            choreographerAreas={area}
            extraServices={extraServices}
          />
        )}
        {currentStep === 5 && (
          <Step5
            choreographerId={id}
            areaId={bookingData.areaId}
            location={bookingData.location}
            detail={bookingData.description}
            sessions={bookingData.sessions || []}
            bookingExtraServiceRequests={bookingData.bookingExtraServiceRequests || []}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  placeholderText: {
    fontSize: 18,
    color: '#6B7280',
  },
});
