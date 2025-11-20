import { View, Text, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Animated from 'react-native-reanimated';
import { SlideInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { signUpUser } from '../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppModal } from '../hooks/useAppModal';
export default function signUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showModal, modal } = useAppModal();

  const onSubmit = async () => {
    if (!email || !fullName || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      const payload = { email, name: fullName, password, role: "USER" as const };
      const res = await signUpUser(payload);
      console.log("signup response:", res?.data ?? res);
      const token = res?.data?.accessToken || res?.data?.token;
      if (token) {
        await AsyncStorage.setItem("token", token);
      }
      showModal({
        title: "Thành công",
        message: "Đăng ký thành công",
        status: "success",
        buttons: [
          {
            text: "OK",
            variant: "primary",
            onPress: () => router.push({ pathname: "/otpSignUp", params: { email } }),
          },
        ],
      });
    } catch (e: any) {
      console.log("signup error:", e?.response?.data ?? e);
      const message = e?.response?.data?.message || e?.message || "Đăng ký thất bại";
      setError(message);
      showModal({
        title: "Đăng ký thất bại",
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
        <Text style={styles.headerTitle}>Tạo tài khoản</Text>
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
          <Text style={styles.inputLabel}>Họ & tên</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nguyễn Văn A"
            placeholderTextColor="#9CA3AF"
            keyboardType="default"
            autoCapitalize="words"
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
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nhập lại mật khẩu</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
          />
        </View>


        <View style={styles.rowBetween}>
          <View />
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={[styles.loginButton, loading && { opacity: 0.7 }]} activeOpacity={0.9} onPress={onSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Tạo tài khoản</Text>
          )}
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.signupLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
      {modal}
   </SafeAreaView>
  )
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
    alignItems: "flex-start", // Change from "center" to "flex-start"
    justifyContent: "center",
    paddingHorizontal: 20, // Add horizontal padding for proper spacing
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 20,
    fontFamily: "RobotoMono_400Regular",
    // Remove justifyContent as it doesn't work on Text components
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
    fontWeight: "600",
    fontFamily: "RobotoMono_400Regular",
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
    fontWeight: "600",
    fontFamily: "RobotoMono_400Regular",
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
    fontWeight: "600",
    fontSize: 18,
    fontFamily: "RobotoMono_400Regular",
  },
  errorText: {
    color: "#DC2626",
    marginTop: 8,
    marginBottom: 8,
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
    fontWeight: "600",
  },
});