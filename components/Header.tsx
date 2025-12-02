import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNotificationStore } from '../states/notificationStore';

interface HeaderProps {
  userName?: string;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  userName = 'User', 
  onNotificationPress, 
  onMenuPress 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { unreadCount } = useNotificationStore();
  
  // Debug: Log the userName prop
  console.log('Header userName prop:', userName);
  
  // Handle cases where userName might be undefined, null, or empty
  const displayName = userName && userName !== 'User' ? userName : 'Guest';
  const originalText = `Hi, ${displayName}`;

  useEffect(() => {
    // Always start with empty string to prevent showing full text first
    if (userName && userName !== 'User' && !hasStartedAnimation) {
      setDisplayText('');
      setHasStartedAnimation(true);
    } else if (!userName) {
      // If userName is still loading, show a placeholder
      setDisplayText('Hi, ...');
    }
  }, [userName, hasStartedAnimation]);

  const generateRandomChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
        // Generate random characters for each position
        const randomText = originalText
          .split('')
          .map((char) => {
            // Skip spaces and special characters
            if (char === ' ' || !/[A-Za-z0-9]/.test(char)) {
              return char;
            }
            
            // Gradually reveal the original character
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
        // Animation complete, show original text
        setDisplayText(originalText);
        setIsAnimating(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, stepDuration);
  };

  const stopAnimation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAnimating(false);
    setDisplayText(originalText);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start animation immediately when we have the correct userName
  useEffect(() => {
    if (userName && userName !== 'User' && hasStartedAnimation) {
      // Start animation immediately without delay
      startAnimation();
    }
  }, [userName, hasStartedAnimation]);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {userName && userName !== 'User' ? displayText : 'Hi, ...'}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
            <Text style={styles.iconText}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.subtextContainer}>
        {/* <Text style={styles.greetingSubtext}>Chào mừng bạn trở lại! </Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  greetingContainer: {
    flex: 1,
  },
  subtextContainer: {
    marginTop: 4,
  },
  greeting: {
    fontSize: 16,
    color: "#374151",
    fontFamily: "RobotoMono_400Regular",
  },
  greetingSubtext: {
    fontSize: 24,
    color: "#111827",
    // fontWeight: "700",
    marginTop: 4,
    fontFamily: "RobotoMono_700Bold",
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: "#374151",
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
});

