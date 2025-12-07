import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppModal } from '../hooks/useAppModal';
import { useUserInfo } from '../hooks/useUserInfo';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../service/cloudinaryService';
import { getComplaintTypes, ComplaintTypeResponse, submitBookingComplaint } from '../service/api';

const ORANGE2 = '#FF7A00';

type ComplaintRole = 'USER' | 'DANCER' | 'CHOREOGRAPHY';

interface ComplaintOption extends ComplaintTypeResponse {}

interface EvidenceImage {
  id: string;
  localUri: string;
  uploading: boolean;
  remoteUrl?: string;
  error?: string;
}

const ROLE_ALIASES: Record<string, ComplaintRole> = {
  USER: 'USER',
  DANCER: 'DANCER',
  CHOREOGRAPHY: 'CHOREOGRAPHY',
  CHOREOGRAPHER: 'CHOREOGRAPHY',
};

const ROLE_LABELS: Record<ComplaintRole, string> = {
  USER: 'khách hàng',
  DANCER: 'nhóm nhảy',
  CHOREOGRAPHY: 'biên đạo',
};

const normalizeRole = (roleValue: unknown): ComplaintRole | undefined => {
  if (!roleValue) return undefined;
  const toUpper = (value: string) => value.trim().toUpperCase();

  if (typeof roleValue === 'string') {
    return ROLE_ALIASES[toUpper(roleValue)];
  }

  if (Array.isArray(roleValue)) {
    const first = roleValue[0];
    if (typeof first === 'string') {
      return ROLE_ALIASES[toUpper(first)];
    }
    if (first && typeof first === 'object' && 'name' in first && typeof first.name === 'string') {
      return ROLE_ALIASES[toUpper(first.name)];
    }
  }

  if (typeof roleValue === 'object' && roleValue !== null && 'name' in roleValue) {
    const name = (roleValue as { name?: string }).name;
    if (typeof name === 'string') {
      return ROLE_ALIASES[toUpper(name)];
    }
  }

  return undefined;
};

