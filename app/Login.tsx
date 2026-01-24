import { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Platform } from "react-native";
import Animated, { SlideInDown,  BounceIn, Easing, CSSAnimationKeyframes} from "react-native-reanimated";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, getUserInfo, registerFCMToken } from "../service/api";
import { useAppModal } from "../hooks/useAppModal";
import { registerForPushNotificationsAsync } from "../service/notificationService";


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startPulse, setStartPulse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showModal, modal } = useAppModal();

  useEffect(() => {
    const t = setTimeout(() => setStartPulse(true), 1000);
    return () => clearTimeout(t);
  }, []);
  const pulse: CSSAnimationKeyframes = {
    from: {
      transform: [{ scale: 1 }, { rotateZ: '0deg' }],
    },
    to: {
      transform: [{ scale: 1 }, { rotateZ: '45deg' }],
    },
  };

  const handleLogin = async () => {
    console.log("login pressed", { emailPresent: !!email, passwordPresent: !!password });
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await loginUser({ email, password });
      console.log("login response:", res?.data ?? res);
      const token = res?.data?.accessToken;
      if (!token) {
        throw new Error("Không nhận được token từ máy chủ");
      }
      await AsyncStorage.setItem("token", token);
      
      // Register FCM token
      try {
        const fcmToken = await registerForPushNotificationsAsync();
        if (fcmToken) {
          console.log('📱 FCM Token:', fcmToken);
          await registerFCMToken({
            token: fcmToken,
            deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
          });
          console.log('✅ FCM Token registered with backend');
        }
      } catch (fcmError) {
        console.error('❌ Failed to register FCM token:', fcmError);
        // Don't block login if FCM registration fails
      }
      
      // fetch user info to decide where to go
      try {
        const userRes = await getUserInfo();
        // FIX: role is an array property 'role', not 'roles', each element has a 'name'
        const role = userRes?.data?.role;
        const roleUpper = String(role).toUpperCase();
        console.log("role:", userRes?.data);

        switch (roleUpper) {
          case "CHOREOGRAPHY":
          case "CHOREOGRAPHER":
            router.replace("/Choreographer/ChoreographerHome");
            break;
          case "DANCER":
            router.replace("/Dancer/DancerHome");
            break;
          default:
            router.replace("/Home");
            break;
        }
      } catch {
        // fallback to Home if role cannot be fetched
        router.replace("/Home");
      }
    } catch (e: any) {
      console.log("login error:", e?.response?.data ?? e);
      const message = e?.response?.data?.message || e?.message || "Đăng nhập thất bại";
      setError(message);
      showModal({
        title: "Đăng nhập thất bại",
        message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screenRoot}>
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <Animated.View 
           entering={BounceIn.duration(1000).easing(Easing.inOut(Easing.quad))} 
           style={[
            styles.circleWrapper,
            startPulse ? {
              animationName: pulse,
              animationDuration: '3s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationFillMode: 'both',
            } : null,
           ]}
           >
            <Image
              source={require("../assets/logo-icon.png")}
              style={styles.headerIllustration}
              resizeMode="contain"
            />
          </Animated.View>
          
        </View>
      </View>

      <Animated.View style={styles.formCard} entering={SlideInDown.duration(600)} >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Địa chỉ Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="john@gmail.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
          />
        </View>

        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.rowBetween}>
          <View />
          <TouchableOpacity>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.loginButton, loading && { opacity: 0.7 }]} activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push("/SignUp")}>
            <Text style={styles.signupLink}>Tạo tài khoản</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
      {modal}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#FF7120",
  },
  headerArea: {
    backgroundColor: "#FF7120",
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIllustration: {
    
    width: 150,
    height: 150,
    
    // width:100,
    // height:100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  circleWrapper: {
    marginTop: 50,
    width: 150,
    height: 150,
    borderRadius: 100,
    // backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  formCard: {
    flex: 1,
    marginTop: 50,
    // marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    // no shadow
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#111827",
    marginBottom: 8,
    fontFamily: "RobotoMono_700Bold",
  },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    color: "#111827",
    fontFamily:"RobotoMono_400Regular"
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 12,
  },
  forgotText: {
    color: "#6B7280",
    fontFamily: "RobotoMono_700Bold",
  },
  loginButton: {
    height: 52,
    borderRadius: 14,
    
    backgroundColor: "#FF7120",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "RobotoMono_700Bold",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    marginBottom: 4,
    fontFamily: "RobotoMono_400Regular",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#6B7280",
    fontSize: 16,
    fontFamily: "RobotoMono_400Regular",
  },
  signupLink: {
    color: "#FF7120",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
}); 