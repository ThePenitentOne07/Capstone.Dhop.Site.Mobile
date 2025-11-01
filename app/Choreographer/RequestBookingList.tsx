import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { getChoreographerBookings } from '../../service/api';
import { useRefetchOnFocus } from '../hooks';
const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

const STATUS_CHIP_VALUES = [
  'Tất cả',
  'Đơn đặt chờ xác nhận',
  'Đơn đặt đã kích hoạt',
];

export default function RequestBookingList() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('Tất cả');

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await getChoreographerBookings();
        if (mounted) {
          setData(res.data || []);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Lỗi khi tải danh sách đặt lịch');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  const filteredData = useMemo(() => {
    if (selectedStatus === 'Tất cả') return data;
    return (data || []).filter((b) => (b?.statusName || '').trim() === selectedStatus);
  }, [data, selectedStatus]);

  const openDetail = (booking: any) => {
    try {
      const serialized = encodeURIComponent(JSON.stringify(booking));
      router.push({ pathname: '/Choreographer/BookingDetailOnHold', params: { booking: serialized } });
    } catch {
      // fallback without encoding
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
        >
          {filteredData.length === 0 ? (
            <Text style={styles.emptyText}>Không có đơn đặt lịch nào.</Text>
          ) : (
            filteredData.map((item, idx) =>
              <BookingCard key={idx} booking={item} onPress={() => openDetail(item)} />
            )
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

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.card} onPress={onPress}>
      <View style={styles.rowTop}>
        {/* Thumbnail */}
        <View style={styles.thumb}>
          <Text style={styles.thumbEmoji}></Text>
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
    fontWeight: '700',
    color: ORANGE2,
    textAlign: 'center',
    letterSpacing: 0.2,
    fontFamily: 'Roboto',
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
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'Roboto',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: 'Roboto',
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
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Roboto',
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
    fontFamily: 'Roboto',
  },
  totalValue: {
    color: ORANGE2,
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 8,
    fontFamily: 'Roboto',
  },
});
