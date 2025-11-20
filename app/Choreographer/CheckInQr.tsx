import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { qrTrainingSession } from '../../service/api';

const ORANGE2 = '#FF7A00';

export default function CheckInQr() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState<'on' | 'off'>('off');
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedPayload, setScannedPayload] = useState<{ type: string; data: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  const handleBarCodeScanned = useCallback(({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScannedPayload({ type, data });
    setModalVisible(true);
  }, [scanned]);

  const handleCancel = () => {
    setModalVisible(false);
    setScanned(false);
    setScannedPayload(null);
  };

  const handleConfirm = async () => {
    if (!scannedPayload?.data) {
      setModalVisible(false);
      return;
    }
    try {
      setSubmitting(true);
      // Expecting QR data as JSON string: {"sessionId": number, "userId": number}
      const parsed = JSON.parse(scannedPayload.data);
      const sessionId = Number(parsed.trainingSession.id);
      const userId = Number(parsed.userId);

     

      await qrTrainingSession(sessionId, userId);
      setModalVisible(false);
      router.push("/Choreographer/RequestBookingList");
    } catch (e) {
      // keep modal open to let user retry or cancel
    } finally {
      setSubmitting(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}> 
        <ActivityIndicator color={ORANGE2} />
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.note}>Bạn chưa cấp quyền sử dụng camera.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView
        onBarcodeScanned={handleBarCodeScanned as any}
        style={StyleSheet.absoluteFillObject}
        enableTorch={torch === 'on'}
        facing="back"
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => router.push('/Choreographer/RequestBookingList')}>
          <Text style={styles.topBtnText}>Đóng</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quét mã QR</Text>
        <TouchableOpacity style={styles.topBtn} onPress={() => setTorch(t => (t === 'on' ? 'off' : 'on'))}>
          <Text style={styles.topBtnText}>{torch === 'on' ? 'Tắt đèn' : 'Bật đèn'}</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay focus frame */}
      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.hint}>Căn mã QR vào khung</Text>
      </View>

      {/* Modal confirm */}
      {modalVisible && scannedPayload && (() => {
        let parsedData: any = null;
        try {
          parsedData = JSON.parse(scannedPayload.data);
        } catch (e) {
          parsedData = null;
        }

        const address = parsedData?.address || '';
        const scheduledTime = parsedData?.trainingSession?.scheduledTime || '';
        const durationMinutes = parsedData?.trainingSession?.durationMinutes || 0;
        const customerName = parsedData?.customerName || '';

        return (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Bạn có muốn checkin buổi tập này?</Text>
              
              {parsedData && (
                <View style={styles.modalContent}>
                  {customerName ? (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Khách hàng:</Text>
                      <Text style={styles.modalValue}>{customerName}</Text>
                    </View>
                  ) : null}
                  
                  {address ? (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Địa chỉ:</Text>
                      <Text style={styles.modalValue}>{address}</Text>
                    </View>
                  ) : null}
                  
                  {scheduledTime ? (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Thời gian:</Text>
                      <Text style={styles.modalValue}>{formatDateTime(scheduledTime)}</Text>
                    </View>
                  ) : null}
                  
                  {durationMinutes > 0 ? (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Thời lượng:</Text>
                      <Text style={styles.modalValue}>{formatDuration(durationMinutes)}</Text>
                    </View>
                  ) : null}
                </View>
              )}
              
              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={handleCancel} disabled={submitting}>
                  <Text style={styles.modalBtnSecondaryText}>Không</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleConfirm} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalBtnPrimaryText}>Có</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })()}

      {scanned && !modalVisible && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}>
            <Text style={styles.btnText}>Quét lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function formatDateTime(dateTimeString: string): string {
  try {
    const d = new Date(dateTimeString);
    const dateStr = d.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = d.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return dateTimeString;
  }
}

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `${hours} giờ ${remainingMinutes} phút`;
    }
    return `${hours} giờ`;
  }
  return `${minutes} phút`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  note: {
    marginTop: 8,
    color: '#6B7280',
    fontFamily: 'Roboto',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
  },
  topBtnText: {
    color: '#fff',
    fontFamily: 'Roboto',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  frameWrap: {
    position: 'absolute',
    top: '26%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  frame: {
    width: 260,
    height: 260,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: ORANGE2,
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 14,
    color: '#fff',
    fontFamily: 'Roboto',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 28,
    alignItems: 'center',
  },
  btn: {
    backgroundColor: ORANGE2,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#111827',
    marginBottom: 6,
    fontWeight: '700',
  },
  modalSub: {
    fontFamily: 'Roboto',
    color: '#6B7280',
    marginBottom: 12,
  },
  modalContent: {
    marginVertical: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  modalLabel: {
    fontFamily: 'Roboto',
    color: '#6B7280',
    fontSize: 14,
    width: 90,
    fontWeight: '600',
  },
  modalValue: {
    fontFamily: 'Roboto',
    color: '#111827',
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnSecondary: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalBtnSecondaryText: {
    color: '#111827',
    fontFamily: 'Roboto',
    fontWeight: '700',
  },
  modalBtnPrimary: {
    backgroundColor: ORANGE2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontWeight: '700',
  },
});
