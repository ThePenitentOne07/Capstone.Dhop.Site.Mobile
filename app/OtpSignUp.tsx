import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import React, { useState, useRef, useEffect } from "react"
import Animated from "react-native-reanimated";
import { SlideInDown } from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppModal } from "../hooks/useAppModal";

export default function OtpSignUp() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<TextInput[]>([]);
  const { showModal, modal } = useAppModal();

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual OTP verification API call
      // const response = await verifyOtp({ email, otp: otpCode });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showModal({
        title: "Thành công",
        message: "Xác thực OTP thành công!",
        status: "success",
        buttons: [
          { text: "OK", variant: "primary", onPress: () => router.replace("/login") },
        ],
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Xác thực OTP thất bại";
      setError(message);
      showModal({
        title: "Lỗi",
        message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      // TODO: Implement resend OTP API call
      // const response = await resendOtp({ email });
      
      showModal({
        title: "Thành công",
        message: "Mã OTP đã được gửi lại!",
        status: "success",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Gửi lại OTP thất bại";
      showModal({
        title: "Lỗi",
        message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  return (
    <SafeAreaView style={styles.screenRoot}>
      <View style={styles.headerArea}>
        <Text style={styles.headerTitle}>Xác thực OTP</Text>
        <Text style={styles.headerSubtitle}>
          Chúng tôi đã gửi mã xác thực đến{"\n"}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
      </View>
      
      <Animated.View style={styles.formCard} entering={SlideInDown.duration(600)}>
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Nhập mã OTP</Text>
          <View style={styles.otpInputs}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity 
          style={[styles.verifyButton, loading && { opacity: 0.7 }]} 
          activeOpacity={0.9} 
          onPress={handleVerifyOtp} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Xác thực</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Không nhận được mã? </Text>
          <TouchableOpacity onPress={handleResendOtp}>
            <Text style={styles.resendLink}>Gửi lại</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.backContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Quay lại đăng ký</Text>
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
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 20,
    fontFamily: "RobotoMono_400Regular",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 12,
    lineHeight: 22,
    fontFamily: "RobotoMono_400Regular",
  },
  emailText: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  formCard: {
    flex: 1,
    marginTop: 50,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  otpContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 24,
    fontFamily: "RobotoMono_400Regular",
  },
  otpInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 280,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "RobotoMono_400Regular",
  },
  otpInputFilled: {
    backgroundColor: "#FF7120",
    borderColor: "#FF7120",
    color: "#FFFFFF",
  },
  otpInputError: {
    borderColor: "#DC2626",
  },
  verifyButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FF7120",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
    fontFamily: "RobotoMono_400Regular",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "RobotoMono_400Regular",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  resendText: {
    color: "#6B7280",
    fontSize: 16,
    fontFamily: "RobotoMono_400Regular",
  },
  resendLink: {
    color: "#FF7120",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "RobotoMono_400Regular",
  },
  backContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  backLink: {
    color: "#6B7280",
    fontSize: 16,
    fontFamily: "RobotoMono_400Regular",
  },
});