import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { getChoreographerBookings } from '../../service/api';
import { useRefetchOnFocus } from '../hooks';
const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

// Status mapping: Display label -> API enum value
const STATUS_MAP: Record<string, string | undefined> = {
  'Tất cả': undefined,
  'Đơn đặt chờ xác nhận': 'BOOKING_PENDING',
  'Đơn đặt đã kích hoạt': 'BOOKING_ACTIVATE',
  'Đơn đặt hoàn tất': 'BOOKING_COMPLETE',
  'Đơn đặt đã hủy': 'BOOKING_CANCELLED',
  'Đơn trong trạng thái khiếu nại': 'BOOKING_COMPLAIN',
  'Đơn đặt đã kết thúc do khiếu nại và hoàn tiền': 'BOOKING_FINISH_WITH_COMPLAIN_REFUND',
};

const STATUS_CHIP_VALUES = [
  'Tất cả',
  'Đơn đặt chờ xác nhận',
  'Đơn đặt đã kích hoạt',
  'Đơn đặt hoàn tất',
  'Đơn đặt đã hủy',
  'Đơn trong trạng thái khiếu nại',
  'Đơn đặt đã kết thúc do khiếu nại và hoàn tiền',
];

export default function RequestBookingList() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('Tất cả');
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const isLoadingMoreRef = useRef(false);
  const isLoadingRef = useRef(false);
  const selectedStatusRef = useRef(selectedStatus);

  // Update ref when selectedStatus changes
  useEffect(() => {
    selectedStatusRef.current = selectedStatus;
  }, [selectedStatus]);

  const fetchData = useCallback(async (page: number, reset: boolean = false) => {
    // Prevent duplicate calls
    if (reset && isLoadingRef.current) return;
    if (!reset && isLoadingMoreRef.current) return;

    try {
      if (reset) {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);
      } else {
        isLoadingMoreRef.current = true;
        setLoadingMore(true);
      }

      const statusEnum = STATUS_MAP[selectedStatusRef.current];
      const res = await getChoreographerBookings({
        status: statusEnum,
        pageNo: page,
        pageSize: 10,
        sortBy: 'id:DESC',
      });

      const items = res.data?.items || [];
      const totalPage = res.data?.totalPage || 1;

      if (reset) {
        setData(items);
      } else {
        setData(prev => [...prev, ...items]);
      }

      setTotalPages(totalPage);
      setHasMore(page < totalPage);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Lỗi khi tải danh sách đặt lịch');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
      isLoadingMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    setPageNo(1);
    setHasMore(true);
    isLoadingMoreRef.current = false;
    isLoadingRef.current = false;
    fetchData(1, true);
  }, [selectedStatus, fetchData]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMoreRef.current || loadingMore || !hasMore || loading || isLoadingRef.current) {
      return;
    }
    const nextPage = pageNo + 1;
    setPageNo(nextPage);
    fetchData(nextPage, false);
  }, [loadingMore, hasMore, loading, pageNo, fetchData]);

  const openDetail = (booking: any) => {
    const bookingId = booking?.id;

    if (bookingId) {
      router.push({
        pathname: '/Choreographer/BookingDetailOnHold',
        params: { bookingId: String(bookingId) },
      });
      return;
    }

    try {
      const serialized = encodeURIComponent(JSON.stringify(booking));
      router.push({ pathname: '/Choreographer/BookingDetailOnHold', params: { booking: serialized } });
    } catch {
      router.push({ pathname: '/Choreographer/BookingDetailOnHold', params: { booking } as any });
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Đơn đặt lịch' }} />
      <Text style={styles.header}>Danh sách đơn đặt lịch</Text>

      {/* Status filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {STATUS_CHIP_VALUES.map((label) => {
          const active = selectedStatus === label;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedStatus(label)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
            if (isNearBottom && !isLoadingMoreRef.current && hasMore && !loading && !loadingMore) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {data.length === 0 ? (
            <Text style={styles.emptyText}>Không có đơn nào.</Text>
          ) : (
            <>
              {data.map((item, idx) =>
                <BookingCard key={item.id || idx} booking={item} onPress={() => openDetail(item)} />
              )}
              {loadingMore && (
                <ActivityIndicator color={ORANGE2} style={{ marginTop: 20, marginBottom: 20 }} />
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function BookingCard({ booking, onPress }: { booking: any; onPress?: () => void }) {
  const qty = booking.numberOfTrainingSessions ?? (booking.trainingSessions?.length || 0);
  const perSessionPrice = booking?.choreography?.price; // optional per-session price (show as crossed if you like)
  const totalPrice = booking.price;
  const title = booking.customer?.name || 'Khách hàng';
  const subtitle = `${booking.area?.ward || ''}${booking.area?.ward ? ', ' : ''}${booking.area?.city || ''}`;
  const hasFeedback = Array.isArray(booking.feedbacks) && booking.feedbacks.length > 0;
  const isCompleted = (booking?.statusName || '').trim() === 'Đơn đặt hoàn tất';
  const showFeedbackRow = hasFeedback || isCompleted;
  const ava = booking.customer?.avatar;

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
      <View style={styles.rowTop}>
        {/* Thumbnail */}
        <View style={styles.thumb}>
          {ava ? (
            <Image 
              source={{ uri: ava }} 
              style={styles.thumbImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.thumbInitial}>{(title || 'K')[0].toUpperCase()}</Text>
          )}
        </View>

        {/* Title + subtitle */}
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Quantity */}
        <Text style={styles.qty}>x{qty}</Text>
      </View>

      {/* Total line */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng số tiền ({qty} buổi): </Text>
        <Text style={styles.totalValue}>{formatNumber(totalPrice)}đ</Text>
      </View>
    
      {showFeedbackRow && (
        <View style={styles.feedbackRow}>
          <Text style={[styles.feedbackBadge, hasFeedback ? styles.feedbackPositive : styles.feedbackMuted]}>
            {hasFeedback ? 'Khách đã đánh giá' : 'Chưa có đánh giá'}
          </Text>
          {hasFeedback && (
            <Text style={styles.feedbackCount}>{booking.feedbacks.length} đánh giá</Text>
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
    fontSize: 21,
    color: ORANGE2,
    textAlign: 'center',
    letterSpacing: 0.2,
    fontFamily: 'RobotoMono_700Bold',
  },
  chipsRow: {
    paddingHorizontal: 12,
    paddingVertical: 0, // reduced vertical padding
    gap: 6,
    
  },
  listAbsolute: {
    position: 'absolute',
    top: 110, // near top under header + chips
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  chip: {
    backgroundColor: '#FFF4E8',
    paddingVertical: 4, // was 6
    paddingHorizontal: 10,
    borderRadius: 12, // was 14
    borderWidth: 1,
    borderColor: '#FFD8B4',
    marginRight: 8,
    height: 32, // was 38
  },
  
  chipActive: {
    backgroundColor: ORANGE2,
    borderColor: ORANGE2,
  },
  chipText: {
    color: ORANGE2,
    fontSize: 13,
    fontFamily: 'RobotoMono_700Bold',
  },
  chipTextActive: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'RobotoMono_700Bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 56,
    fontSize: 18,
    color: '#BBB',
    fontFamily: 'Roboto',
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
  thumbEmoji: {
    fontSize: 28,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  thumbInitial: {
    fontSize: 28,
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
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
    fontFamily: 'RobotoMono_700Bold',
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
    fontFamily: 'Roboto',
  },
  totalValue: {
    color: ORANGE2,
    fontSize: 20,
    marginLeft: 8,
    fontFamily: 'RobotoMono_700Bold',
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