export default function Complaint() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showModal, modal } = useAppModal();
  const { user } = useUserInfo();

  const bookingId = useMemo(() => {
    const idParam = params.bookingId;
    if (typeof idParam === 'string') return idParam;
    if (Array.isArray(idParam)) return idParam[0];
    return undefined;
  }, [params.bookingId]);

  const userRole = useMemo<ComplaintRole | undefined>(() => normalizeRole(user?.role), [user]);

  const [complaintOptions, setComplaintOptions] = useState<ComplaintOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pickingImages, setPickingImages] = useState(false);
  const [evidenceImages, setEvidenceImages] = useState<EvidenceImage[]>([]);

  const loadComplaintOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const res = await getComplaintTypes();
      const data = Array.isArray(res.data) ? res.data : [];
      setComplaintOptions(data);
    } catch (error: any) {
      console.error('Failed to load complaint types:', error);
      setOptionsError(error?.response?.data?.message || error?.message || 'Không thể tải danh sách khiếu nại');
      setComplaintOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaintOptions();
  }, [loadComplaintOptions]);

  const handlePickImages = useCallback(async () => {
    try {
      setPickingImages(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showModal({
          title: 'Quyền truy cập',
          message: 'Cần quyền truy cập thư viện ảnh để chọn minh chứng.',
          status: 'info',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const assetsWithMeta = result.assets.map((asset) => ({
        asset,
        image: {
          id: `${asset.assetId ?? asset.fileName ?? asset.uri}-${Date.now()}-${Math.random()}`,
          localUri: asset.uri,
          uploading: true,
        } as EvidenceImage,
      }));

      setEvidenceImages((prev) => [...prev, ...assetsWithMeta.map((item) => item.image)]);

      await Promise.all(
        assetsWithMeta.map(async ({ asset, image }) => {
          try {
            const uploadResult = await uploadImageToCloudinary(asset.uri, asset.fileName ?? undefined);
            setEvidenceImages((prev) =>
              prev.map((item) =>
                item.id === image.id ? { ...item, uploading: false, remoteUrl: uploadResult.secure_url, error: undefined } : item
              )
            );
          } catch (error: any) {
            console.error('Failed to upload evidence image:', error);
            setEvidenceImages((prev) =>
              prev.map((item) =>
                item.id === image.id
                  ? {
                      ...item,
                      uploading: false,
                      remoteUrl: undefined,
                      error: error?.message || 'Tải ảnh thất bại',
                    }
                  : item
              )
            );
          }
        })
      );
    } finally {
      setPickingImages(false);
    }
  }, [showModal]);

  const handleRemoveEvidence = useCallback((id: string) => {
    setEvidenceImages((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const hasUploadingEvidence = useMemo(() => evidenceImages.some((item) => item.uploading), [evidenceImages]);

  const filteredOptions = useMemo(() => {
    if (!complaintOptions.length) return [];
    if (!userRole) return complaintOptions;
    return complaintOptions.filter((option) => {
      if (!Array.isArray(option.roles) || option.roles.length === 0) return true;
      return option.roles.some((roleValue) => {
        if (typeof roleValue !== 'string') return false;
        const upper = roleValue.toUpperCase();
        const normalized = ROLE_ALIASES[upper] ?? (upper as ComplaintRole);
        return normalized === userRole;
      });
    });
  }, [complaintOptions, userRole]);

  useEffect(() => {
    if (selectedOption && !filteredOptions.some((option) => option.type === selectedOption)) {
      setSelectedOption(null);
    }
  }, [filteredOptions, selectedOption]);

  const handleSubmit = async () => {
    if (optionsLoading) {
      return;
    }

    if (!filteredOptions.length) {
      showModal({
        title: 'Thông báo',
        message: 'Hiện tại không có loại khiếu nại phù hợp để gửi.',
        status: 'info',
      });
      return;
    }

    if (!bookingId) {
      showModal({
        title: 'Lỗi',
        message: 'Thiếu thông tin mã đặt lịch. Vui lòng quay lại và thử lại.',
        status: 'error',
      });
      return;
    }

    if (!selectedOption) {
      showModal({
        title: 'Lỗi',
        message: 'Vui lòng chọn loại khiếu nại',
        status: 'error',
      });
      return;
    }

    const selectedMeta = filteredOptions.find((option) => option.type === selectedOption);
    if (!selectedMeta) {
      showModal({
        title: 'Lỗi',
        message: 'Loại khiếu nại đã chọn không khả dụng. Vui lòng chọn lại.',
        status: 'error',
      });
      return;
    }

    if (!description.trim()) {
      showModal({
        title: 'Lỗi',
        message: 'Vui lòng nhập mô tả chi tiết về khiếu nại',
        status: 'error',
      });
      return;
    }

    if (hasUploadingEvidence) {
      showModal({
        title: 'Vui lòng đợi',
        message: 'Ảnh minh chứng đang được tải lên. Hãy đợi hoàn tất trước khi gửi.',
        status: 'info',
      });
      return;
    }

    const successfulEvidence = evidenceImages.filter((item) => item.remoteUrl);
    const evidenceUrls = successfulEvidence.map((item) => item.remoteUrl!) || [];

    const normalizedBookingId = (() => {
      const parsed = Number(bookingId);
      return Number.isFinite(parsed) ? parsed : bookingId;
    })();

    setSubmitting(true);
    try {
      await submitBookingComplaint({
        bookingId: normalizedBookingId,
        complainType: selectedOption,
        content: description.trim(),
        evidenceUrls,
      });

      showModal({
        title: 'Thành công',
        message: 'Khiếu nại của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.',
        status: 'success',
        onClose: () => {
          router.back();
        },
      });
    } catch (error: any) {
      console.error('Failed to submit complaint:', error);
      showModal({
        title: 'Lỗi',
        message: error?.message || 'Không thể gửi khiếu nại. Vui lòng thử lại sau.',
        status: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = submitting || optionsLoading || filteredOptions.length === 0 || hasUploadingEvidence;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Khiếu nại</Text>
        <Text style={styles.subtitle}>
          {userRole
            ? `Các loại khiếu nại khả dụng cho vai trò ${ROLE_LABELS[userRole]}. Vui lòng chọn và mô tả chi tiết vấn đề.`
            : 'Vui lòng chọn loại khiếu nại và mô tả chi tiết vấn đề.'}
        </Text>

        <View style={styles.optionsContainer}>
          {optionsLoading ? (
            <View style={styles.stateBlock}>
              <ActivityIndicator color={ORANGE2} />
              <Text style={styles.stateMessage}>Đang tải danh sách khiếu nại...</Text>
            </View>
          ) : optionsError ? (
            <View style={styles.stateBlock}>
              <Text style={styles.stateMessage}>{optionsError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadComplaintOptions} activeOpacity={0.85}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : filteredOptions.length === 0 ? (
            <View style={styles.stateBlock}>
              <Text style={styles.stateMessage}>
                Không có loại khiếu nại phù hợp cho vai trò hiện tại. Vui lòng liên hệ hỗ trợ.
              </Text>
            </View>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedOption === option.type;
              return (
                <TouchableOpacity
                  key={option.type}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setSelectedOption(option.type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {option.description || option.type}
                    </Text>
                    {/* <Text style={styles.optionCode}>{option.type}</Text> */}
                  </View>
                  <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Mô tả chi tiết *</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Vui lòng mô tả chi tiết về vấn đề bạn gặp phải..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <Text style={styles.descriptionHint}>
            Vui lòng cung cấp thông tin chi tiết để chúng tôi có thể xử lý khiếu nại của bạn một cách tốt nhất.
          </Text>
        </View>

        <View style={styles.evidenceSection}>
          <View style={styles.evidenceHeader}>
            <Text style={styles.evidenceLabel}>Hình ảnh minh chứng (tùy chọn)</Text>
          
          </View>
          <TouchableOpacity
              style={[styles.pickButton, (pickingImages || hasUploadingEvidence) && styles.pickButtonDisabled]}
              onPress={handlePickImages}
              disabled={pickingImages}
              activeOpacity={0.85}
            >
              {pickingImages ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.pickButtonText}>Chọn ảnh</Text>}
            </TouchableOpacity>
          <Text style={styles.evidenceHint}>
            Bạn có thể chọn nhiều ảnh làm minh chứng. Ảnh mới sẽ được tải lên tự động trước khi gửi.
          </Text>
          {evidenceImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceList}>
              {evidenceImages.map((image) => (
                <View key={image.id} style={styles.evidenceItem}>
                  <Image source={{ uri: image.localUri }} style={styles.evidenceImage} />
                  <TouchableOpacity style={styles.removeBadge} onPress={() => handleRemoveEvidence(image.id)} activeOpacity={0.8}>
                    <Text style={styles.removeBadgeText}>×</Text>
                  </TouchableOpacity>
                  {image.uploading && (
                    <View style={styles.evidenceOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.evidenceOverlayText}>Đang tải...</Text>
                    </View>
                  )}
                  {!!image.error && !image.uploading && (
                    <View style={styles.evidenceError}>
                      <Text style={styles.evidenceErrorText}>{image.error}</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.submitButton, (submitting || isSubmitDisabled) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Gửi khiếu nại</Text>
          )}
        </TouchableOpacity>
      </View>

      {modal}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontFamily: 'RobotoMono_700Bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'RobotoMono_400Regular',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    backgroundColor: '#FFF9EF',
    borderColor: ORANGE2,
  },
  optionContent: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
    color: '#111827',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: ORANGE2,
  },
  optionCode: {
    fontSize: 12,
    fontFamily: 'RobotoMono_400Regular',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: ORANGE2,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ORANGE2,
  },
  stateBlock: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateMessage: {
    fontSize: 14,
    fontFamily: 'RobotoMono_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: ORANGE2,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'RobotoMono_700Bold',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: 'RobotoMono_400Regular',
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 120,
  },
  descriptionHint: {
    fontSize: 12,
    fontFamily: 'RobotoMono_400Regular',
    color: '#9CA3AF',
    marginTop: 8,
  },
  evidenceSection: {
    marginBottom: 24,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  evidenceLabel: {
    fontSize: 15,
    fontFamily: 'RobotoMono_700Bold',
    color: '#111827',
  },
  pickButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ORANGE2,
  },
  pickButtonDisabled: {
    opacity: 0.6,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'RobotoMono_700Bold',
  },
  evidenceHint: {
    fontSize: 12,
    fontFamily: 'RobotoMono_400Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  evidenceList: {
    flexGrow: 0,
  },
  evidenceItem: {
    marginRight: 12,
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  removeBadgeText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
  },
  evidenceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  evidenceOverlayText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  evidenceError: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,122,0,0.95)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  evidenceErrorText: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3ECE7',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    zIndex: 20,
  },
  submitButton: {
    backgroundColor: ORANGE2,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: ORANGE2,
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
});

