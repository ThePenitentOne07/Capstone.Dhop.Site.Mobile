import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Dropdown from '../common/Dropdown';

interface Step3Props {
  selectedDatesISO: string[];
  onSubmit: (sessions: { dateISO: string; startTime: string; durationMinutes: number }[]) => void;
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      options.push(`${hh}:${mm}`);
    }
  }
  return options;
}

const durationOptions = [30, 60, 90, 120, 150, 180];

export default function Step3({ selectedDatesISO, onSubmit }: Step3Props) {
  const timeOptions = useMemo(() => generateTimeOptions(), []);
  const [sessions, setSessions] = useState<Record<string, { startTime: string; durationMinutes: number }>>(() => {
    const init: Record<string, { startTime: string; durationMinutes: number }> = {};
    selectedDatesISO.forEach(dateISO => {
      init[dateISO] = { startTime: '09:00', durationMinutes: 60 };
    });
    return init;
  });

  const canSubmit = selectedDatesISO.every(d => !!sessions[d]?.startTime && !!sessions[d]?.durationMinutes);

  const setTime = (dateISO: string, value: string) => {
    setSessions({ ...sessions, [dateISO]: { ...sessions[dateISO], startTime: value } });
  };

  const setDuration = (dateISO: string, value: number) => {
    setSessions({ ...sessions, [dateISO]: { ...sessions[dateISO], durationMinutes: value } });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const result = selectedDatesISO.map(dateISO => ({
      dateISO,
      startTime: sessions[dateISO].startTime,
      durationMinutes: sessions[dateISO].durationMinutes,
    }));
    onSubmit(result);
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {selectedDatesISO.map((dateISO) => {
          const s = sessions[dateISO];
          return (
            <View key={dateISO} style={styles.card}>
              <Text style={styles.dateLabel}>{formatDateLabel(dateISO)}</Text>

              <View style={styles.row}>
                <View style={styles.dropdownColumn}>
                  <Text style={styles.dropdownLabel}>Giờ bắt đầu</Text>
                  <Dropdown
                    data={timeOptions.map(t => ({ value: t, label: t }))}
                    onChange={(item) => setTime(dateISO, item.value)}
                    placeholder={s.startTime}
                  />
                </View>

                <View style={styles.spacer} />

                <View style={styles.dropdownColumn}>
                  <Text style={styles.dropdownLabel}>Thời lượng</Text>
                  <Dropdown
                    data={durationOptions.map(d => ({ value: String(d), label: `${d} phút` }))}
                    onChange={(item) => setDuration(dateISO, parseInt(item.value))}
                    placeholder={`${s.durationMinutes} phút`}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          disabled={!canSubmit}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>Xác nhận</Text>
        </TouchableOpacity> */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            disabled={!canSubmit}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>Tiếp theo</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  spacer: {
    width: 12,
  },
  dropdownColumn: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
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
  submitButtonContainer: {
    marginTop: 16,
    paddingBottom: 40,
  },
});


