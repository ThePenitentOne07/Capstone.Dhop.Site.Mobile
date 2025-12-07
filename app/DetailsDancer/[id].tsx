import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";
import { Introduction, ChoreographerProject } from "../../components/ChoreographerDetail";
import { getDancerById } from "../../service/api";
import { useConversationStore } from "../../states/conversationStore";
import { useAppModal } from "../../hooks/useAppModal";

const ORANGE2 = "#FF7A00";

interface DancerProfile {
  profileId: number;
  videos: string[];
  images: string[];
  achievements: string[];
  experiences: {
    id: number;
    title: string;
    subject: string;
    years: string;
  }[];
}

interface DancerArea {
  id: number;
  city: string;
  ward: string;
}

interface DancerDanceType {
  id: number;
  type: string;
  description: string;
}

interface DancerCrew {
  crewId: number;
  dancerName: string;
  dancerStatus: string;
  sex: boolean;
  description: string;
  dancerId: number;
}

interface DancerResult {
  dancerId: number;
  about?: string;
  danceGroupName?: string;
  teamSize?: number;
  bankAccount?: string;
  businessLicense?: string;
  price?: number;
  yearExperience?: number;
  area?: DancerArea[];
  danceType?: DancerDanceType[];
  profiles?: DancerProfile[];
  extraServices?: Array<{ id: number; name: string; description: string; price: number }>;
  crews?: DancerCrew[];
}

export default function DetailsDancerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<"Intro" | "Projects">("Intro");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dancer, setDancer] = useState<DancerResult | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const { createConversation } = useConversationStore();
  const { showModal, modal } = useAppModal();

  const dancerId = params.id ? String(params.id) : "";

  // Screen / segment animation metrics
  const screenWidth = Dimensions.get("window").width;
  const segmentControlWidth = screenWidth - 50;
  const slideDistance = segmentControlWidth / 2;
  const slideValue = useSharedValue(0);

  // Fetch dancer data
  useEffect(() => {
    const fetchDancer = async () => {
      if (!dancerId) {
        setError("Dancer ID is required");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await getDancerById(dancerId);
        const result: DancerResult = response.data?.result ?? response.data;
        setDancer(result);
      } catch (err: any) {
        console.error("Failed to fetch dancer data:", err);
        setError(err?.response?.data?.message || "Failed to load dancer details");
      } finally {
        setLoading(false);
      }
    };

    fetchDancer();
  }, [dancerId]);

  // Map dancer data into props expected by shared components
  const title = dancer?.danceGroupName || "Dancer crew";
  const name = dancer?.danceGroupName || "";
  const price = dancer?.price || 0;
  const about = dancer?.about || "";
  const yearExperience = dancer?.yearExperience || 0;
  const area = dancer?.area || [];
  const danceType = dancer?.danceType?.map((d) => ({
    id: d.id,
    type: d.type,
    description: d.description,
  })) || [];
  const profiles = dancer?.profiles || [];
  const extraServices = dancer?.extraServices || [];

  const imageSource = dancer?.profiles?.[0]?.images?.[0]
    ? { uri: dancer.profiles[0].images[0] }
    : require("../../assets/girl-dancing-2830024-2357254.webp");
  
  const handleTabPress = (tab: "Intro" | "Projects") => {
    setSelectedTab(tab);
    slideValue.value = withTiming(tab === "Intro" ? 0 : 1, { duration: 300 });
  };

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const translateX = interpolate(slideValue.value, [0, 1], [0, slideDistance]);
    return {
      transform: [{ translateX }],
    };
  });

  const renderTabContent = () => {
    if (selectedTab === "Intro") {
      return (
        <Introduction
          props={{
            title,
            name,
            price,
            yearExperience,
            about,
            area,
            danceType,
            averageRating: 0,
            extraServices,
            crews: dancer?.crews || [],
          }}
        />
      );
    }
    return <ChoreographerProject profiles={profiles} />;
  };

  if (loading) {
    return (
      <View style={[styles.screenRoot, styles.centerContainer]}>
        <ActivityIndicator size="large" color={ORANGE2} />
        <Text style={styles.loadingText}>Đang tải thông tin dancer...</Text>
      </View>
    );
  }

  if (error || !dancer) {
    return (
      <View style={[styles.screenRoot, styles.centerContainer]}>
        <Text style={styles.errorText}>{error || "Không tìm thấy thông tin dancer"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenRoot}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.coverImage} resizeMode="cover" />
          <TouchableOpacity 
            style={styles.msgBtnFab} 
            activeOpacity={0.86} 
            onPress={async () => {
              const userUUID = (dancer as any)?.uuid;
              if (!userUUID) {
                showModal({
                  title: 'Lỗi',
                  message: 'Không tìm thấy thông tin người dùng',
                  status: 'error',
                });
                return;
              }

              setChatLoading(true);
              try {
                const conversation = await createConversation({
                  type: 'DIRECT',
                  participantIds: [userUUID],
                });

                router.push({
                  pathname: '/ChatDetail',
                  params: {
                    conversation: JSON.stringify(conversation),
                  },
                });
              } catch (error: any) {
                console.error('Failed to create conversation:', error);
                showModal({
                  title: 'Lỗi',
                  message: error?.message || 'Không thể tạo cuộc trò chuyện',
                  status: 'error',
                });
              } finally {
                setChatLoading(false);
              }
            }}
            disabled={chatLoading}
          >
            {chatLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.msgBtnFabLabel}>Nhắn tin</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.segmentedControl}>
          <Animated.View style={[styles.slidingBackground, animatedBackgroundStyle]} />
          <TouchableOpacity style={styles.segment} onPress={() => handleTabPress("Intro")}>
            <Text
              style={[
                styles.segmentText,
                selectedTab === "Intro" && styles.segmentTextActive,
              ]}
            >
              Giới thiệu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.segment} onPress={() => handleTabPress("Projects")}>
            <Text
              style={[
                styles.segmentText,
                selectedTab === "Projects" && styles.segmentTextActive,
              ]}
            >
              Dự án
            </Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Sticky Button */}
      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity 
          style={styles.primaryBtn} 
          activeOpacity={0.9} 
          onPress={() => router.push({
            pathname: '/DancerBooking/[id]',
            params: { 
              userId: dancerId,
              id: dancerId,
              name, 
              avatar: dancer?.profiles?.[0]?.images?.[0] || '', 
              price: String(price || 0), 
              about, 
              yearExperience: String(yearExperience || 0), 
              danceType: JSON.stringify(danceType || []), 
              area: JSON.stringify(area || []),
              extraServices: JSON.stringify(extraServices || [])
            }
          })}
        >
          <Text style={styles.primaryBtnText}>Đặt lịch ngay!</Text>
        </TouchableOpacity>
      </View>
      {modal}
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    color: "#C92A2A",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: ORANGE2,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: "100%",
    minHeight: 260,
  },
  coverImage: {
    width: "100%",
    height: 260,
    backgroundColor: "#F3F4F6",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: "#374151",
    position: "relative",
  },
  slidingBackground: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    backgroundColor: ORANGE2,
    borderRadius: 8,
    width: "50%",
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: 'RobotoMono_700Bold',
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: 100, // Space for the sticky button
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  msgBtnFab: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FF7A00",
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#FF7120",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  msgBtnFabLabel: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'RobotoMono_700Bold',
  },
});


