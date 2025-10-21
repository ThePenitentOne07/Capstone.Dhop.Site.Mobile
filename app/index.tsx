import { View, Text, Image, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screenRoot}>
      <View style={styles.contentWrapper}>
        <Animated.Text style={styles.title} entering={FadeIn.duration(800)} exiting={FadeOut.duration(800)}>Bắt đầu đặt nhóm nhảy/biên đạo</Animated.Text>

        {/* <View style={styles.logoWrap}> */}
          <Animated.Image
            source={require("../assets/vecteezy_man-using-smartphone-device_24096847.png")}
            style={styles.logo}
            resizeMode="contain"
            entering={FadeIn.duration(800).delay(500)}
            exiting={FadeOut.duration(800).delay(500)}
          />
        {/* </View> */}

        <AnimatedTouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryButton}
          onPress={() => {
            router.push("/login");
          }}
          entering={FadeIn.duration(800).delay(1000)}
          exiting={FadeOut.duration(800).delay(1000)}
        >
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        </AnimatedTouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 27,
    alignItems: "center",
    justifyContent: "space-around",
    
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 28,
    fontFamily:"RobotoMono_400Regular",
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
    // Shadow iOS
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    // Shadow Android
    elevation: 6,
  },
  logo: {
    width: 300,
    height: 300,
  },
  primaryButton: {
    minWidth: 300,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
