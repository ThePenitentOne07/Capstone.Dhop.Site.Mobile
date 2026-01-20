import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';

interface SuccessfulProps {
  totalPrice: number;
  sessions: { dateISO: string; startTime: string; durationMinutes: number }[];
  onDone?: () => void;
}

export default function Successful({ totalPrice, sessions, onDone }: SuccessfulProps) {
  const { formatCurrency } = useFormatCurrency();
  const router = useRouter();
  
  const handleNavigateToBookingList = () => {
    router.back();
  };
  
  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>
        <Text style={styles.title}>Đặt lịch thành công!</Text>
        <Text style={styles.subtitle}>Cảm ơn bạn đã đặt lịch. Chi tiết lịch như bên dưới.</Text>

        <View style={styles.sessionsList}>
          {sessions.map((s, idx) => {
            const d = new Date(s.dateISO);
            const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
            return (
              <Text key={idx} style={styles.sessionItem}>
                {dateStr} • {s.startTime} • {s.durationMinutes} phút
              </Text>
            );
          })}
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.bookingListBtn} 
            onPress={handleNavigateToBookingList} 
            activeOpacity={0.85}
          >
            <Text style={styles.bookingListText}>Quay lại</Text>
          </TouchableOpacity>
          {onDone && (
            <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
              <Text style={styles.doneText}>Xong</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 36,
    color: '#10B981',
    fontFamily: 'RobotoMono_700Bold',
  },
  title: {
    fontSize: 22,
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'RobotoMono_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'RobotoMono_400Regular',
  },
  sessionsList: {
    alignSelf: 'stretch',
    marginTop: 8,
    marginBottom: 12,
  },
  sessionItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    fontFamily: 'RobotoMono_400Regular',
  },
  totalCard: {
    alignSelf: 'stretch',
    marginTop: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    color: '#78350F',
    fontFamily: 'RobotoMono_700Bold',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  bookingListBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bookingListText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  doneBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
});



