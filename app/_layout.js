import { Stack } from "expo-router";
import { useFonts, RobotoMono_400Regular, RobotoMono_700Bold } from "@expo-google-fonts/roboto-mono";
import { useUserInfo } from "../hooks/useUserInfo";
import { useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSocketStore } from "../states/socketStore";
import { useNotificationStore } from "../states/notificationStore";
import { getNotifications } from "../service/api";

export default function Layout() {
  const [loaded] = useFonts({
    RobotoMono_400Regular,
    RobotoMono_700Bold,
  });
  
  // Call the hook on every screen
  const { user, loading, error } = useUserInfo();
  const { socket, initSocket, disconnectSocket } = useSocketStore();
  const { addNotification, setNotifications } = useNotificationStore();

  const mapServerNotification = useCallback((item) => ({
    id: item.id,
    title: item.title ?? "Notification",
    message: item.message ?? "",
    type: item.type === "success" || item.type === "warning" || item.type === "error" ? item.type : "info",
    timestamp: new Date(item.createdAt),
    read: !!item.read,
    data: {
      link: item.link,
      userUUID: item.userUUID,
    },
  }), []);

  const fetchInitialNotifications = useCallback(async () => {
    try {
      const response = await getNotifications();
      const items = response.data?.items ?? [];
      const mapped = items.map(mapServerNotification);
      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [mapServerNotification, setNotifications]);

  // Initialize socket when user is authenticated
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token && user) {
          console.log('Initializing socket for user:', user.id);
          initSocket(token);
        }
      } catch (err) {
        console.error('Error initializing socket:', err);
      }
    };

    if (user && !loading) {
      initializeSocket();
    }

    // Cleanup when user logs out
    return () => {
      if (!user) {
        console.log('User logged out, disconnecting socket');
        disconnectSocket();
      }
    };
  }, [user, loading, initSocket, disconnectSocket]);

  // Listen for NEW_BOOKING events when socket is ready
  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      addNotification({
        title: 'New Booking',
        message: data.message || 'You have a new booking!',
        type: 'info',
        data: data
      });

      console.log('Received NEW_BOOKING:', data);
    };

    socket.on('NEW_BOOKING', handler);
    socket.on('BOOKING_ACCEPTED', handler);
    socket.on('BOOKING_CANCELLED', handler);
    socket.on('BOOKING_COMPLETED', handler);
    socket.on('CHAT_MESSAGE', handler);
    socket.on('STAFF_APPROVED', handler);
    socket.on('STAFF_REJECTED', handler);

    return () => {
      socket.off('NEW_BOOKING', handler);
      socket.off('BOOKING_ACCEPTED', handler);
      socket.off('BOOKING_CANCELLED', handler);
      socket.off('BOOKING_COMPLETED', handler);
      socket.off('CHAT_MESSAGE', handler);
      socket.off('STAFF_APPROVED', handler);
      socket.off('STAFF_REJECTED', handler);
    };
  }, [socket, addNotification]);
  
  useEffect(() => {
    if (user && !loading) {
      fetchInitialNotifications();
    }
  }, [user, loading, fetchInitialNotifications]);

  if (!loaded) return null;

  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" options={{ headerShown: false }} />
      <Stack.Screen name="OtpSignUp" options={{ headerShown: false }} />
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
      <Stack.Screen name="BookingFeedback" options={{ headerShown: true, title: "Đánh giá" }} />
      <Stack.Screen name="Choreographer/ChoreographerHome" options={{ headerShown: false }} />
      <Stack.Screen name="Choreographer/RequestBookingList" options={{ headerShown: true, title: "Đơn đặt lịch" }} />
      <Stack.Screen name="Choreographer/BookingDetailOnHold" options={{ headerShown: true, title: "Chi tiết đơn đặt" }} />
      <Stack.Screen name="Choreographer/CheckInQr" options={{ headerShown: false }} />
      <Stack.Screen name="Choreographer/Explore" options={{ headerShown: false }} />
      <Stack.Screen name="CustomerQRCheckIn" options={{ headerShown: false }} />
      <Stack.Screen 
        name="DetailsChoreography/[id]" 
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
      <Stack.Screen name="ChoreographerBooking/[id]" 
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
      <Stack.Screen 
        name="NotificationList" 
        options={{ 
          headerShown: true,
          title: "Thông báo",
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
        name="Complaint" 
        options={{ 
          headerShown: true,
          title: "Khiếu nại",
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