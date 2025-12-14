import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getDancerBookings } from '../service/api';
import { useRefetchOnFocus } from './hooks';

const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

// Status mapping: Display label -> API enum value
const STATUS_MAP: Record<string, string | undefined> = {
  'Tất cả': undefined,
  'Đơn đặt chờ xác nhận': 'BOOKING_PENDING',
  'Đơn đặt đã kích hoạt': 'BOOKING_ACTIVATE',
  'Đơn đặt không kích hoạt': 'BOOKING_NOT_ACTIVATE',
  'Đơn đặt đang tiến hành': 'BOOKING_IN_PROGRESS',
  'Đơn đặt đã hoàn thành công việc': 'BOOKING_WORK_DONE',
  'Đơn đặt hoàn tất': 'BOOKING_COMPLETE',
  'Đơn đặt chưa hoàn tất': 'BOOKING_NOT_COMPLETE',
  'Đơn đặt đã hủy': 'BOOKING_CANCELLED',
  'Đơn đặt hết chỗ': 'BOOKING_FULL',
  'Đơn trong trạng thái khiếu nại': 'BOOKING_COMPLAIN',
  'Đơn đặt đã kết thúc do khiếu nại và hoàn tiền': 'BOOKING_FINISH_WITH_COMPLAIN_REFUND',
};

const STATUS_CHIP_VALUES = [
  'Tất cả',
  'Đơn đặt chờ xác nhận',
  'Đơn đặt đã kích hoạt',
  'Đơn đặt không kích hoạt',
  'Đơn đặt đang tiến hành',
  'Đơn đặt đã hoàn thành công việc',
  'Đơn đặt hoàn tất',
  'Đơn đặt chưa hoàn tất',
  'Đơn đặt đã hủy',
  'Đơn đặt hết chỗ',
  'Đơn trong trạng thái khiếu nại',
  'Đơn đặt đã kết thúc do khiếu nại và hoàn tiền',
];

export default function CustomerDancerBookingList() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const res = await getDancerBookings({
        status: statusEnum,
        pageNo: page,
        pageSize: 10,
        sortBy: 'id:DESC',
      });

      const items = res.data || [];
      
      
      const totalPage = res.data?.totalPage || 1;

      if (reset) {
        setData(items);
      } else {
        setData(prev => [...prev, ...items]);
      }

      setTotalPages(totalPage);
      setHasMore(page < totalPage);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Lỗi khi tải danh sách đặt lịch nhóm nhảy',
      );
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

  useRefetchOnFocus(useCallback(() => {
    if (!isLoadingRef.current) {
      setPageNo(1);
      setHasMore(true);
      isLoadingMoreRef.current = false;
      fetchData(1, true);
    }
  }, [fetchData]));

  const openDetail = (booking: any) => {
    const bookingId = booking?.id;

    if (bookingId) {
      router.push({
        pathname: '/DancerBookingDetailCustomer',
        params: { bookingId: String(bookingId) },
      });
      return;
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Đơn đặt nhóm nhảy',
          headerStyle: {
            backgroundColor: '#FF7A00',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'RobotoMono_700Bold',
          },
        }}
      />
      <Text style={styles.header}>Danh sách đơn đặt nhóm nhảy</Text>

      <StatusChips selected={selectedStatus} onSelect={setSelectedStatus} />

      {error && (
        <Text
          style={{
            color: '#C92A2A',
            textAlign: 'center',
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          {error}
        </Text>
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
              {data.map((item, idx) => (
                <BookingCard
                  key={item.id || idx}
                  booking={item}
                  onPress={() => openDetail(item)}
                />
              ))}
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

function StatusChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
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
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function BookingCard({
  booking,
  onPress,
}: {
  booking: any;
  onPress?: () => void;
}) {
  const qty =
    booking.numberOfTeamMember ??
    booking.numberOfTrainingSessions ??
    (booking.trainingSessions?.length || 0);
  const totalPrice = booking.price;

  // For customer view, show dancer crew info instead of customer
  const crew = Array.isArray(booking.crewDanceGroups)
    ? booking.crewDanceGroups
    : [];
  const mainMember = crew[0];
  const crewName = mainMember?.dancerName || 'Nhóm nhảy';
  const extraCount = Math.max(crew.length - 1, 0);

  const title = booking.dancer.danceGroupName;
  const avatar = booking?.dancer?.avatar;

  const subtitle = `${booking.area?.ward || ''}${
    booking.area?.ward ? ', ' : ''
  }${booking.area?.city || ''}`;

  const hasFeedback =
    Array.isArray(booking.bookingFeedbacks) &&
    booking.bookingFeedbacks.length > 0;
  const isCompleted =
    (booking?.statusName || '').trim() === 'Đơn đặt hoàn tất';
  const showFeedbackRow = hasFeedback || isCompleted;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.rowTop}>
        {/* Thumbnail: dancer avatar or initial of crew name */}
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={styles.thumbImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumb}>
            <Text style={styles.thumbInitial}>
              {(crewName || 'N')[0].toUpperCase()}
            </Text>
          </View>
        )}

        {/* Title + subtitle */}
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>

        {/* Quantity: show as number of members */}
        <Text style={styles.qty}>x{qty}</Text>
      </View>

      {/* Total line */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng số tiền: </Text>
        <Text style={styles.totalValue}>{formatNumber(totalPrice)}đ</Text>
      </View>

      {showFeedbackRow && (
        <View style={styles.feedbackRow}>
          <Text
            style={[
              styles.feedbackBadge,
              hasFeedback ? styles.feedbackPositive : styles.feedbackMuted,
            ]}
          >
            {hasFeedback ? 'Đã đánh giá' : 'Chưa đánh giá'}
          </Text>
          {hasFeedback && (
            <Text style={styles.feedbackCount}>
              {booking.bookingFeedbacks.length} đánh giá
            </Text>
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
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFD8B4',
    backgroundColor: '#FFF4E8',
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
    fontFamily: 'RobotoMono_400Regular',
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
