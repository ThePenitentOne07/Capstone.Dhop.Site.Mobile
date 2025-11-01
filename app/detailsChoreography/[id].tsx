import { View, Text, Button, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';
import { Introduction, ChoreographerProject } from "../../components/ChoreographerDetail/index";

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("My Progress");

  // Get screen dimensions for responsive animation
  const screenWidth = Dimensions.get('window').width;
  const segmentControlWidth = screenWidth - 50; // 20px margin on each side
  const slideDistance = segmentControlWidth / 2; // Each segment takes half the width

  // Animation values
  const slideValue = useSharedValue(0);

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

  const id = String(params.id || "");
  const title = (params.title as string) || (params.nickname as string) || "Choreography";
  const name = (params.name as string) || (params.artist as string) || "";
  const avatar = params.avatar as string | undefined;
  const price = params.price ? Number(params.price) : undefined;
  const about = params.about as string | undefined;
  const yearExperience = params.yearExperience ? Number(params.yearExperience) : undefined;
  const danceType = safeJsonParse(params.danceType, undefined);
  const area = safeJsonParse(params.area, undefined);

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
          danceType: danceType || []
        }} />;
      case "My Account":
        return <ChoreographerProject />;
      default:
        return <Introduction props={{ 
          title, 
          name, 
          price: price || 0, 
          yearExperience: yearExperience || 0, 
          about: about || "",
          area: area || [],
          danceType: danceType || []
        }} />;
    }
  };

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
            pathname: '/choreographerBooking/[id]',
            params: { 
              id, 
              name, 
              avatar, 
              price: String(price || 0), 
              about, 
              yearExperience: String(yearExperience || 0), 
              danceType: JSON.stringify(danceType || []), 
              area: JSON.stringify(area || [])
            }
          })}
        >
          <Text style={styles.primaryBtnText}>Đặt lịch ngay!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
});
