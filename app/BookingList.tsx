import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getChoreographerBookings } from '../service/api';
import { useRefetchOnFocus } from './hooks';

const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

export default function BookingList() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('Tất cả');
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getChoreographerBookings();
      if (mountedRef.current) {
        setData(res.data || []);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e?.response?.data?.message || e?.message || 'Lỗi khi tải danh sách đặt lịch');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => { 
      mountedRef.current = false; 
    };
  }, [fetchData]);

  useRefetchOnFocus(fetchData);

  const filteredData = useMemo(() => {
    if (selectedStatus === 'Tất cả') return data;
    return (data || []).filter((b) => (b?.statusName || '').trim() === selectedStatus);
  }, [data, selectedStatus]);

  const openDetail = (booking: any) => {
    const bookingId = booking?.id;

    if (bookingId) {
      router.push({
        pathname: '/BookingDetail',
        params: { bookingId: String(bookingId) },
      });
      return;
    }

    // Fallback to old behavior if booking id is missing
    try {
      const serialized = encodeURIComponent(JSON.stringify(booking));
      router.push({ pathname: '/BookingDetail', params: { booking: serialized } });
    } catch {
      router.push({ pathname: '/BookingDetail', params: { booking } as any });
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Đơn đặt lịch',
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          }
        }} 
      />
      <Text style={styles.header}>Danh sách đơn đặt lịch</Text>

      <StatusChips selected={selectedStatus} onSelect={setSelectedStatus} />

      {error && (
        <Text style={{color:'#C92A2A', textAlign:'center', marginTop:10, marginBottom:6}}>{error}</Text>
      )}
      {loading ? (
        <ActivityIndicator color={ORANGE2} style={{ marginTop: 30 }} />
      ) : (
        <ScrollView
          style={styles.listAbsolute}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 36 }}
        >
          {filteredData.length === 0 ? (
            <Text style={styles.emptyText}>Không có đơn nào.</Text>
          ) : (
            filteredData.map((item, idx) => (
              <BookingCard key={idx} booking={item} onPress={() => openDetail(item)} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const STATUS_CHIP_VALUES = [
  'Tất cả',
  'Đơn đặt chờ xác nhận',
  'Đơn đặt đã kích hoạt',
  'Đơn đặt hoàn tất'
];

function StatusChips({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      {STATUS_CHIP_VALUES.map((label) => {
        const active = selected === label;
        return (
          <TouchableOpacity
            key={label}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => onSelect(label)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function BookingCard({ booking, onPress }: { booking: any; onPress?: () => void }) {
  const qty = booking.numberOfTrainingSessions ?? (booking.trainingSessions?.length || 0);
  const totalPrice = booking.price;
  const title = booking.choreography?.username || 'Khách hàng';
  const subtitle = `${booking.area?.ward || ''}${booking.area?.ward ? ', ' : ''}${booking.area?.city || ''}`;
  const hasFeedback = Array.isArray(booking.bookingFeedbacks) && booking.bookingFeedbacks.length > 0;
  const isCompleted = (booking?.statusName || '').trim() === 'Đơn đặt hoàn tất';
  const showFeedbackRow = hasFeedback || isCompleted;
  const avatarUrl = booking.choreography?.avatarUrl;
  const avatarInitial = title?.[0]?.toUpperCase() || 'U';

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
      <View style={styles.rowTop}>
        <View style={styles.thumb}>
          {avatarUrl ? (
            <Image 
              source={{ uri: avatarUrl }} 
              style={styles.thumbImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.thumbInitial}>{avatarInitial}</Text>
          )}
        </View>
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.qty}>x{qty}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng số tiền ({qty} buổi): </Text>
        <Text style={styles.totalValue}>{formatNumber(totalPrice)}đ</Text>
      </View>

      {showFeedbackRow && (
        <View style={styles.feedbackRow}>
          <Text style={[styles.feedbackBadge, hasFeedback ? styles.feedbackPositive : styles.feedbackMuted]}>
            {hasFeedback ? 'Đã đánh giá' : 'Chưa đánh giá'}
          </Text>
          {hasFeedback && (
            <Text style={styles.feedbackCount}>{booking.bookingFeedbacks.length} đánh giá</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function formatNumber(n: number) {
  return n?.toLocaleString('vi-VN') || n;
}

const styles = StyleSheet.create({
  root: {
    minHeight: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 1,
    paddingTop: 8,
    position: 'relative',
  },
  header: {
    marginTop: 9,
    marginBottom: 6,
    // fontSize: 21,
    // fontWeight: '700',
    color: ORANGE2,
    textAlign: 'center',
    // letterSpacing: 0.2,
    fontFamily: 'RobotoMono_700Bold',
  },
  chipsRow: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    gap: 6,
  },
  listAbsolute: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chip: {
    backgroundColor: '#FFF4E8',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD8B4',
    marginRight: 8,
    height: 32,
  },
  chipActive: {
    backgroundColor: ORANGE2,
    borderColor: ORANGE2,
  },
  chipText: {
    color: ORANGE2,
    // fontWeight: '600',
    fontSize: 13,
    fontFamily: 'RobotoMono_700Bold',
  },
  chipTextActive: {
    color: '#fff',
    // fontWeight: '800',
    fontSize: 13,
    fontFamily: 'RobotoMono_700Bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 56,
    fontSize: 18,
    color: '#BBB',
    fontFamily: 'RobotoMono_400Regular',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F2E2D5',
    shadowColor: ORANGE2,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFD8B4',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  thumbInitial: {
    fontSize: 28,
    color: ORANGE2,
    fontWeight: '700',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    // fontWeight: '700',
    color: '#111827',
    fontFamily: 'RobotoMono_700Bold',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Roboto',
  },
  qty: {
    marginLeft: 10,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1EFEA',
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#6B7280',
    fontSize: 15,
    flex: 1,
    fontFamily: 'RobotoMono_400Regular',
  },
  totalValue: {
    color: ORANGE2,
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 8,
    fontFamily: 'Roboto',
  },
  feedbackRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 11,
    fontFamily: 'Roboto',
    overflow: 'hidden',
  },
  feedbackPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#0F9D58',
  },
  feedbackMuted: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  feedbackCount: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Roboto',
  },
});


