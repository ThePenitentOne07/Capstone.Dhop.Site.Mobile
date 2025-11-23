import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Dropdown from '../common/Dropdown';
import useArea, { Area } from '../../hooks/useArea';

interface Step4Props {
  sessions: { dateISO: string; startTime: string; durationMinutes: number }[];
  onSubmit: (data: { location: string; description?: string; areaId: number }) => void;
  choreographerAreas?: Array<{ id: number; city: string; ward: string }>;
}

export default function Step4({ sessions, onSubmit, choreographerAreas = [] }: Step4Props) {
  const { areas, loading } = useArea();
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState<number | null>(null);

  // Filter areas to only include those that the choreographer has
  const areaOptions = useMemo(() => {
    const choreographerAreaIds = new Set(choreographerAreas.map(a => a.id));
    return areas
      .filter(a => choreographerAreaIds.has(a.id))
      .map(a => ({ value: String(a.id), label: `${a.ward} - ${a.city}` }));
  }, [areas, choreographerAreas]);

  const isValid = location.trim().length > 0 && !!areaId;
//   console.log("Areas:", areas);
  

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ location: location.trim(), description: description.trim() || undefined, areaId: areaId! });
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
});


