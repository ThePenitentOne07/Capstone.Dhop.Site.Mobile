
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useUserInfo } from '../hooks/useUserInfo';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, Easing } from 'react-native-reanimated';

const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

export default function CustomerMenu(){
    const router = useRouter();
    const { user, loading } = useUserInfo();
    const avatar = require('../assets/vecteezy_man-using-smartphone-device_24096847.png');
    const username = user?.name || 'Choreographer';
    // @ts-ignore: walletBalance might not be defined
    const coin = (user && typeof user.walletBalance !== 'undefined') ? user.walletBalance : 1200;
  
    return (
      <View style={styles.root}>
              <Stack.Screen
                  options={{ 
                    headerShown: true,
                    title: 'Menu',
                    headerStyle: {
                      backgroundColor: "#FF7A00",
                    },
                    headerTintColor: "#FFFFFF",
                    headerTitleStyle: {
                      fontWeight: "600",
                    }
                  }} 
              />
  
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* PROFILE SECTION */}
          <Animated.View style={[styles.profileSection, stylesAnimated.profileAnimated]}>
            <Image source={avatar} style={styles.profilePic} />
            <View style={{flex:1}}>
              <Text style={styles.name}>{username}</Text>
            </View>
          </Animated.View>
  
          {/* MENU LIST */}
          <View style={styles.menuSection}>
            <MenuButton index={0} icon="📜" label="Lịch đặt" onPress={()=>{router.push('/BookingList')}} />
            <MenuButton index={1} icon="" label="Ví tiền" />
            <MenuButton index={2} icon="" label="Lịch sử giao dịch" />
            <MenuButton index={3} icon="" label="Chat" onPress={()=>{router.push('/ChatList')}} />
            <MenuButton index={4} icon="" label="Lịch" showLast={true} />
          </View>
          {loading && <ActivityIndicator color={ORANGE2} style={{marginTop:20}} />}
        </ScrollView>
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
      <AnimatedTouchable style={[styles.menuBtn, showLast && {marginBottom: 0}, animatedStyle]}
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
      fontWeight: '700',
      color: ORANGE2,
    },
    location: {
      color: ORANGE,
      fontSize: 14,
      marginTop: 2,
      fontWeight: '500',
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
      fontWeight: 'bold',
      fontSize: 15,
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
      fontWeight: '700',
      fontSize: 15,
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
      fontWeight: '700',
      fontSize: 15,
      opacity: 0.91,
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
      fontWeight: '600',
      flex:1,
      color: ORANGE2,
    },
    menuArrow: {
      fontSize: 20,
      color: ORANGE2,
      fontWeight: '800',
      marginLeft: 8,
      marginRight:6,
      opacity: 0.7,
    },
  });

  // Animated styles that must be created outside render cycle
  const stylesAnimated = (() => {
    const profileOpacity = typeof useSharedValue === 'function' ? useSharedValue(0) : { value: 0 as any };
    const profileTranslateY = typeof useSharedValue === 'function' ? useSharedValue(18) : { value: 18 as any };
    // kick off on mount
    useEffect(() => {
      profileOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
      profileTranslateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    }, []);
    const profileAnimated = useAnimatedStyle(() => ({
      opacity: profileOpacity.value,
      transform: [{ translateY: profileTranslateY.value }],
    }));
    return { profileAnimated } as const;
  })();
  