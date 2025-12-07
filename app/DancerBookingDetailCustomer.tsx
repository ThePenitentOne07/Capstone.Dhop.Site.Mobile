import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getBookingById, confirmBookingCompletion, cancelDancerBooking } from '../service/api';
import { useConversationStore } from '../states/conversationStore';
import { useAppModal } from '../hooks/useAppModal';
import { useRefetchOnFocus } from './hooks/useRefetchOnFocus';

const YELLOW = '#FFD540';
const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

export default function DancerBookingDetailCustomer() {
  const params = useLocalSearchParams();
  const bookingIdParam = params.bookingId;
  const bookingParam = params.booking;

  const bookingId = useMemo(() => {
    if (Array.isArray(bookingIdParam)) {
      return bookingIdParam[0];
    }
    if (typeof bookingIdParam === 'string') {
      return bookingIdParam;
    }
    return undefined;
  }, [bookingIdParam]);

  const fallbackBooking = useMemo(() => {
    try {
      if (typeof bookingParam === 'string') {
        const raw = decodeURIComponent(bookingParam);
        return JSON.parse(raw);
      }
      return bookingParam || null;
    } catch {
      return null;
    }
  }, [bookingParam]);

  const [booking, setBooking] = useState<any | null>(fallbackBooking);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (!bookingId) {
      if (fallbackBooking) {
        setBooking(fallbackBooking);
        setError(null);
        setLoading(false);
      } else {
        setBooking(null);
        setError('Không tìm thấy mã đơn đặt lịch.');
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getBookingById(bookingId);
      const payload = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!payload) {
        throw new Error('Không tìm thấy đơn đặt lịch.');
      }

      setBooking(payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải đơn đặt lịch');
      if (!fallbackBooking) {
        setBooking(null);
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, fallbackBooking]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useRefetchOnFocus(load);

  const handleRetry = () => setReloadToken((token) => token + 1);

  const [chatLoading, setChatLoading] = useState(false);
  const [confirmCompletionLoading, setConfirmCompletionLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const router = useRouter();
  const { createConversation } = useConversationStore();
  const { showModal, modal } = useAppModal();

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={ORANGE2} />
        <Text style={styles.stateMessage}>Đang tải đơn đặt lịch...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateMessage}>{error}</Text>
        {bookingId && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.stateContainer}> 
        <Text style={styles.stateMessage}>Không tìm thấy dữ liệu đơn đặt.</Text>
      </View>
    );
  }

  const qty =
    booking.numberOfTrainingSessions ??
    booking.numberOfTeamMember ??
    (booking.trainingSessions?.length || 0);
  const totalPrice = booking.price;
  const perSessionPrice = booking?.dancer?.price;
  const status = (booking.statusName || '').trim();
  const feedbacks = Array.isArray(booking.bookingFeedbacks) ? booking.bookingFeedbacks : [];
  const hasFeedback = feedbacks.length > 0;

  // Determine status color for main booking status card
  const { bg: statusBg, color: statusColor } = getBookingStatusStyle(status);

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

        {/* Address / Dancer */}
        <View style={[styles.block, {position:'relative', paddingBottom:52}]}>
          <Text style={styles.blockTitle}>Thông tin đơn đặt</Text>
          <Text style={styles.addrName}>{booking.dancer?.danceGroupName}</Text>
          <Text style={styles.addrText}>{booking.address}</Text>
          {!!booking.area && (
            <Text style={styles.addrText}>{booking.area.ward}, {booking.area.city}</Text>
          )}
          {!!booking.startTime && (
            <Text style={styles.addrText}>Bắt đầu: {formatDateTime(booking.startTime)}</Text>
          )}
          {!!booking.endTime && (
            <Text style={styles.addrText}>Kết thúc: {formatDateTime(booking.endTime)}</Text>
          )}
          <TouchableOpacity 
            style={styles.msgBtnFab} 
            activeOpacity={0.86} 
            onPress={async () => {
              if (!booking.dancer?.userUUID) {
                showModal({
                  title: 'Lỗi',
                  message: 'Không tìm thấy thông tin vũ công',
                  status: 'error',
                });
                return;
              }

              setChatLoading(true);
              try {
                const conversation = await createConversation({
                  type: 'DIRECT',
                  participantIds: [booking.dancer.userUUID],
                });

                router.push({
                  pathname: '/ChatDetail',
                  params: {
                    conversation: JSON.stringify(conversation),
                  },
                });
              } catch (error: any) {
                console.error('Failed to create conversation:', error);
                showModal({
                  title: 'Lỗi',
                  message: error?.message || 'Không thể tạo cuộc trò chuyện',
                  status: 'error',
                });
              } finally {
                setChatLoading(false);
              }
            }}
            disabled={chatLoading}
          >
            {chatLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.msgBtnFabLabel}>Nhắn tin</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Item block */}
        <View style={styles.itemBlock}>
          <View style={styles.itemRow}>
            <View style={styles.thumb}>
              {booking.dancer?.avatar ? (
                <Image 
                  source={{ uri: booking.dancer.avatar }} 
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.thumbInitial}>{(booking.dancer?.name || 'V')[0].toUpperCase()}</Text>
              )}
            </View>
            <View style={{flex:1}}>
              <Text numberOfLines={1} style={styles.itemTitle}>{booking.dancer?.danceGroupName}</Text>
              <Text numberOfLines={2} style={styles.itemSubtitle}>{booking.detail || 'Đặt lịch nhóm nhảy'}</Text>
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

        {/* Extra Services */}
        {Array.isArray(booking.bookingExtraServices) && booking.bookingExtraServices.length > 0 && (
          <View style={styles.extraServicesBlock}>
            <Text style={styles.extraServicesTitle}>Dịch vụ bổ sung</Text>
            {booking.bookingExtraServices.map((service: any, idx: number) => (
              <View key={idx} style={styles.extraServiceCard}>
                <View style={styles.extraServiceRow}>
                  <Text style={styles.extraServiceName}>{service.name || 'Dịch vụ'}</Text>
                </View>
                <Text style={styles.extraServicePrice}>{formatNumber(service.price || 0)}đ</Text>
              </View>
            ))}
          </View>
        )}

        {/* Crew members */}
        {Array.isArray(booking.crewDanceGroups) && booking.crewDanceGroups.length > 0 && (
          <View style={styles.sessionsBlock}>
            <Text style={styles.sessionsTitle}>Thành viên nhóm nhảy</Text>
            {booking.crewDanceGroups.map((member: any, idx: number) => (
              <View key={member.crewId || idx} style={styles.sessionCard}>
                <Text style={styles.sessionHeading}>
                  {member.dancerName}
                </Text>
                {member.description ? (
                  <Text style={styles.sessionDate}>{member.description}</Text>
                ) : null}
                <Text style={styles.sessionStatus}>
                  {/* Trạng thái: {member.dancerStatus || 'Không rõ'} */}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Feedback */}
        {status === 'Đơn đặt hoàn tất' && (
          <View style={styles.feedbackBlock}>
            <Text style={styles.feedbackTitle}>Đánh giá</Text>
            {hasFeedback ? (
              feedbacks.map((fb: any, idx: number) => (
                <View key={fb.id || idx} style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <Text style={styles.feedbackAuthor}>{fb.fromUser || 'Khách hàng'}</Text>
                    <Text style={styles.feedbackRating}>{'★'.repeat(fb.rating || 0)}</Text>
                  </View>
                  {fb.comment ? <Text style={styles.feedbackComment}>{fb.comment}</Text> : null}
                </View>
              ))
            ) : (
              <View style={styles.feedbackEmptyState}>
                <Text style={styles.feedbackEmpty}>
                  Bạn hãy đánh giá cho nhóm nhảy.
                </Text>
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={() =>
                    router.push({
                      pathname: '/BookingFeedback',
                      params: { bookingId: booking.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.feedbackButtonText}>Đánh giá ngay</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Cancel Button */}
        {status === 'Đơn đặt chờ xác nhận' && (
          <View style={styles.complaintBlock}>
            <TouchableOpacity
              style={styles.complaintButton}
              onPress={async () => {
                if (!booking?.id || cancelLoading) return;
                try {
                  setCancelLoading(true);
                  await cancelDancerBooking(booking.id);
                  showModal({
                    title: 'Thành công',
                    message: 'Đã hủy đơn.',
                    status: 'success',
                    autoCloseAfter: 2000,
                    onAutoClose: () => router.back(),
                  });
                } catch (e: any) {
                  showModal({
                    title: 'Lỗi',
                    message: e?.response?.data?.message || e?.message || 'Không thể hủy đơn.',
                    status: 'error',
                  });
                } finally {
                  setCancelLoading(false);
                }
              }}
              disabled={cancelLoading}
              activeOpacity={0.85}
            >
              {cancelLoading ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <Text style={styles.complaintButtonText}>Hủy đơn</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Check-in Button */}
      {status === 'Đơn đặt đã kích hoạt' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.checkinBtn}
            onPress={() => {
              router.push({
                pathname: '/DancerCustomerQR',
                params: { bookingId: String(booking.id) },
              });
            }}
          >
            <Text style={styles.checkinBtnText}>Check in</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm Completion Button */}
      {status === 'Đơn đặt đã hoàn thành công việc' && (
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.checkinBtn} 
            onPress={async () => {
              if (!booking?.id || confirmCompletionLoading) return;
              try {
                setConfirmCompletionLoading(true);
                await confirmBookingCompletion(booking.id);
                await load(); // Reload data immediately after success
                showModal({
                  title: 'Thành công',
                  message: 'Đã xác nhận hoàn thành.',
                  status: 'success',
                  autoCloseAfter: 2000,
                });
              } catch (e: any) {
                showModal({
                  title: 'Lỗi',
                  message: e?.response?.data?.message || e?.message || 'Không thể xác nhận hoàn thành.',
                  status: 'error',
                });
              } finally {
                setConfirmCompletionLoading(false);
              }
            }}
            disabled={confirmCompletionLoading}
          >
            {confirmCompletionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkinBtnText}>Xác nhận hoàn thành</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {modal}
    </View>
  );
}

function formatDateTime(dt: string) {
  try {
    // Parse the date string directly to preserve the exact time
    // Expected format: "11-12-2025 00:00" or ISO format
    if (dt.includes("-") && dt.includes(" ")) {
      // Format: "dd-mm-yyyy HH:mm" or "dd-mm-yyyy HH:MM"
      const [datePart, timePart] = dt.split(" ");
      const [day, month, year] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } else {
      // Fallback to Date parsing for ISO format
      const d = new Date(dt);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  } catch {
    return dt;
  }
}

function formatNumber(n: number) {
  return n?.toLocaleString('vi-VN') || n;
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
    height: 250,
  },
  blockTitle: {
    fontSize: 15,
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
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  thumbInitial: {
    fontSize: 26,
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
  },
  itemTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'RobotoMono_700Bold',
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
    fontFamily: 'RobotoMono_700Bold',
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
  extraServicesBlock: {
    marginHorizontal: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFECD0',
  },
  extraServicesTitle: {
    color: ORANGE2,
    fontSize: 15,
    marginBottom: 10,
    fontFamily: 'RobotoMono_700Bold',
  },
  extraServiceCard: {
    backgroundColor: '#FFF9EF',
    borderRadius: 9,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD8B4',
  },
  extraServiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  extraServiceName: {
    flex: 1,
    color: '#111827',
    fontSize: 14,
    fontFamily: 'RobotoMono_700Bold',
  },
  extraServicePrice: {
    color: ORANGE2,
    fontSize: 15,
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
    marginBottom: 4,
  },
  sessionStatus: {
    fontSize: 13,
    marginTop: 4,
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
  msgBtnFabLabel: {
    color: '#fff',
    fontSize: 15,
    minWidth: 54,
    textAlign: 'center',
    fontFamily: 'RobotoMono_700Bold',
  },
  feedbackBlock: {
    marginHorizontal: 12,
    marginBottom: 28,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  feedbackTitle: {
    color: ORANGE2,
    fontSize: 15,
    marginBottom: 10,
    fontFamily: 'RobotoMono_700Bold',
  },
  feedbackCard: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1EFEA',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackAuthor: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'RobotoMono_700Bold',
  },
  feedbackRating: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'RobotoMono_700Bold',
  },
  feedbackComment: {
    fontSize: 13,
    color: '#4B5563',
    fontFamily: 'RobotoMono_400Regular',
  },
  feedbackEmpty: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
  },
  feedbackEmptyState: {
    paddingVertical: 8,
    gap: 12,
  },
  feedbackButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: ORANGE2,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'RobotoMono_700Bold',
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  stateMessage: {
    marginTop: 16,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 15,
    fontFamily: 'RobotoMono_400Regular',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: ORANGE2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
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
    gap: 14,
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
  complaintBlock: {
    marginHorizontal: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  complaintButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  complaintButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
  },
});

// Color mapping for overall booking status (Vietnamese status names)
function getBookingStatusStyle(status: string): { bg: string; color: string } {
  const normalized = (status || '').trim();

  switch (normalized) {
    case 'Đơn đặt chờ xác nhận':
      return { bg: '#FEF9C3', color: '#B45309' }; // pending
    case 'Đơn đặt đã kích hoạt':
      return { bg: '#DBEAFE', color: '#1D4ED8' }; // active
    case 'Đơn đặt không kích hoạt':
      return { bg: '#E5E7EB', color: '#4B5563' }; // neutral
    case 'Đơn đặt đang tiến hành':
      return { bg: '#E0F2FE', color: '#0369A1' }; // in progress
    case 'Đơn đặt đã hoàn thành công việc':
      return { bg: '#DCFCE7', color: '#16A34A' }; // work done
    case 'Đơn đặt hoàn tất':
      return { bg: '#BBF7D0', color: '#15803D' }; // fully completed
    case 'Đơn đặt chưa hoàn tất':
      return { bg: '#F3F4F6', color: '#4B5563' }; // not finished
    case 'Đơn đặt đã hủy':
      return { bg: '#FEE2E2', color: '#B91C1B' }; // cancelled
    case 'Đơn đặt hết chỗ':
      return { bg: '#FFEDD5', color: '#C2410C' }; // full
    case 'Đơn trong trạng thái khiếu nại':
      return { bg: '#FEF3C7', color: '#B45309' }; // complaint
    default:
      return { bg: '#E7F5EF', color: '#0E766E' }; // default teal
  }
}

