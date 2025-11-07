import { Stack } from "expo-router";
import { useFonts, RobotoMono_400Regular, RobotoMono_700Bold } from "@expo-google-fonts/roboto-mono";
import { useUserInfo } from "../hooks/useUserInfo";

export default function Layout() {
  const [loaded] = useFonts({
    RobotoMono_400Regular,
    RobotoMono_700Bold,
  });
  
  // Call the hook on every screen
  const { user, loading, error } = useUserInfo();
  
  if (!loaded) return null;

  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      <Stack.Screen name="otpSignUp" options={{ headerShown: false }} />
      <Stack.Screen name="Home" options={{ headerShown: false }} />
      <Stack.Screen name="CustomerMenu" options={{ headerShown: false }} />
      <Stack.Screen name="CustomerProfile" 
        options={{ 
          headerShown: true,
          title: "Hồ sơ",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          }
        }} 
      />
      <Stack.Screen name="BookingList"  />
      <Stack.Screen name="BookingDetail" options={{ headerShown: true, title: "Chi tiết đơn đặt" }} />
      <Stack.Screen name="Choreographer/ChoreographerHome" options={{ headerShown: false }} />
      <Stack.Screen name="Choreographer/RequestBookingList" options={{ headerShown: true, title: "Đơn đặt lịch" }} />
      <Stack.Screen name="Choreographer/BookingDetailOnHold" options={{ headerShown: true, title: "Chi tiết đơn đặt" }} />
      <Stack.Screen name="Choreographer/CheckInQr" options={{ headerShown: false }} />
      <Stack.Screen name="CustomerQRCheckIn" options={{ headerShown: false }} />
      <Stack.Screen 
        name="detailsChoreography/[id]" 
        options={{ 
          headerShown: true,
          title: "Chi tiết biên đạo",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          }
        }} 
      />
      <Stack.Screen name="choreographerBooking/[id]" 
        options={{ 
          headerShown: true,
          title: "Đặt lịch",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          }
        }} 
        />
      <Stack.Screen 
        name="ChatList" 
        options={{ 
          headerShown: true,
          title: "Tin nhắn",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          }
        }} 
      />
      <Stack.Screen 
        name="ChatDetail" 
        options={{ 
          headerShown: true,
          title: "Chat",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          }
        }} 
      />
    </Stack>
  );
}