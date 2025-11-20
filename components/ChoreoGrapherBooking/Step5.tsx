import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getChoreographerBookingTotalPrice, createChoreographerBooking } from '../../service/api';
import { ChoreographerBooking } from '../../models/choreographerBooking';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import Successful from './Successful';

interface Step5Props {
  choreographerId: string;
  areaId: number; // id of ward from Step4
  location: string;
  detail?: string;
  sessions: { dateISO: string; startTime: string; durationMinutes: number }[]; // from Step3
}

function toScheduledISO(dateISO: string, hhmm: string): string {
  const datePart = dateISO.split('T')[0];
  const [hh, mm] = hhmm.split(':');
  return `${datePart}T${hh}:${mm}:00`;
}

export default function Step5({ choreographerId, areaId, location, detail, sessions }: Step5Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [totalSessions, setTotalSessions] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean | null>(null);
  const { formatCurrency } = useFormatCurrency();
  const payload: ChoreographerBooking = useMemo(() => ({
    choreographerId,
    areaId: String(areaId),
    location,
    detail: detail ?? '',
    trainingSessionRequests: sessions.map((s) => ({
      durationMinutes: s.durationMinutes,
      scheduledTime: toScheduledISO(s.dateISO, s.startTime),
    })),
  }), [choreographerId, areaId, location, detail, sessions]);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getChoreographerBookingTotalPrice(payload);
      // Expecting API to return { totalPrice: number } or similar
      const value = res?.data?.totalPrice ?? res?.data?.data ?? res?.data;

      if (typeof value === 'number') {
        setTotalPrice(value);
      } else {
        setError('Không thể đọc tổng giá từ phản hồi.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Đã xảy ra lỗi khi tính tổng giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
    console.log("payload booking",payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  useEffect(() => {
    setTotalSessions(sessions?.length ?? 0);
  }, [sessions]);

  const handleBook = async () => {
    setBookingLoading(true);
    setError(null);
    setBookingSuccess(null);
    try {
      await createChoreographerBooking(payload);
      
      
      setBookingSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Đặt lịch thất bại.');
      setBookingSuccess(false);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      {bookingSuccess === true ? (
        <Successful totalPrice={totalPrice ?? 0} sessions={sessions} />
      ) : (
      <View style={styles.card}>
        <Text style={styles.title}>Tổng giá tiền là:</Text>
        <Text style={styles.subtitle}>{totalSessions} buổi </Text>
        {/* <Text style={styles.subtitle}>{formatCurrency(totalPrice ?? 0)}</Text> */}

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

        {typeof totalPrice === 'number' && (
          <View style={styles.result}>
            <Text style={styles.resultLabel}>Tổng giá ước tính</Text>
            <Text style={styles.resultValue}> {formatCurrency(totalPrice ?? 0)}</Text>
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.bookBtn, (loading || bookingLoading || totalPrice == null) && styles.bookBtnDisabled]}
          onPress={handleBook}
          disabled={loading || bookingLoading || totalPrice == null}
          activeOpacity={0.8}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.bookBtnText}>Đặt lịch!</Text>
          )}
        </TouchableOpacity>

        {/* Success handled by rendering <Successful /> above */}
      </View>
      )}
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  loadingRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
  },
  result: {
    marginTop: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  resultLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#78350F',
  },
  errorText: {
    marginTop: 12,
    color: '#DC2626',
  },
  sessionsList: {
    marginTop: 8,
  },
  sessionItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  bookBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 16,
  },
  bookBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successText: {
    marginTop: 12,
    color: '#059669',
    fontWeight: '700',
  },
});

