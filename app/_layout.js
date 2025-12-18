import { Stack, useRouter } from "expo-router";
import { useFonts, RobotoMono_400Regular, RobotoMono_700Bold } from "@expo-google-fonts/roboto-mono";
import { useUserInfo } from "../hooks/useUserInfo";
import { useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSocketStore } from "../states/socketStore";
import { useNotificationStore } from "../states/notificationStore";
import { getNotifications, registerFCMToken } from "../service/api";
import { Platform } from "react-native";
import * as Notifications from 'expo-notifications';
import { 
  registerForPushNotificationsAsync, 
  setupNotificationListeners,
  setBadgeCount 
} from "../service/notificationService";
import { logAsyncStorage } from "../utils/logAsyncStorage";

export default function Layout() {
  const router = useRouter();
  const [loaded] = useFonts({
    RobotoMono_400Regular,
    RobotoMono_700Bold,
  });
  
  // Call the hook on every screen
  const { user, loading, error } = useUserInfo();
  const { socket, initSocket, disconnectSocket } = useSocketStore();
  const { addNotification, setNotifications, unreadCount } = useNotificationStore();
  const notificationListener = useRef();
  const responseListener = useRef();
  const didDumpStorage = useRef(false);

  const normalizeRole = (roleValue) => {
    if (!roleValue) return undefined;
    const toUpper = (value) => value.trim().toUpperCase();

    if (typeof roleValue === 'string') {
      return toUpper(roleValue);
    }

    if (Array.isArray(roleValue)) {
      const first = roleValue[0];
      if (typeof first === 'string') {
        return toUpper(first);
      }
      if (first && typeof first === 'object' && 'name' in first && typeof first.name === 'string') {
        return toUpper(first.name);
      }
    }

    if (typeof roleValue === 'object' && roleValue !== null && 'name' in roleValue) {
      const name = roleValue.name;
      if (typeof name === 'string') {
        return toUpper(name);
      }
    }

    return undefined;
  };

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
    // Dev helper: dump AsyncStorage once per app launch (helps debug auth/session issues)
    if (__DEV__ && !didDumpStorage.current) {
      didDumpStorage.current = true;
      logAsyncStorage();
    }

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

  // Listen for notification events when socket is ready
  useEffect(() => {
    if (!socket) return;

    // Generic notification handler - handles server-sent notification objects
    const notificationHandler = (data) => {
      console.log('Received notification event:', data);
      
      // If data is already a notification object from server
      if (data && (data.title || data.message)) {
        const mapped = mapServerNotification(data);
        addNotification({
          title: mapped.title,
          message: mapped.message,
          type: mapped.type,
          data: mapped.data
        });
        // Refetch notifications to ensure count is accurate
        fetchInitialNotifications();
      } else {
        // Fallback for simple message data
        addNotification({
          title: data.title || 'Notification',
          message: data.message || 'You have a new notification!',
          type: data.type || 'info',
          data: data
        });
        fetchInitialNotifications();
      }
    };

    // Specific event handlers with better titles
    const bookingHandler = (data) => {
      addNotification({
        title: data.title || 'New Booking',
        message: data.message || 'You have a new booking!',
        type: 'info',
        data: data
      });
      fetchInitialNotifications();
      console.log('Received booking event:', data);
    };

    const chatHandler = (data) => {
      addNotification({
        title: data.title || 'New Message',
        message: data.message || 'You have a new message!',
        type: 'info',
        data: data
      });
      fetchInitialNotifications();
      console.log('Received chat event:', data);
    };

    // Listen for generic notification events (most common)
    socket.on('NOTIFICATION', notificationHandler);
    socket.on('notification', notificationHandler);
    socket.on('new_notification', notificationHandler);

    // Listen for specific booking events
    socket.on('NEW_BOOKING', bookingHandler);
    socket.on('BOOKING_ACCEPTED', bookingHandler);
    socket.on('BOOKING_CANCELLED', bookingHandler);
    socket.on('BOOKING_COMPLETED', bookingHandler);
    socket.on('STAFF_APPROVED', bookingHandler);
    socket.on('STAFF_REJECTED', bookingHandler);

    // Listen for chat events
    socket.on('CHAT_MESSAGE', chatHandler);

    return () => {
      socket.off('NOTIFICATION', notificationHandler);
      socket.off('notification', notificationHandler);
      socket.off('new_notification', notificationHandler);
      socket.off('NEW_BOOKING', bookingHandler);
      socket.off('BOOKING_ACCEPTED', bookingHandler);
      socket.off('BOOKING_CANCELLED', bookingHandler);
      socket.off('BOOKING_COMPLETED', bookingHandler);
      socket.off('CHAT_MESSAGE', chatHandler);
      socket.off('STAFF_APPROVED', bookingHandler);
      socket.off('STAFF_REJECTED', bookingHandler);
    };
  }, [socket, addNotification, mapServerNotification, fetchInitialNotifications]);
  
  useEffect(() => {
    if (user && !loading) {
      fetchInitialNotifications();
    }
  }, [user, loading, fetchInitialNotifications]);

  // Initialize Push Notifications
  useEffect(() => {
    if (!user || loading) return;

    let isMounted = true;

    const setupPushNotifications = async () => {
      try {
        // Register for push notifications and get token
        const token = await registerForPushNotificationsAsync();
        
        if (token && isMounted) {
          console.log('📱 Push Notification Token:', token);
          
          // Send token to backend
          try {
            await registerFCMToken({
              token,
              deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
            });
            console.log('✅ Token registered with backend');
          } catch (error) {
            console.error('❌ Failed to register token with backend:', error);
          }
        }

        // Setup notification listeners
        const cleanup = setupNotificationListeners(
          // Handler for notification received (foreground)
          (notification) => {
            const { title, body, data } = notification.request.content;
            addNotification({
              title: title || 'Notification',
              message: body || '',
              type: data?.type || 'info',
              data: data,
            });
            fetchInitialNotifications();
          },
          // Handler for notification tapped
          (response) => {
            const { data } = response.notification.request.content;
            console.log('Notification tapped with data:', data);

            if (!data) return;

            const nType = data.notificationType;
            const conversationId = data.conversationId;
            const bookingId = data.bookingId;

            try {
              if (nType === 'CHAT' && conversationId) {
                const conversationParam = JSON.stringify({ id: String(conversationId) });
                router.push({
                  pathname: '/ChatDetail',
                  params: {
                    conversation: conversationParam,
                  },
                });
              } else if (nType === 'BOOKING_CHOREOGRAPHER' && bookingId) {
                const userRole = normalizeRole(user?.role);
                const roleUpper = userRole || '';

                if (roleUpper === 'CHOREOGRAPHY' || roleUpper === 'CHOREOGRAPHER') {
                  router.push({
                    pathname: '/Choreographer/BookingDetailOnHold',
                    params: {
                      bookingId: String(bookingId),
                    },
                  });
                } else {
                  router.push({
                    pathname: '/BookingDetail',
                    params: {
                      bookingId: String(bookingId),
                    },
                  });
                }
              } else if (nType === 'BOOKING_DANCER' && bookingId) {
                const userRole = normalizeRole(user?.role);
                const roleUpper = userRole || '';

                if (roleUpper === 'DANCER') {
                  router.push({
                    pathname: '/Dancer/DancerBookingDetail',
                    params: {
                      bookingId: String(bookingId),
                    },
                  });
                } else {
                  router.push({
                    pathname: '/DancerBookingDetailCustomer',
                    params: {
                      bookingId: String(bookingId),
                    },
                  });
                }
              }
            } catch (err) {
              console.error('Failed to navigate from tapped push notification:', err);
            }
          }
        );

        return cleanup;
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    setupPushNotifications().then(cleanup => {
      if (cleanup) {
        notificationListener.current = cleanup;
      }
    });

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current();
      }
    };
  }, [user, loading, addNotification, fetchInitialNotifications]);

  // Update badge count when unread count changes
  useEffect(() => {
    setBadgeCount(unreadCount);
  }, [unreadCount]);

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerStyle: {
          backgroundColor: "#FF7A00",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontFamily: "RobotoMono_700Bold",
        },
      }}
    >
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
            fontFamily: "RobotoMono_700Bold",
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
            fontFamily: "RobotoMono_700Bold",
          }
        }} 
      />
      <Stack.Screen 
        name="DetailsDancer/[id]" 
        options={{ 
          headerShown: true,
          title: "Chi tiết nhóm nhảy",
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
            fontFamily: "RobotoMono_700Bold",
          }
        }} 
        />
      <Stack.Screen name="DancerBooking/[id]" 
        options={{ 
          headerShown: true,
          title: "Đặt lịch nhóm nhảy",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontFamily: "RobotoMono_700Bold",
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
            fontFamily: "RobotoMono_700Bold",
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
            fontFamily: "RobotoMono_700Bold",
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
            fontFamily: "RobotoMono_700Bold",
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
            fontFamily: "RobotoMono_700Bold",
          }
        }} 
      />
    </Stack>
  );
}