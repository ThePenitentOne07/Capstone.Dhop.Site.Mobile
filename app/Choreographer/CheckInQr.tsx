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
      router.back();
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
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
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
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Bạn có muốn check buổi tập này !</Text>
            {!!scannedPayload && (
              <Text style={styles.modalSub}>{scannedPayload.data?.slice(0, 100)}</Text>
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
      )}

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
