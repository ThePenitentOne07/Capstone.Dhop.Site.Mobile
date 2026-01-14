import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  getBookingById,
  confirmBookingCompletion,
  cancelDancerBooking,
  updateDancerBooking,
  checkUserBalance,
  payBooking,
} from "../service/api";
import { useConversationStore } from "../states/conversationStore";
import { useAppModal } from "../hooks/useAppModal";
import { useRefetchOnFocus } from "./hooks/useRefetchOnFocus";

const YELLOW = "#FFD540";
const ORANGE = "#FF7120";
const ORANGE2 = "#FF7A00";

export default function DancerBookingDetailCustomer() {
  const params = useLocalSearchParams();
  const bookingIdParam = params.bookingId;
  const bookingParam = params.booking;

  const bookingId = useMemo(() => {
    if (Array.isArray(bookingIdParam)) {
      return bookingIdParam[0];
    }
    if (typeof bookingIdParam === "string") {
      return bookingIdParam;
    }
    return undefined;
  }, [bookingIdParam]);

  const fallbackBooking = useMemo(() => {
    try {
      if (typeof bookingParam === "string") {
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
        setError("Không tìm thấy mã đơn đặt lịch.");
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
        throw new Error("Không tìm thấy đơn đặt lịch.");
      }

      setBooking(payload);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải đơn đặt lịch"
      );
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
  const [confirmCompletionLoading, setConfirmCompletionLoading] =
    useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateLocation, setUpdateLocation] = useState("");
  const [updateNumberOfPeople, setUpdateNumberOfPeople] = useState("");
  const [updateCustomerPrice, setUpdateCustomerPrice] = useState("");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [paymentLoading, setPaymentLoading] = useState(false);

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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
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
  const isPaid = booking.isPaid;
  const status = (booking.statusName || "").trim();
  const feedbacks = Array.isArray(booking.bookingFeedbacks)
    ? booking.bookingFeedbacks
    : [];
  const hasFeedback = feedbacks.length > 0;

  // Determine status color for main booking status card
  const { bg: statusBg, color: statusColor } = getBookingStatusStyle(status);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Chi tiết đơn đặt",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontFamily: "RobotoMono_700Bold",
          },
        }}
      />
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingBottom: 104 }}
      >
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: statusBg, borderColor: statusBg },
          ]}
        >
          <Text style={[styles.statusTitle, { color: statusColor }]}>
            {status}
          </Text>
          <Text style={styles.shipStatus}>Ngày đặt</Text>
          <Text style={styles.shipTime}>
            {formatDateTime(booking.bookingDate)}
          </Text>
        </View>
        {/* Payment Status */}
        <View style={styles.paymentStatusBlock}>
          <Text style={styles.paymentStatusLabel}>Trạng thái thanh toán</Text>
          <Text
            style={[
              styles.paymentStatusValue,
              isPaid ? styles.paymentStatusPaid : styles.paymentStatusUnpaid,
            ]}
          >
            {isPaid ? "✓ Đã thanh toán" : "⏳ Chưa thanh toán"}
          </Text>
        </View>

        {/* Check-in Info Message */}
        {status === "Đơn đặt đang tiến hành" &&
          !hasBookingTimeArrived(booking.startTime) && (
            <View style={styles.infoMessage}>
              <Text style={styles.infoMessageText}>
                Chỉ có thể check in khi đã tới giờ diễn
              </Text>
            </View>
          )}

        {/* Address / Dancer */}
        <View
          style={[styles.block, { position: "relative", paddingBottom: 52 }]}
        >
          <Text style={styles.blockTitle}>Thông tin đơn đặt</Text>
          <Text style={styles.addrName}>{booking.dancer?.danceGroupName}</Text>
          <Text style={styles.addrText}>{booking.address}</Text>
          {!!booking.area && (
            <Text style={styles.addrText}>
              {booking.area.ward}, {booking.area.city}
            </Text>
          )}
          {!!booking.startTime && (
            <Text style={styles.addrText}>
              Bắt đầu: {formatDateTime(booking.startTime)}
            </Text>
          )}
          {!!booking.endTime && (
            <Text style={styles.addrText}>
              Kết thúc: {formatDateTime(booking.endTime)}
            </Text>
          )}
          <TouchableOpacity
            style={styles.msgBtnFab}
            activeOpacity={0.86}
            onPress={async () => {
              if (!booking.dancer?.userUUID) {
                showModal({
                  title: "Lỗi",
                  message: "Không tìm thấy thông tin vũ công",
                  status: "error",
                });
                return;
              }

              setChatLoading(true);
              try {
                const conversation = await createConversation({
                  type: "DIRECT",
                  participantIds: [booking.dancer.userUUID],
                });

                router.push({
                  pathname: "/ChatDetail",
                  params: {
                    conversation: JSON.stringify(conversation),
                  },
                });
              } catch (error: any) {
                console.error("Failed to create conversation:", error);
                showModal({
                  title: "Lỗi",
                  message: error?.message || "Không thể tạo cuộc trò chuyện",
                  status: "error",
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
                <Text style={styles.thumbInitial}>
                  {(booking.dancer?.name || "V")[0].toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.itemTitle}>
                {booking.dancer?.danceGroupName}
              </Text>
              <Text numberOfLines={2} style={styles.itemSubtitle}>
                {booking.detail || "Đặt lịch nhóm nhảy"}
              </Text>
            </View>
            <Text style={styles.itemQty}>x{qty} người</Text>
          </View>

          <View style={styles.priceRow}>
            {booking?.suggestedPrice &&
              booking.suggestedPrice !== booking.price && (
                <>
                  <View style={styles.priceItemRow}>
                    <Text style={styles.priceLabel}>Giá đề xuất:</Text>
                    <Text style={styles.oldPrice}>
                      {formatNumber(booking.suggestedPrice)}đ
                    </Text>
                  </View>
                  <View style={styles.priceItemRow}>
                    <Text style={styles.priceLabel}>Giá hiện mong muốn:</Text>
                    <Text style={styles.curPrice}>
                      {formatNumber(totalPrice)}đ
                    </Text>
                  </View>
                </>
              )}
            {!booking?.suggestedPrice ||
              (booking.suggestedPrice === booking.price && (
                <View style={styles.priceItemRow}>
                  <Text style={styles.priceLabel}>Giá:</Text>
                  <Text style={styles.curPrice}>
                    {formatNumber(totalPrice)}đ
                  </Text>
                </View>
              ))}
          </View>

          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Thành tiền:</Text>
            <Text style={styles.totalValue}>{formatNumber(totalPrice)}đ</Text>
          </View>
        </View>

        {/* Extra Services */}
        {Array.isArray(booking.bookingExtraServices) &&
          booking.bookingExtraServices.length > 0 && (
            <View style={styles.extraServicesBlock}>
              <Text style={styles.extraServicesTitle}>Dịch vụ bổ sung</Text>
              {booking.bookingExtraServices.map((service: any, idx: number) => (
                <View key={idx} style={styles.extraServiceCard}>
                  <View style={styles.extraServiceRow}>
                    <Text style={styles.extraServiceName}>
                      {service.name || "Dịch vụ"}
                    </Text>
                  </View>
                  <Text style={styles.extraServicePrice}>
                    {formatNumber(service.price || 0)}đ
                  </Text>
                </View>
              ))}
            </View>
          )}

        {/* Crew members */}
        {Array.isArray(booking.crewDanceGroups) &&
          booking.crewDanceGroups.length > 0 && (
            <View style={styles.sessionsBlock}>
              <Text style={styles.sessionsTitle}>Thành viên nhóm nhảy</Text>
              {booking.crewDanceGroups.map((member: any, idx: number) => (
                <View key={member.crewId || idx} style={styles.sessionCard}>
                  <Text style={styles.sessionHeading}>{member.dancerName}</Text>
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

        {/* Act Items */}
        {Array.isArray(booking.actItems) && booking.actItems.length > 0 && (
          <View style={styles.actItemsBlock}>
            <Text style={styles.actItemsTitle}>Các tiết mục biểu diễn</Text>
            {booking.actItems.map((item: any, idx: number) => (
              <View key={item.id || idx} style={styles.actItemCard}>
                <View style={styles.actItemHeader}>
                  <Text style={styles.actItemIndex}>#{item.orderIndex}</Text>
                  <Text style={styles.actItemSong}>{item.songName}</Text>
                </View>
                <View style={styles.actItemDetails}>
                  <Text style={styles.actItemDetailText}>
                    Thể loại: {item.danceTypeName || `ID: ${item.danceTypeId}`}
                  </Text>
                  <Text style={styles.actItemDetailText}>
                    Thời lượng: {item.durationMinutes} phút
                  </Text>
                </View>
                <Text style={styles.actItemDesc}>{item.description}</Text>
                <Text style={styles.actItemLink} numberOfLines={1}>
                  {item.referenceLink}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Feedback */}
        {status === "Đơn đặt hoàn tất" && (
          <View style={styles.feedbackBlock}>
            <Text style={styles.feedbackTitle}>Đánh giá</Text>
            {hasFeedback ? (
              feedbacks.map((fb: any, idx: number) => (
                <View key={fb.id || idx} style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <Text style={styles.feedbackAuthor}>
                      {fb.fromUser || "Khách hàng"}
                    </Text>
                    <Text style={styles.feedbackRating}>
                      {"★".repeat(fb.rating || 0)}
                    </Text>
                  </View>
                  {fb.comment ? (
                    <Text style={styles.feedbackComment}>{fb.comment}</Text>
                  ) : null}
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
                      pathname: "/BookingFeedback",
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
        {status === "Đơn đặt chờ xác nhận" && (
          <View style={styles.complaintBlock}>
            {!booking?.isPaid && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.updateButton]}
                  onPress={() => {
                    setUpdateLocation(booking?.address || "");
                    setUpdateNumberOfPeople(
                      String(booking?.numberOfTeamMember || "")
                    );
                    setUpdateCustomerPrice(
                      String(booking?.customerPrice || "")
                    );
                    setUpdateModalVisible(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.updateButtonText}>Cập nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentButton]}
                  onPress={async () => {
                    try {
                      setPaymentLoading(true);
                      const response = await checkUserBalance();
                      const balance = response.data?.result || 0;
                      setUserBalance(balance);
                      setPaymentModalVisible(true);
                    } catch (e: any) {
                      showModal({
                        title: "Lỗi",
                        message:
                          e?.response?.data?.message ||
                          e?.message ||
                          "Không thể lấy thông tin ví.",
                        status: "error",
                      });
                    } finally {
                      setPaymentLoading(false);
                    }
                  }}
                  disabled={paymentLoading}
                  activeOpacity={0.85}
                >
                  {paymentLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.paymentButtonText}>Thanh toán</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.complaintButton}
              onPress={async () => {
                if (!booking?.id || cancelLoading) return;
                try {
                  setCancelLoading(true);
                  await cancelDancerBooking(booking.id);
                  showModal({
                    title: "Thành công",
                    message: "Đã hủy đơn.",
                    status: "success",
                    autoCloseAfter: 2000,
                    onAutoClose: () => router.back(),
                  });
                } catch (e: any) {
                  showModal({
                    title: "Lỗi",
                    message:
                      e?.response?.data?.message ||
                      e?.message ||
                      "Không thể hủy đơn.",
                    status: "error",
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
      {status === "Đơn đặt đang tiến hành" &&
        hasBookingTimeArrived(booking.startTime) && (
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.checkinBtn}
              onPress={() => {
                router.push({
                  pathname: "/DancerCustomerQR",
                  params: { bookingId: String(booking.id) },
                });
              }}
            >
              <Text style={styles.checkinBtnText}>Check in</Text>
            </TouchableOpacity>
          </View>
        )}

      {/* Confirm Completion Button */}
      {status === "Đơn đặt đã hoàn thành công việc" && (
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
                  title: "Thành công",
                  message: "Đã xác nhận hoàn thành.",
                  status: "success",
                  autoCloseAfter: 2000,
                });
              } catch (e: any) {
                showModal({
                  title: "Lỗi",
                  message:
                    e?.response?.data?.message ||
                    e?.message ||
                    "Không thể xác nhận hoàn thành.",
                  status: "error",
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

      {/* Update Modal */}
      <Modal
        visible={updateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhập thông tin đơn</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Địa điểm</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập địa điểm..."
                placeholderTextColor="#9CA3AF"
                value={updateLocation}
                onChangeText={setUpdateLocation}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Số người</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập số người..."
                placeholderTextColor="#9CA3AF"
                value={updateNumberOfPeople}
                onChangeText={setUpdateNumberOfPeople}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Giá tiền</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập giá tiền..."
                placeholderTextColor="#9CA3AF"
                value={updateCustomerPrice}
                onChangeText={setUpdateCustomerPrice}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setUpdateModalVisible(false)}
                disabled={updateLoading}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  updateLoading && styles.modalConfirmBtnDisabled,
                ]}
                onPress={async () => {
                  if (
                    !booking?.id ||
                    !updateLocation.trim() ||
                    !updateNumberOfPeople ||
                    !updateCustomerPrice
                  ) {
                    showModal({
                      title: "Lỗi",
                      message: "Vui lòng điền đầy đủ thông tin.",
                      status: "error",
                    });
                    return;
                  }

                  try {
                    setUpdateLoading(true);

                    // Build payload with only changed fields
                    const updatePayload: any = {};

                    if (updateLocation !== (booking?.address || "")) {
                      updatePayload.address = updateLocation;
                    }

                    if (
                      parseInt(updateNumberOfPeople) !==
                      booking?.numberOfTeamMember
                    ) {
                      updatePayload.numberOfPeople =
                        parseInt(updateNumberOfPeople);
                    }

                    if (
                      parseInt(updateCustomerPrice) !== booking?.customerPrice
                    ) {
                      updatePayload.customerPrice =
                        parseInt(updateCustomerPrice);
                    }

                    // Only make request if there are changes
                    if (Object.keys(updatePayload).length > 0) {
                      await updateDancerBooking(booking.id, updatePayload);
                    }

                    showModal({
                      title: "Thành công",
                      message: "Cập nhập thông tin thành công.",
                      status: "success",
                      autoCloseAfter: 2000,
                    });
                    setUpdateModalVisible(false);
                    await load();
                  } catch (e: any) {
                    showModal({
                      title: "Lỗi",
                      message:
                        e?.response?.data?.message ||
                        e?.message ||
                        "Không thể cập nhập thông tin.",
                      status: "error",
                    });
                  } finally {
                    setUpdateLoading(false);
                  }
                }}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận thanh toán</Text>

            <View style={styles.paymentInfoBlock}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Số dư ví:</Text>
                <Text style={styles.paymentBalance}>
                  {formatNumber(userBalance)}đ
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Giá dịch vụ:</Text>
                <Text style={styles.paymentPrice}>
                  {formatNumber(totalPrice)}đ
                </Text>
              </View>

              {userBalance < totalPrice && (
                <View style={styles.insufficientBlock}>
                  <Text style={styles.insufficientText}>
                    ⚠️ Số dư không đủ. Cần thêm{" "}
                    <Text style={styles.insufficientAmount}>
                      {formatNumber(totalPrice - userBalance)}đ
                    </Text>
                  </Text>
                </View>
              )}

              {userBalance >= totalPrice && (
                <View style={styles.sufficientBlock}>
                  <Text style={styles.sufficientText}>
                    ✓ Số dư đủ để thanh toán
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPaymentModalVisible(false)}
                disabled={paymentLoading}
              >
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  (paymentLoading || userBalance < totalPrice) &&
                    styles.modalConfirmBtnDisabled,
                ]}
                onPress={async () => {
                  if (userBalance < totalPrice) {
                    return;
                  }

                  try {
                    setPaymentLoading(true);
                    // TODO: Call API to process payment
                    await payBooking(booking.id);

                    showModal({
                      title: "Thành công",
                      message: "Thanh toán thành công.",
                      status: "success",
                      autoCloseAfter: 2000,
                    });
                    setPaymentModalVisible(false);
                    await load();
                  } catch (e: any) {
                    showModal({
                      title: "Lỗi",
                      message:
                        e?.response?.data?.message ||
                        e?.message ||
                        "Không thể thanh toán.",
                      status: "error",
                    });
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
                disabled={paymentLoading || userBalance < totalPrice}
              >
                {paymentLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>
                    {userBalance >= totalPrice
                      ? "Xác nhận thanh toán"
                      : "Số dư không đủ"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {modal}
    </View>
  );
}

function hasBookingTimeArrived(startTime: string | undefined | null): boolean {
  if (!startTime) {
    return false;
  }

  const now = new Date();

  try {
    let bookingDate: Date;

    // Parse the date string (format: "dd-mm-yyyy HH:mm" or ISO format)
    if (
      typeof startTime === "string" &&
      startTime.includes("-") &&
      startTime.includes(" ")
    ) {
      const [datePart, timePart] = startTime.split(" ");
      const [day, month, year] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");
      bookingDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
    } else {
      bookingDate = new Date(startTime);
    }

    // Check if current time is at or after the start time
    return now >= bookingDate;
  } catch (e) {
    console.error("Error parsing booking start time:", e);
    return false;
  }
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
  return n?.toLocaleString("vi-VN") || n;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 22,
    color: "#111827",
    textAlign: "center",
    fontFamily: "RobotoMono_700Bold",
  },
  statusCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#E7F5EF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C8EAD9",
  },
  infoMessage: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoMessageText: {
    color: "#B45309",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "RobotoMono_400Regular",
  },
  statusTitle: {
    color: "#0E766E",
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "RobotoMono_700Bold",
  },
  shipStatus: {
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 4,
    fontFamily: "RobotoMono_400Regular",
  },
  shipTime: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "RobotoMono_400Regular",
  },
  block: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE",
    height: 250,
  },
  blockTitle: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 6,
    fontFamily: "RobotoMono_700Bold",
  },
  addrName: {
    color: "#111827",
    marginBottom: 2,
    fontFamily: "RobotoMono_700Bold",
  },
  addrText: {
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  itemBlock: {
    marginHorizontal: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#FFF4E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FFD8B4",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  thumbInitial: {
    fontSize: 26,
    color: ORANGE2,
    fontFamily: "RobotoMono_700Bold",
  },
  itemTitle: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "RobotoMono_700Bold",
  },
  itemSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  itemQty: {
    marginLeft: 10,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "RobotoMono_700Bold",
  },
  priceRow: {
    flexDirection: "column",
    marginTop: 10,
    gap: 6,
  },
  priceItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "RobotoMono_400Regular",
  },
  oldPrice: {
    color: "#111827",

    fontSize: 16,
    fontFamily: "RobotoMono_400Regular",
  },
  curPrice: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "RobotoMono_700Bold",
  },
  totalBar: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1EFEA",
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: "#6B7280",
    fontSize: 15,
    fontFamily: "RobotoMono_400Regular",
  },
  totalValue: {
    color: ORANGE2,
    fontSize: 20,
    fontFamily: "RobotoMono_700Bold",
  },
  extraServicesBlock: {
    marginHorizontal: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECD0",
  },
  extraServicesTitle: {
    color: ORANGE2,
    fontSize: 15,
    marginBottom: 10,
    fontFamily: "RobotoMono_700Bold",
  },
  extraServiceCard: {
    backgroundColor: "#FFF9EF",
    borderRadius: 9,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFD8B4",
  },
  extraServiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  extraServiceName: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
  extraServicePrice: {
    color: ORANGE2,
    fontSize: 15,
    fontFamily: "RobotoMono_700Bold",
  },
  sessionsBlock: {
    marginHorizontal: 12,
    marginBottom: 28,
    marginTop: 3,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECD0",
  },
  sessionsTitle: {
    color: ORANGE2,
    fontSize: 15,
    marginBottom: 8,
    fontFamily: "RobotoMono_700Bold",
  },
  sessionCard: {
    backgroundColor: "#FFF9EF",
    borderRadius: 9,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFD8B4",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  sessionHeading: {
    color: ORANGE,
    fontSize: 14,
    marginBottom: 2,
    fontFamily: "RobotoMono_700Bold",
  },
  sessionDate: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "RobotoMono_400Regular",
    marginBottom: 4,
  },
  sessionStatus: {
    fontSize: 13,
    marginTop: 4,
    fontFamily: "RobotoMono_700Bold",
  },
  actItemsBlock: {
    marginHorizontal: 12,
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECD0",
  },
  actItemsTitle: {
    color: ORANGE2,
    fontSize: 15,
    marginBottom: 10,
    fontFamily: "RobotoMono_700Bold",
  },
  actItemCard: {
    backgroundColor: "#FFF9EF",
    borderRadius: 9,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFD8B4",
  },
  actItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  actItemIndex: {
    color: ORANGE,
    fontSize: 12,
    fontFamily: "RobotoMono_700Bold",
    backgroundColor: "#FFE4CC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actItemSong: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
  actItemDetails: {
    marginBottom: 8,
    gap: 4,
  },
  actItemDetailText: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "RobotoMono_400Regular",
  },
  actItemDesc: {
    color: "#4B5563",
    fontSize: 13,
    fontFamily: "RobotoMono_400Regular",
    marginBottom: 6,
    lineHeight: 18,
  },
  actItemLink: {
    color: "#2563EB",
    fontSize: 12,
    fontFamily: "RobotoMono_400Regular",
    textDecorationLine: "underline",
  },
  msgBtnFab: {
    position: "absolute",
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
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
    color: "#fff",
    fontSize: 15,
    minWidth: 54,
    textAlign: "center",
    fontFamily: "RobotoMono_700Bold",
  },
  feedbackBlock: {
    marginHorizontal: 12,
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  feedbackTitle: {
    color: ORANGE2,
    fontSize: 15,
    marginBottom: 10,
    fontFamily: "RobotoMono_700Bold",
  },
  feedbackCard: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1EFEA",
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  feedbackAuthor: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "RobotoMono_700Bold",
  },
  feedbackRating: {
    fontSize: 14,
    color: "#F59E0B",
    fontFamily: "RobotoMono_700Bold",
  },
  feedbackComment: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "RobotoMono_400Regular",
  },
  feedbackEmpty: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  feedbackEmptyState: {
    paddingVertical: 8,
    gap: 12,
  },
  feedbackButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: ORANGE2,
  },
  feedbackButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  stateMessage: {
    marginTop: 16,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 15,
    fontFamily: "RobotoMono_400Regular",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: ORANGE2,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "RobotoMono_700Bold",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 50,
    paddingTop: 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3ECE7",
    zIndex: 20,
    gap: 14,
  },
  checkinBtn: {
    flex: 1,
    backgroundColor: ORANGE2,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  checkinBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
  complaintBlock: {
    marginHorizontal: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  complaintButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  complaintButtonText: {
    color: "#DC2626",
    fontSize: 15,
    fontFamily: "RobotoMono_700Bold",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: ORANGE2,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: ORANGE2,
    fontSize: 15,
    fontFamily: "RobotoMono_700Bold",
  },
  paymentButton: {
    flex: 1,
    backgroundColor: ORANGE2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: ORANGE2,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "RobotoMono_700Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "RobotoMono_700Bold",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
    color: "#6B7280",
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 14,
    fontFamily: "RobotoMono_400Regular",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtnText: {
    color: "#6B7280",
    fontSize: 15,
    fontFamily: "RobotoMono_700Bold",
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: ORANGE2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmBtnDisabled: {
    opacity: 0.6,
  },
  modalConfirmBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "RobotoMono_700Bold",
  },
  paymentInfoBlock: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "RobotoMono_400Regular",
  },
  paymentBalance: {
    color: "#059669",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
  paymentPrice: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
  insufficientBlock: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  insufficientText: {
    color: "#B91C1B",
    fontSize: 13,
    fontFamily: "RobotoMono_400Regular",
  },
  insufficientAmount: {
    fontFamily: "RobotoMono_700Bold",
    color: "#DC2626",
  },
  sufficientBlock: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  sufficientText: {
    color: "#166534",
    fontSize: 13,
    fontFamily: "RobotoMono_700Bold",
  },
  paymentStatusBlock: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  paymentStatusLabel: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 8,
    fontFamily: "RobotoMono_700Bold",
  },
  paymentStatusValue: {
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
  paymentStatusPaid: {
    color: "#16A34A",
  },
  paymentStatusUnpaid: {
    color: "#F59E0B",
  },
});

// Color mapping for overall booking status (Vietnamese status names)
function getBookingStatusStyle(status: string): { bg: string; color: string } {
  const normalized = (status || "").trim();

  switch (normalized) {
    case "Đơn đặt chờ xác nhận":
      return { bg: "#FEF9C3", color: "#B45309" }; // pending
    case "Đơn đặt đã kích hoạt":
      return { bg: "#DBEAFE", color: "#1D4ED8" }; // active
    case "Đơn đặt không kích hoạt":
      return { bg: "#E5E7EB", color: "#4B5563" }; // neutral
    case "Đơn đặt đang tiến hành":
      return { bg: "#E0F2FE", color: "#0369A1" }; // in progress
    case "Đơn đặt đã hoàn thành công việc":
      return { bg: "#DCFCE7", color: "#16A34A" }; // work done
    case "Đơn đặt hoàn tất":
      return { bg: "#BBF7D0", color: "#15803D" }; // fully completed
    case "Đơn đặt chưa hoàn tất":
      return { bg: "#F3F4F6", color: "#4B5563" }; // not finished
    case "Đơn đặt đã hủy":
      return { bg: "#FEE2E2", color: "#B91C1B" }; // cancelled
    case "Đơn đặt hết chỗ":
      return { bg: "#FFEDD5", color: "#C2410C" }; // full
    case "Đơn trong trạng thái khiếu nại":
      return { bg: "#FEF3C7", color: "#B45309" }; // complaint
    default:
      return { bg: "#E7F5EF", color: "#0E766E" }; // default teal
  }
}
