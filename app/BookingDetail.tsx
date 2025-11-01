import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { acceptChoreographerBooking } from '../service/api';
import { useRouter } from 'expo-router';

const YELLOW = '#FFD540';
const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';
const GREEN = '#0F9D58';

export default function BookingDetail() {
  const params = useLocalSearchParams();
  const booking = useMemo(() => {
    try {
      if (typeof params.booking === 'string') {
        const raw = decodeURIComponent(params.booking);
        return JSON.parse(raw);
      }
      return params.booking || null;
    } catch {
      return null;
    }
  }, [params.booking]);

  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState<boolean|undefined>();
  const [acceptError, setAcceptError] = useState<string|undefined>();

  const router = useRouter();

  if (!booking) {
    return (
      <View style={styles.root}> 
        <Text style={styles.header}>Thông tin đơn hàng</Text>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Không tìm thấy dữ liệu đơn đặt.</Text>
      </View>
    );
  }

  const qty = booking.numberOfTrainingSessions ?? (booking.trainingSessions?.length || 0);
  const totalPrice = booking.price;
  const perSessionPrice = booking?.choreography?.price;
  const status = booking.statusName;

  // Determine status color
  let statusBg = '#E7F5EF';
  let statusColor = '#0E766E';
  if (/chờ xác nhận|on hold|pending/i.test(status)) {
    statusBg = '#FFF9E0';
    statusColor = ORANGE2;
  }

  return (
    <View style={{flex:1, backgroundColor:'#fff'}}>
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 104 }}>
        <Text style={styles.header}>Thông tin đặt lịch</Text>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusBg, borderColor: statusBg }]}> 
          <Text style={[styles.statusTitle, { color: statusColor }]}>{status}</Text>
          <Text style={styles.shipStatus}>Ngày đặt</Text>
          <Text style={styles.shipTime}>{formatDateTime(booking.bookingDate)}</Text>
        </View>

        {/* Address / Customer */}
        <View style={[styles.block, {position:'relative', paddingBottom:52}]}> 
          <Text style={styles.blockTitle}>Thông tin biên đạo</Text>
          <Text style={styles.addrName}>{booking.choreography?.username}</Text>
          <Text style={styles.addrText}>{booking.address}</Text>
          {!!booking.area && (
            <Text style={styles.addrText}>{booking.area.ward}, {booking.area.city}</Text>
          )}
          <TouchableOpacity style={styles.msgBtnFab} activeOpacity={0.86} onPress={()=>{}}>
            
            <Text style={styles.msgBtnFabLabel}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* Item block */}
        <View style={styles.itemBlock}>
          <View style={styles.itemRow}>
            <View style={styles.thumb}><Text style={{fontSize:26}}></Text></View>
            <View style={{flex:1}}>
              <Text numberOfLines={1} style={styles.itemTitle}>{booking.choreography?.username}</Text>
              <Text numberOfLines={1} style={styles.itemSubtitle}>{booking.detail || 'Đặt lịch biên đạo'}</Text>
            </View>
            <Text style={styles.itemQty}>x{qty}</Text>
          </View>

          <View style={styles.priceRow}>
            {/* {!!perSessionPrice && (
              <Text style={styles.oldPrice}>{formatNumber(perSessionPrice)}đ</Text>
            )} */}
            <Text style={styles.curPrice}>{formatNumber(totalPrice)}đ</Text>
          </View>

          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Thành tiền:</Text>
            <Text style={styles.totalValue}>{formatNumber(totalPrice)}đ</Text>
          </View>
        </View>

        {/* Training Sessions */}
        {Array.isArray(booking.trainingSessions) && booking.trainingSessions.length > 0 && (
          <View style={styles.sessionsBlock}>
            <Text style={styles.sessionsTitle}>Các buổi tập</Text>
            {booking.trainingSessions.map((s: any, idx: number) => (
              <View style={styles.sessionCard} key={idx}>
                <Text style={styles.sessionHeading}>Buổi #{s.sessionNo || (idx + 1)}</Text>
                <Text style={styles.sessionDate}>{sessionSummary(s)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* Floating action buttons */}
      {/* {status === 'Đơn đặt chờ xác nhận' && (
        <>
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.declineBtn} onPress={() => {}} disabled={acceptLoading}>
              <Text style={styles.declineBtnText}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={async () => {
              setAcceptLoading(true); setAcceptSuccess(undefined); setAcceptError(undefined);
              try {
                console.log('acceptChoreographerBooking request:', {
                  bookingId: booking.id,
                  statusName: 'BOOKING_ACTIVATE',
                });
                await acceptChoreographerBooking(booking.id, 'BOOKING_ACTIVATE');
                setAcceptSuccess(true);
              } catch(e:any) {
                setAcceptError(e?.response?.data?.message || e?.message || 'Lỗi khi xác nhận');
              } finally { setAcceptLoading(false); }
            }} disabled={acceptLoading}>
              {acceptLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptBtnText}>Đồng ý</Text>
              )}
            </TouchableOpacity>
          </View>
          {acceptSuccess && <Text style={{textAlign:'center',color:'#16a34a',fontWeight:'bold',marginBottom:6}}>Đồng ý đơn thành công!</Text>}
          {acceptError && <Text style={{textAlign:'center',color:'#b91c1c',fontWeight:'bold',marginBottom:6}}>{acceptError}</Text>}
        </>
      )} */}

      {status === 'Đơn đặt đã kích hoạt' && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.checkinBtn} onPress={() => {
            try {
              const sessions = Array.isArray(booking.trainingSessions) ? booking.trainingSessions.slice() : [];
              const sorted = sessions.sort((a: any, b: any) => (a.sessionNo || 0) - (b.sessionNo || 0));
              const notStarted = sorted.find((s: any) => s?.statusName === 'TRAINING_SESSION_NOT_STARTED');
              const target = notStarted || sorted[0];
              if (target?.id) {
                router.push({ pathname: '/CustomerQRCheckIn', params: { trainingSessionId: String(target.id) } });
              } else {
                router.push('/CustomerQRCheckIn');
              }
            } catch {
              router.push('/CustomerQRCheckIn');
            }
          }}>
            <Text style={styles.checkinBtnText}>Check in</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function formatDateTime(dt: string) {
  try {
    const d = new Date(dt);
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dt;
  }
}
function formatNumber(n: number) {
  return n?.toLocaleString('vi-VN') || n;
}

function sessionSummary(s: any) {
  try {
    const d = new Date(s.scheduledTime);
    const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    const start = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    let dur = '';
    if (s.durationMinutes) {
      if (s.durationMinutes >= 60) dur = `${Math.floor(s.durationMinutes/60)} giờ` + (s.durationMinutes % 60 ? ` ${s.durationMinutes%60} phút` : '');
      else dur = s.durationMinutes + ' phút';
    }
    return `${dateStr}, bắt đầu lúc ${start}` + (dur ? `, thời lượng ${dur}` : '');
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 22,
    // fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'RobotoMono_700Bold',
  },
  statusCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#E7F5EF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C8EAD9',
  },
  statusTitle: {
    color: '#0E766E',
    // fontWeight: '800',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'RobotoMono_700Bold',
  },
  shipStatus: {
    color: '#6B7280',
    fontSize: 15,
    marginBottom: 4,
    fontFamily: 'RobotoMono_400Regular',
  },
  shipTime: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: 'RobotoMono_400Regular',
  },
  block: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    height: 200,
  },
  blockTitle: {
    fontSize: 15,
    // fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    fontFamily: 'RobotoMono_700Bold',
  },
  addrName: {
    
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'RobotoMono_700Bold',
  },
  addrText: {
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
  },
  itemBlock: {
    marginHorizontal: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFD8B4',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'RobotoMono_400Regular',
  },
  itemSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
  },
  itemQty: {
    marginLeft: 10,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
    fontFamily: 'RobotoMono_400Regular',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  oldPrice: {
    color: '#A7A7A7',
    textDecorationLine: 'line-through',
    fontSize: 16,
    fontFamily: 'RobotoMono_400Regular',
  },
  curPrice: {
    fontSize: 20,
    // fontWeight: '800',
    color: '#111827',
    fontFamily: 'RobotoMono_700Bold',
  },
  totalBar: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1EFEA',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#6B7280',
    fontSize: 15,
    fontFamily: 'RobotoMono_400Regular',
  },
  totalValue: {
    color: ORANGE2,
    fontSize: 20,
    
    fontFamily: 'RobotoMono_700Bold',
  },
  sessionsBlock: {
    marginHorizontal: 12,
    marginBottom: 28,
    marginTop: 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFECD0',
  },
  sessionsTitle: {
    
    color: ORANGE2,
    fontSize: 15,
    marginBottom: 8,
    fontFamily: 'RobotoMono_700Bold',
  },
  sessionCard: {
    backgroundColor: '#FFF9EF',
    borderRadius: 9,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFD8B4',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  sessionHeading: {
    
    color: ORANGE,
    fontSize: 14,
    marginBottom: 2,
    fontFamily: 'RobotoMono_700Bold',
  },
  sessionDate: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: 'RobotoMono_400Regular',
  },
  msgBtn: {
    backgroundColor: ORANGE2,
    marginTop: 12,
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    shadowColor: ORANGE,
    shadowOpacity: 0.11,
    shadowRadius: 4,
    elevation: 2,
    
  },
  msgBtnText: {
    color: '#fff',
    
    // fontSize: 15,
    letterSpacing: 0.2,
    fontFamily: 'RobotoMono_400Regular',
  },
  fabWrap: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    pointerEvents: 'box-none',
    zIndex: 23,
  },
  fabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE2,
    borderRadius: 32,
    paddingHorizontal: 21,
    paddingVertical: 13,
    shadowColor: ORANGE,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 22,
    color: '#fff',
    marginRight: 7,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  fabLabel: {
    color: '#fff',
    fontSize: 15,
    // fontWeight: 'bold',
    minWidth: 56,
    textAlign: 'center',
    fontFamily: 'RobotoMono_700Bold',
  },
  msgBtnFab: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE2,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: ORANGE,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  msgBtnFabIcon: {
    fontSize: 22,
    color: '#fff',
    marginRight: 7,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  msgBtnFabLabel: {
    color: '#fff',
    fontSize: 15,
    // fontWeight: 'bold',
    minWidth: 54,
    textAlign: 'center',
    fontFamily: 'RobotoMono_700Bold',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 50,
    paddingTop: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3ECE7',
    zIndex: 20,
    gap: 14
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: ORANGE2,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    marginLeft: 6,
    elevation: 2,
    shadowColor: ORANGE2,
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  acceptBtnText: {
    color: '#fff',
    // fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  declineBtnText: {
    color: '#A66',
    // fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  checkinBtn: {
    flex: 1,
    backgroundColor: ORANGE2,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  checkinBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
});


