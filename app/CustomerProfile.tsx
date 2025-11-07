import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useUserInfo } from '../hooks/useUserInfo';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

const ORANGE2 = '#FF7A00';
const ORANGE = '#FF7120';

export default function CustomerProfile() {
  const { user, loading, refetch } = useUserInfo();
  const [uploading, setUploading] = useState(false);
//   const placeholderAvatar = require('../assets/vecteezy_man-using-smartphone-device_24096847.png');
  const avatarUri = user?.avatar as string | undefined;
  const name = user?.name || 'Chưa có tên';
  const email = user?.email || 'Chưa cập nhật email';
  // @ts-ignore: optional fields may not exist on user
  const phone = user?.phone || 'Cập nhật số điện thoại';
  const avatarInitial = name?.[0]?.toUpperCase() || 'U';

  const handleImagePicker = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        // TODO: Upload image to server and update user avatar
        // For now, just show an alert
        Alert.alert('Thành công', 'Đã chọn ảnh. Tính năng upload sẽ được thêm sau.');
        // After upload, call refetch() to refresh user data
        // await refetch();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Hồ sơ',
          headerStyle: {
            backgroundColor: ORANGE2,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />

      <View style={styles.headerCard}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleImagePicker}
          activeOpacity={0.8}
          disabled={loading || uploading}
        >
          {loading || uploading ? (
            
              <ActivityIndicator color={ORANGE2} size="small" />
            
          ) : avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.profilePic} />
          ) : (
            <View style={styles.profileFallback}>
              <Text style={styles.profileFallbackText}>{avatarInitial}</Text>
            </View>
          )}
          {!loading && !uploading && (
            <View style={styles.avatarOverlay}>
              <BlurView intensity={20} style={styles.blurOverlay} tint="dark">
                <Text style={styles.editText}>Sửa</Text>
              </BlurView>
            </View>
          )}
          eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJiYzgyOGZhOC1iMjc5LTRmNjQtYjhlNi04ZTQ1YjViYTNmMGIiLCJwZXJtaXNzaW9ucyI6W10sInNjb3BlIjoiUk9MRV9VU0VSIiwiaXNzIjoiZGhvcC5zaXRlIiwiZXhwIjoxNzYzNDA3MTY1LCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzYyNTA3MTY1LCJqdGkiOiIxNDc3ZTYwMC1hYWEyLTRlMmYtOTEzNC0xZjU0NGI2MWM3MmEifQ.TrejNR54S76z76gxFxsf6rgHxxOfH-KcZJ7Fi5fmu6rS8y88-iF88Kpy3z6bbQILfxtYoqXcpWvAbh0P62BLdQeyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJiYzgyOGZhOC1iMjc5LTRmNjQtYjhlNi04ZTQ1YjViYTNmMGIiLCJwZXJtaXNzaW9ucyI6W10sInNjb3BlIjoiUk9MRV9VU0VSIiwiaXNzIjoiZGhvcC5zaXRlIiwiZXhwIjoxNzYzNDA3MTY1LCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzYyNTA3MTY1LCJqdGkiOiIxNDc3ZTYwMC1hYWEyLTRlMmYtOTEzNC0xZjU0NGI2MWM3MmEifQ.TrejNR54S76z76gxFxsf6rgHxxOfH-KcZJ7Fi5fmu6rS8y88-iF88Kpy3z6bbQILfxtYoqXcpWvAbh0P62BLdQ
        </TouchableOpacity>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailHeading}>Thông tin liên hệ</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tên</Text>
          <Text style={styles.detailValue}>{name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Số điện thoại</Text>
          <Text style={styles.detailValue}>{phone}</Text>
        </View>
      
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFD8B4',
    shadowColor: ORANGE2,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
    justifyContent: 'center',

  },
  avatarContainer: {
     width: 86,
     height: 86,
     borderRadius: 50,
     overflow: 'hidden',
     position: 'relative',
     justifyContent: 'center',
     alignItems: 'center',
   },
  profilePic: {
    width: 86,
    height: 86,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: ORANGE2,
    backgroundColor: '#fff',
  },
  profileFallback: {
    width: 86,
    height: 86,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: ORANGE2,
    backgroundColor: '#FFF4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileFallbackText: {
    fontSize: 34,
    fontWeight: '700',
    color: ORANGE2,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 22,
    overflow: 'hidden',
    borderBottomLeftRadius: 43,
    borderBottomRightRadius: 43,
    zIndex: 1,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: 26,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ORANGE2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: ORANGE2,
  },
  email: {
    fontSize: 15,
    color: '#4B5563',
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE1BC',
    shadowColor: ORANGE2,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailHeading: {
    fontSize: 18,
    color: ORANGE2,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
});
