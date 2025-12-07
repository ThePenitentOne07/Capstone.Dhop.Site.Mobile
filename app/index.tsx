import { View, Text, Image, TouchableOpacity, SafeAreaView, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut, SlideInUp, SlideInDown, BounceIn } from "react-native-reanimated";
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserInfo } from "../service/api";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const { width, height } = Dimensions.get('window');

// Slide data
const slides = [
  {
    id: 1,
    image: require("../assets/indexPic.jpg"),
    title: "Đặt nhóm nhảy bạn muốn hôm nay!",
    description: "DhopSite sẽ giúp tìm kiếm nhóm nhảy vừa ý và hợp túi tiền của bạn!"
  },
  {
    id: 2,
    image: require("../assets/energetic-dance-performance-given-by-lady-illustration-svg-download-png-11526278.webp"),
    title: "Khám phá phong cách nhảy đa dạng",
    description: "Từ Hip-hop đến Contemporary, tìm phong cách phù hợp với bạn!"
  },
  {
    id: 3,
    image: require("../assets/vecteezy_man-using-smartphone-device_24096847.png"),
    title: "Kết nối với cộng đồng nhảy",
    description: "Gặp gỡ những người cùng đam mê và chia sẻ niềm vui nhảy múa!"
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // On first app open, if we already have a valid token,
  // skip the intro and go directly to the correct home screen.
  useEffect(() => {
    const checkExistingLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setCheckingAuth(false);
          return;
        }

        // Verify token by calling user info.
        const userRes = await getUserInfo();
        const role = userRes?.data?.role;
        const roleUpper = String(role).toUpperCase();

        if (roleUpper === "CHOREOGRAPHY" || roleUpper === "CHOREOGRAPHER") {
          router.replace("/Choreographer/ChoreographerHome");
        } else if (roleUpper === "DANCER") {
          router.replace("/Dancer/DancerHome");
        } else {
          router.replace("/Home");
        }
      } catch (err: any) {
        // If token is invalid/expired, clear it and stay on intro
        if (err?.response?.status === 401) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    checkExistingLogin();
  }, [router]);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setCurrentSlide(Math.round(index));
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  if (checkingAuth) {
    return (
      <SafeAreaView style={[styles.screenRoot, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenRoot}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            {/* Background Image */}
            <Animated.Image
              source={slide.image}
              style={styles.backgroundImage}
              resizeMode="cover"
              entering={FadeIn.duration(1000)}
            />
            
            {/* Dark overlay */}
            <View style={styles.overlay} />
            
            {/* Content */}
            <View style={styles.contentWrapper}>
              {/* Title and Description */}
              <View style={styles.textContainer}>
                <Animated.Text 
                  style={styles.title} 
                  entering={SlideInUp.duration(800).delay(300)}
                  exiting={FadeOut.duration(800)}
                >
                  {slide.title}
                </Animated.Text>
                
                <Animated.Text 
                  style={styles.description} 
                  entering={SlideInUp.duration(800).delay(600)}
                  exiting={FadeOut.duration(800)}
                >
                  {slide.description}
                </Animated.Text>
              </View>

              {/* Pagination Dots */}
              <Animated.View 
                style={styles.paginationContainer}
                entering={SlideInDown.duration(800).delay(900)}
                exiting={FadeOut.duration(800)}
              >
                <View style={styles.paginationDots}>
                  {slides.map((_, dotIndex) => (
                    <TouchableOpacity
                      key={dotIndex}
                      onPress={() => goToSlide(dotIndex)}
                      style={styles.dotContainer}
                    >
                      <View style={[
                        styles.dot, 
                        currentSlide === dotIndex && styles.activeDot
                      ]} />
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>

              {/* Gradient Button - Only show on last slide */}
              {currentSlide === slides.length - 1 && (
                <AnimatedTouchableOpacity
                  activeOpacity={0.8}
                  style={styles.buttonContainer}
                  onPress={() => {
                    router.push("/Login");
                  }}
                  entering={BounceIn.duration(1000).delay(1200)}
                  exiting={FadeOut.duration(800)}
                >
                  <LinearGradient
                    colors={['#FF7A00', '#FFB84D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <View style={styles.buttonIcon}>
                      <Text style={styles.iconText}>🏠</Text>
                    </View>
                    <Text style={styles.buttonText}>›››</Text>
                  </LinearGradient>
                </AnimatedTouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    height: height,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    top: 0,
    left: 0,
  },
  contentWrapper: {
    flex: 1,
    marginTop: 400,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "left",
    lineHeight: 40,
    fontFamily: "RobotoMono_700Bold",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "left",
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'RobotoMono_400Regular',
  },
  paginationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotContainer: {
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#FF7A00',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'space-between',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 1,
    fontFamily: 'RobotoMono_700Bold',
  },
});
