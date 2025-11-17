import { View, Text } from 'react-native'
import React from 'react'
import { useFormatCurrency } from '../../hooks/useFormatCurrency'
import { StyleSheet } from 'react-native'
import { colors } from '../../styles/shared'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { 
  FadeInDown, 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Extrapolate,
  Easing
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { useState } from 'react'
import { checkUserBalance } from '../../service/api'

const TotalBallance = () => {
    const { formatCurrency } = useFormatCurrency()
    const [balance, setBalance] = useState(0)
    const checkBallance= checkUserBalance()
    // Animation values
    const opacity = useSharedValue(0)
    const translateY = useSharedValue(20)
    const shimmer = useSharedValue(0)
    const fetchBallance= async()=>{
      const res = await checkBallance
      setBalance(res.data.result)
      
    }
    
    useEffect(() => {
      // Quick smooth fade in without bounce
      opacity.value = withTiming(1, { 
        duration: 400,
        easing: Easing.out(Easing.ease)
      })
      translateY.value = withTiming(0, { 
        duration: 400,
        easing: Easing.out(Easing.ease)
      })
      
      // Shimmer effect
      shimmer.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        false
      )
      fetchBallance()

    }, [])
    
    
    const cardAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateY: translateY.value }
        ],
        opacity: opacity.value,
      }
    })
    
    const shimmerAnimatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        shimmer.value,
        [0, 1],
        [-200, 200],
        Extrapolate.CLAMP
      )
      
      return {
        transform: [{ translateX }],
        opacity: interpolate(
          shimmer.value,
          [0, 0.5, 1],
          [0, 0.3, 0],
          Extrapolate.CLAMP
        ),
      }
    })
    
  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      <LinearGradient
        colors={[colors.primary, '#FF9500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Shimmer effect overlay */}
        <Animated.View 
          style={[
            styles.shimmer,
            shimmerAnimatedStyle
          ]}
        />
        
        <View style={styles.content}>
          <Animated.View 
            style={styles.headerRow}
            entering={FadeIn.delay(100).duration(300)}
          >
            <Text style={styles.label}>Số tiền trong ví của bạn</Text>
          </Animated.View>
          
          <Animated.Text 
            style={styles.amount}
            entering={FadeIn.delay(150).duration(300)}
          >
            {formatCurrency(balance)} 
          </Animated.Text>
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    gradient: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    content: {
        padding: 24,
        position: 'relative',
        zIndex: 1,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 100,
        zIndex: 0,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        fontWeight: '500',
    },
    eyeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eyeIconText: {
        fontSize: 16,
    },
    amount: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 24,
        letterSpacing: 0.5,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    footerItem: {
        flex: 1,
    },
    footerLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.8,
        marginBottom: 4,
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },
});

export default TotalBallance