import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { generateBookingQR } from '../service/api';

const ORANGE2 = '#FF7A00';

export default function DancerCustomerQR() {
  const params = useLocalSearchParams();
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string|undefined>();
  const [qrContent, setQrContent] = useState<string | undefined>();

  const passedBookingId = params?.bookingId ? Number(params.bookingId as string) : undefined;

  const loadQr = useCallback(async () => {
    const bId = passedBookingId;
    if (!bId) return;
    try {
      setQrLoading(true);
      setQrError(undefined);
      setQrContent(undefined);
      const res = await generateBookingQR(bId);
      const data = res?.data?.result?.qrCodeData;
    //   console.log(data?.result?.qrCodeData);
      
      if (typeof data === 'string') {
        setQrContent(data);
      } else if (data?.qr || data?.url || data?.image) {
        setQrContent(String(data.qr || data.url || data.image));
      } else {
        setQrError('Không thể tạo mã QR');
      }
    } catch (e: any) {
      setQrError(e?.response?.data?.message || e?.message || 'Lỗi khi tạo mã QR');
    } finally {
      setQrLoading(false);
    }
  }, [passedBookingId]);

  useEffect(() => {
    void loadQr();
  }, [loadQr]);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: true, title: 'Quét mã QR để checkin' }} />

      {/* Generated QR preview (if provided by backend) */}
      <View style={styles.qrWrap}>
        {qrLoading ? (
          <ActivityIndicator color={ORANGE2} />
        ) : qrError ? (
          <Text style={styles.qrError}>{qrError}</Text>
        ) : qrContent ? (
          qrContent.startsWith('http') || qrContent.startsWith('data:image') ? (
            <Image source={{ uri: qrContent }} style={styles.qrImage} resizeMode="contain" />
          ) : (
            <View style={styles.qrTextCard}><Text style={styles.qrText}>{qrContent}</Text></View>
          )
        ) : (
          <Text style={styles.qrHint}>Đang chờ mã QR của đơn đặt...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  qrWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  qrImage: {
    width: 260,
    height: 260,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  qrTextCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  qrText: {
    color: '#111827',
    textAlign: 'center',
  },
  qrHint: {
    color: '#6B7280',
    fontFamily: 'Roboto',
  },
  qrError: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

