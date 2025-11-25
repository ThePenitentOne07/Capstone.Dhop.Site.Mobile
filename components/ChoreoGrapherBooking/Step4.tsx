import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Dropdown from '../common/Dropdown';
import useArea from '../../hooks/useArea';

interface Step4Props {
  sessions: { dateISO: string; startTime: string; durationMinutes: number }[];
  onSubmit: (data: { location: string; description?: string; areaId: number; bookingExtraServiceRequests: { extraServiceId: number; quantity: number }[] }) => void;
  choreographerAreas?: Array<{ id: number; city: string; ward: string }>;
  extraServices?: Array<{ id: number; name: string; description?: string; price?: number }>;
}

export default function Step4({ sessions, onSubmit, choreographerAreas = [], extraServices = [] }: Step4Props) {
  const { areas, loading } = useArea();
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState<number | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  // Filter areas to only include those that the choreographer has
  const areaOptions = useMemo(() => {
    const choreographerAreaIds = new Set(choreographerAreas.map(a => a.id));
    return areas
      .filter(a => choreographerAreaIds.has(a.id))
      .map(a => ({ value: String(a.id), label: `${a.ward} - ${a.city}` }));
  }, [areas, choreographerAreas]);

  const bookingExtraServiceRequests = useMemo(
    () => selectedServiceIds.map(id => ({ extraServiceId: id, quantity: 1 })),
    [selectedServiceIds]
  );

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const isValid = location.trim().length > 0 && !!areaId;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ 
      location: location.trim(), 
      description: description.trim() || undefined, 
      areaId: areaId!, 
      bookingExtraServiceRequests 
    });
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Địa điểm</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa điểm buổi tập..."
          placeholderTextColor="#9CA3AF"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mô tả (tuỳ chọn)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Ghi chú thêm..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Khu vực</Text>
        <Dropdown
          data={areaOptions}
          onChange={(item) => setAreaId(parseInt(item.value))}
          placeholder={loading ? 'Đang tải...' : (areaId ? (areaOptions.find(o => o.value === String(areaId))?.label ?? 'Chọn khu vực') : 'Chọn khu vực')}
        />
      </View>

      {!!extraServices.length && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Dịch vụ bổ sung</Text>
          <View style={styles.servicesList}>
            {extraServices.map(service => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceCard, selected && styles.serviceCardSelected]}
                  onPress={() => toggleService(service.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                  
                  </View>
                  <Text style={styles.servicePrice}>
                      {service.price ? `${service.price.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                    </Text>
                  {!!service.description && (
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  )}
                  
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                    {selected && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
        disabled={!isValid}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={[styles.submitText, !isValid && styles.submitTextDisabled]}>Xác nhận đặt lịch</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#1F2937',
    fontSize: 14,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submitTextDisabled: {
    color: '#9CA3AF',
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  serviceCardSelected: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF7ED',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    paddingRight: 12,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A00',
  },
  serviceDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  checkbox: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});


