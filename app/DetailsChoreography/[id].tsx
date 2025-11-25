import { View, Text, Button, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';
import { Introduction, ChoreographerProject } from "../../components/ChoreographerDetail/index";
import { getChoreographerById } from "../../service/api";
import { useConversationStore } from "../../states/conversationStore";
import { useAppModal } from "../../hooks/useAppModal";

interface Profile {
  profileId: number;
  videos: string[];
  images: string[];
  achievements: string[];
}

interface ChoreographerData {
  id: string;
  userId?: string;
  userUUID?: string;
  title?: string;
  nickname?: string;
  name?: string;
  artist?: string;
  avatar?: string;
  price?: number;
  about?: string;
  yearExperience?: number;
  danceType?: any[];
  area?: any[];
  averageRating?: number;
  profiles?: Profile[];
  extraServices?: Array<{ id: number; name: string; description: string; price: number }>;
}

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("My Progress");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("")
  const [choreographerData, setChoreographerData] = useState<ChoreographerData | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const { createConversation } = useConversationStore();
  const { showModal, modal } = useAppModal();

  // Get screen dimensions for responsive animation
  const screenWidth = Dimensions.get('window').width;
  const segmentControlWidth = screenWidth - 50; // 20px margin on each side
  const slideDistance = segmentControlWidth / 2; // Each segment takes half the width

  // Animation values
  const slideValue = useSharedValue(0);

  const id = String(params.id || "");

  // Fetch choreographer data
  useEffect(() => {
    const fetchChoreographerData = async () => {
      if (!id) {
        setError("Choreographer ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getChoreographerById(id);
        setChoreographerData(response.data);
        setUserId(response.data.userId)
      } catch (err: any) {
        console.error("Failed to fetch choreographer data:", err);
        setError(err?.response?.data?.message || "Failed to load choreographer details");
      } finally {
        setLoading(false);
      }
    };

    fetchChoreographerData();
  }, [id]);

  // Extract data from fetched response
  const title = choreographerData?.title || choreographerData?.nickname || "Choreography";
  const name = choreographerData?.name || choreographerData?.artist || "";
  const avatar = choreographerData?.avatar;
  const price = choreographerData?.price;
  const about = choreographerData?.about;
  const yearExperience = choreographerData?.yearExperience;
  const danceType = choreographerData?.danceType || [];
  const area = choreographerData?.area || [];
  const averageRating= choreographerData?.averageRating ;
  const profiles = choreographerData?.profiles || [];
  const extraServices = choreographerData?.extraServices || [];

  const imageSource = avatar
    ? { uri: avatar }
    : require("../../assets/girl-dancing-2830024-2357254.webp");

  // Handle tab selection with animation
  const handleTabPress = (tab: string) => {
    setSelectedTab(tab);
    slideValue.value = withTiming(tab === "My Progress" ? 0 : 1, { duration: 300 });
  };

  // Animated style for the sliding background
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const translateX = interpolate(slideValue.value, [0, 1], [0, slideDistance]);
    return {
      transform: [{ translateX }],
    };
  });

  // Function to render the appropriate component based on selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case "My Progress":
        return <Introduction props={{ 
          title, 
          name, 
          price: price || 0, 
          yearExperience: yearExperience || 0, 
          about: about || "",
          area: area || [],
          danceType: danceType || [],
          averageRating: averageRating || 0,
          extraServices,
          
        }} />;
      case "My Account":
        return <ChoreographerProject profiles={profiles} />;
      default:
        return <Introduction props={{ 
          title, 
          name, 
          price: price || 0, 
          yearExperience: yearExperience || 0, 
          about: about || "",
          area: area || [],
          danceType: danceType || [],
          averageRating: averageRating || 0,
          extraServices
        }} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.screenRoot, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // Error state
  if (error || !choreographerData) {
    return (
      <View style={[styles.screenRoot, styles.centerContainer]}>
        <Text style={styles.errorText}>{error || "Không tìm thấy thông tin"}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => router.back()}
        >
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
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.8)', '#FFFFFF']}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.imageGradient}
          />
          <TouchableOpacity 
            style={styles.msgBtnFab} 
            activeOpacity={0.86} 
            onPress={async () => {
              const userUUID = choreographerData?.userUUID || choreographerData?.userId;
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
          <TouchableOpacity 
            style={styles.segment} 
            onPress={() => handleTabPress("My Progress")}
          >
            <Text style={[
              styles.segmentText,
              selectedTab === "My Progress" && styles.segmentTextActive
            ]}>
              Giới thiệu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.segment} 
            onPress={() => handleTabPress("My Account")}
          >
            <Text style={[
              styles.segmentText,
              selectedTab === "My Account" && styles.segmentTextActive
            ]}>
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
            pathname: '/ChoreographerBooking/[id]',
            params: { 
              userId, 
              name, 
              avatar, 
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
    backgroundColor: "#FF7A00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: "100%",
    height: 220,
  },
  coverImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#F3F4F6",
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 220,
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    width: "95%",
    alignSelf: "center",
    marginTop: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 14,
    color: "#D1D5DB",
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  coinsIcon: {
    fontSize: 16,
    
  },
  coinsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 6,
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
    backgroundColor: "#FF7A00",
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
    fontWeight: "600",
    color: "#9CA3AF",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  arrowButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
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
    fontWeight: "600",
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
