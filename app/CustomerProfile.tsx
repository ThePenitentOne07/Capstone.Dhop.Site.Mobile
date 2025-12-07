import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useUserInfo } from '../hooks/useUserInfo';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
// import { MaterialIcons } from '@expo/vector-icons';
import { uploadImageToCloudinary } from '../service/cloudinaryService';
import { updateUserProfile } from '../service/api';
import { useAppModal } from '../hooks/useAppModal';

const ORANGE2 = '#FF7A00';
const ORANGE = '#FF7120';

export default function CustomerProfile() {
  const { user, loading, refetch } = useUserInfo();
  const [uploading, setUploading] = useState(false);
  const [updatingPhone, setUpdatingPhone] = useState(false);
//   const placeholderAvatar = require('../assets/vecteezy_man-using-smartphone-device_24096847.png');
  const avatarUri = user?.avatar as string | undefined;
  const [localAvatarUri, setLocalAvatarUri] = useState<string | undefined>(avatarUri);
  const name = user?.name || 'Chưa có tên';
  const email = user?.email || 'Chưa cập nhật email';
  // @ts-ignore: optional fields may not exist on user
  const phone = user?.phone || '';
  const [phoneValue, setPhoneValue] = useState<string>(phone);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const avatarInitial = name?.[0]?.toUpperCase() || 'U';
  const { showModal, modal } = useAppModal();

   
  useEffect(() => {
    setLocalAvatarUri(avatarUri);
  }, [avatarUri]);

  useEffect(() => {
    setPhoneValue(phone);
  }, [phone]);

  const handleImagePicker = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal({
          title: 'Quyền truy cập',
          message: 'Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.',
          status: 'info',
        });
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
        const asset = result.assets[0];
        setUploading(true);
        const uploadResult = await uploadImageToCloudinary(imageUri, asset.fileName ?? undefined);
        setLocalAvatarUri(uploadResult.secure_url);

        const payload = {
          avatar: uploadResult.secure_url,
          name: user?.name ?? '',
          phone: user?.phone ?? '',
        };

        await updateUserProfile(payload);
        await refetch();

        showModal({
          title: 'Thành công',
          message: 'Ảnh đại diện đã được cập nhật.',
          status: 'success',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.';
      showModal({
        title: 'Lỗi',
        message,
        status: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenPhoneModal = () => {
    setPhoneValue(phone);
    setShowPhoneModal(true);
  };

  const handleClosePhoneModal = () => {
    setPhoneValue(phone);
    setShowPhoneModal(false);
  };

  const handleUpdatePhone = async () => {
    if (phoneValue.trim() === phone) {
      setShowPhoneModal(false);
      return;
    }

    try {
      setUpdatingPhone(true);
      const payload = {
        avatar: user?.avatar ?? '',
        name: user?.name ?? '',
        phone: phoneValue.trim(),
      };

      await updateUserProfile(payload);
      await refetch();

      setShowPhoneModal(false);
      showModal({
        title: 'Thành công',
        message: 'Số điện thoại đã được cập nhật.',
        status: 'success',
      });
    } catch (error) {
      console.error('Error updating phone:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể cập nhật số điện thoại. Vui lòng thử lại.';
      showModal({
        title: 'Lỗi',
        message,
        status: 'error',
      });
      // Revert to original phone value on error
      setPhoneValue(phone);
    } finally {
      setUpdatingPhone(false);
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
            fontFamily: 'RobotoMono_700Bold',
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
            
          ) : localAvatarUri ? (
            <Image source={{ uri: localAvatarUri }} style={styles.profilePic} />
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
          <TouchableOpacity
            onPress={handleOpenPhoneModal}
            style={styles.phoneValueContainer}
          >
            <Text style={styles.detailValue}>
              {phone || 'Cập nhật số điện thoại'}
            </Text>
          </TouchableOpacity>
        </View>
      
      </View>
      {modal}
      
      <Modal
        visible={showPhoneModal}
        transparent
        animationType="fade"
        onRequestClose={handleClosePhoneModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật số điện thoại</Text>
            <TextInput
              style={styles.modalInput}
              value={phoneValue}
              onChangeText={setPhoneValue}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              autoFocus
              editable={!updatingPhone}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={handleClosePhoneModal}
                disabled={updatingPhone}
                style={[styles.modalButton, styles.modalCancelButton]}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdatePhone}
                disabled={updatingPhone}
                style={[styles.modalButton, styles.modalSaveButton]}
              >
                {updatingPhone ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'RobotoMono_700Bold',
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
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
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
    marginBottom: 16,
    fontFamily: 'RobotoMono_700Bold',
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
    fontFamily: 'RobotoMono_700Bold',
  },
  phoneValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#FFE1BC',
    shadowColor: ORANGE2,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    color: ORANGE2,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'RobotoMono_700Bold',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: ORANGE2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#E5E7EB',
  },
  modalCancelButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
  },
  modalSaveButton: {
    backgroundColor: ORANGE2,
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
  },
});
