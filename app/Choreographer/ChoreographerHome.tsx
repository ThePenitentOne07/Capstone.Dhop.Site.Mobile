import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useUserInfo } from '../../hooks/useUserInfo';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring, Easing, withDelay } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppModal } from '../../hooks/useAppModal';
import { useNotificationStore } from '../../states/notificationStore';

const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

export default function ChoreographerHome() {
  const router = useRouter();
  const { user, loading } = useUserInfo();
  const { showModal, modal } = useAppModal();
  const { unreadCount } = useNotificationStore();
  const avatarSource = user?.avatar
    ? { uri: user.avatar }
    : require('../../assets/vecteezy_man-using-smartphone-device_24096847.png');
  const username = user?.name || 'Choreographer';
  const handleLogout = () => {
    showModal({
      title: 'Đăng xuất',
      message: 'Bạn chắc chắn muốn đăng xuất?',
      status: 'info',
      buttons: [
        {
          text: 'Hủy',
          variant: 'secondary',
        },
        {
          text: 'Đăng xuất',
          destructive: true,
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'user']);
            router.replace('/Login');
          },
        },
      ],
    });
  };
  // @ts-ignore: walletBalance might not be defined
  const coin = (user && typeof user.walletBalance !== 'undefined') ? user.walletBalance : 1200;

  // Greeting randomizer (ported from Header)
  const [displayText, setDisplayText] = useState('Hi, ...');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const displayName = username && username !== 'Choreographer' ? username : 'Guest';
  const originalText = `Hi, ${displayName}`;

  useEffect(() => {
    if (username && username !== 'Choreographer' && !hasStartedAnimation) {
      setDisplayText('');
      setHasStartedAnimation(true);
    } else if (!username) {
      setDisplayText('Hi, ...');
    }
  }, [username, hasStartedAnimation]);

  const generateRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  const startAnimation = () => {
    if (isAnimating || !originalText) return;
    setIsAnimating(true);
    const duration = 800;
    const steps = 20;
    const stepDuration = duration / steps;
    let step = 0;
    intervalRef.current = setInterval(() => {
      if (step < steps) {
        const randomText = originalText
          .split('')
          .map((char) => {
            if (char === ' ' || !/[A-Za-z0-9]/.test(char)) {
              return char;
            }
            const revealProbability = step / steps;
            if (Math.random() < revealProbability) {
              return char;
            }
            return generateRandomChar();
          })
          .join('');
        setDisplayText(randomText);
        step++;
      } else {
        setDisplayText(originalText);
        setIsAnimating(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, stepDuration);
  };

  useEffect(() => {
    if (username && username !== 'Choreographer' && hasStartedAnimation) {
      startAnimation();
    }
  }, [username, hasStartedAnimation]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Profile section entry animation
  const profileOpacity = useSharedValue(0);
  const profileTranslateY = useSharedValue(18);
  useEffect(() => {
    // Start immediately on mount
    profileOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    profileTranslateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [profileOpacity, profileTranslateY]);
  const profileAnimatedStyle = useAnimatedStyle(() => ({
    opacity: profileOpacity.value,
    transform: [{ translateY: profileTranslateY.value }],
  }));

  return (
    <View style={styles.root}>
            <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* TOP GREETING */}
        <View style={styles.headerTopRow}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{username ? displayText : 'Hi, ...'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/NotificationList')}
            >
              <Text style={styles.iconText}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
          </View>
        </View>
        {/* PROFILE SECTION */}
        <Animated.View style={[styles.profileSection, profileAnimatedStyle]}>
          <Image source={avatarSource} style={styles.profilePic} />
          <View style={{flex:1}}>
            <Text style={styles.name}>{username}</Text>
          </View>
        </Animated.View>

        {/* MENU LIST */}
        <View style={styles.menuSection}>
          <MenuButton index={0} icon="" label="Lịch đặt" onPress={()=>{router.push('/Choreographer/RequestBookingList')}} />
          {/* <MenuButton index={1} icon="💳" label="Ví tiền" /> */}
          {/* <MenuButton index={2} icon="📈" label="Lịch sử giao dịch" /> */}
          {/* <MenuButton index={2} icon="" label="Khiếu nại đơn đặt" onPress={()=>{router.push('/PlatformComplaint')}} /> */}

          <MenuButton index={1} icon="" label="Chat" onPress={()=>{router.push('/ChatList')}} />

          <MenuButton index={2} icon="" label="Quét mã check in" onPress={()=>{router.push('/Choreographer/CheckInQr')}} />
          <MenuButton index={3} icon="" label="Đăng xuất" showLast={true} onPress={handleLogout} />
        </View>
        {loading && <ActivityIndicator color={ORANGE2} style={{marginTop:20}} />}
      </ScrollView>
      {modal}
    </View>
  );
}

function MenuButton({ index = 0, icon, label, showLast, onPress }: { index?: number; icon: string; label: string; showLast?: boolean; onPress?: () => void }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    const delayMs = 220 * index;
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  const handlePressIn = () => {
    scale.value = withSpring(0.8, { damping: 15, stiffness: 180 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 160 });
  };

  return (
    <AnimatedTouchable
      style={[styles.menuBtn, showLast && {marginBottom: 0}, animatedStyle]}
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 40,
    marginBottom: 4,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    color: '#374151',
    // fontWeight: '400',
    fontFamily: "RobotoMono_400Regular"
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  iconText: {
    fontSize: 18,
    color: '#374151',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'RobotoMono_700Bold',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 44,
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 36,
    padding: 18,
    borderWidth: 2,
    borderColor: ORANGE2,
    // very subtle shadow!
    shadowColor: ORANGE2,
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 3,
  },
  profilePic: {
    width: 68,
    height: 68,
    borderRadius: 40,
    marginRight: 18,
    borderWidth: 2,
    borderColor: ORANGE2,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 20,
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
  },
  location: {
    color: ORANGE,
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'RobotoMono_400Regular',
  },
  coinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,113,32,0.12)',
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginLeft: 12,
    minWidth: 64,
    borderWidth: 1,
    borderColor: '#FFE1BC',
  },
  coinText: {
    color: ORANGE,
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
  },
  coinIcon: {
    fontSize: 18,
    marginLeft: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FFE1BC',
  },
  tabActive: {
    flex: 1,
    backgroundColor: ORANGE2,
    borderRadius: 14,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
  },
  tabActiveText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
  },
  tabInactive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 4,
    paddingVertical: 11,
  },
  tabInactiveText: {
    color: ORANGE2,
    fontSize: 15,
    opacity: 0.91,
    fontFamily: 'RobotoMono_700Bold',
  },
  menuSection: {
    marginHorizontal: 20,
    backgroundColor:'#fff',
    borderRadius: 0,
    paddingVertical: 2,
    borderWidth: 0,
    borderColor: 'transparent',
    marginBottom:28,
    marginTop: 10,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFD8B4',
    shadowColor: ORANGE2,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
    color: ORANGE2,
  },
  menuLabel: {
    fontSize: 16,
    flex:1,
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
  },
  menuArrow: {
    fontSize: 20,
    color: ORANGE2,
    marginLeft: 8,
    marginRight:6,
    opacity: 0.7,
    fontFamily: 'RobotoMono_700Bold',
  },
});

