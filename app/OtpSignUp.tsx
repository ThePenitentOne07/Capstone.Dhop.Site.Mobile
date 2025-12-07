import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native"
import React, { useState, useRef, useEffect } from "react"
import Animated from "react-native-reanimated";
import { SlideInDown } from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppModal } from "../hooks/useAppModal";
import { otpSignUp } from "../service/api";

export default function OtpSignUp() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const emailValue = Array.isArray(email) ? email[0] : email || "";
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
    // Validate email
    if (!emailValue || emailValue.trim() === "") {
      setError("Email không hợp lệ");
      return;
    }

    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 số OTP");
      return;
    }

    // Validate OTP contains only numbers
    if (!/^\d{6}$/.test(otpCode)) {
      setError("Mã OTP chỉ được chứa số");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await otpSignUp(emailValue, otpCode);
      
      showModal({
        title: "Thành công",
        message: "Xác thực OTP thành công!",
        status: "success",
        buttons: [
          { text: "OK", variant: "primary", onPress: () => router.replace("/Login") },
        ],
      });
    } catch (error: any) {
      let message = "Xác thực OTP thất bại";
      
      // Extract error message from different possible response formats
      if (error?.response?.data) {
        const errorData = error.response.data;
        message = errorData.message || errorData.error || errorData.msg || message;
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          message = errorData.errors.map((e: any) => e.message || e.msg).join(", ");
        }
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }
      
      // Handle network errors
      if (error?.code === "NETWORK_ERROR" || error?.message?.includes("Network")) {
        message = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.";
      }
      
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
    // Validate email
    if (!emailValue || emailValue.trim() === "") {
      setError("Email không hợp lệ");
      return;
    }

    setError(null);
    
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
      let message = "Gửi lại OTP thất bại";
      
      // Extract error message from different possible response formats
      if (error?.response?.data) {
        const errorData = error.response.data;
        message = errorData.message || errorData.error || errorData.msg || message;
        
        // Handle validation errors
        if (errorData.errors && Array.isArray(errorData.errors)) {
          message = errorData.errors.map((e: any) => e.message || e.msg).join(", ");
        }
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }
      
      // Handle network errors
      if (error?.code === "NETWORK_ERROR" || error?.message?.includes("Network")) {
        message = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.";
      }
      
      setError(message);
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
          <Text style={styles.emailText}>{emailValue}</Text>
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

        {!!error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
    color: "#FFFFFF",
    marginTop: 20,
    fontFamily: "RobotoMono_700Bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 12,
    lineHeight: 22,
    fontFamily: "RobotoMono_400Regular",
  },
  emailText: {
    color: "#FFFFFF",
    fontFamily: "RobotoMono_700Bold",
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
    color: "#111827",
    marginBottom: 24,
    fontFamily: "RobotoMono_700Bold",
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
    color: "#111827",
    fontFamily: "RobotoMono_700Bold",
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
    fontSize: 18,
    fontFamily: "RobotoMono_700Bold",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 14,
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
    fontFamily: "RobotoMono_700Bold",
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