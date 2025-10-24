import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hey, {userName}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.subtextContainer}>
        <Text style={styles.greetingSubtext}>Chào bạn trở lại! </Text>
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
    fontWeight: "400",
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
});

