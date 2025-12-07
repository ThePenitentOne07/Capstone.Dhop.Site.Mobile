import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Dropdown from '../common/Dropdown';
import type { OccupiedSession } from './Step2';

interface Step3Props {
  selectedDatesISO: string[];
  occupiedSessionsByDate?: Record<string, OccupiedSession[]>;
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

export default function Step3({ selectedDatesISO, occupiedSessionsByDate = {}, onSubmit }: Step3Props) {
  const timeOptions = useMemo(() => generateTimeOptions(), []);

  // Check if a session time is within 48 hours from now (must be at least 48 hours)
  const isWithin48Hours = (dateISO: string, startTime: string): boolean => {
    try {
      const date = new Date(dateISO);
      const [hours, minutes] = startTime.split(':').map(Number);
      const sessionDateTime = new Date(date);
      sessionDateTime.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now
      
      // Session must be at least 48 hours from now (>=)
      return sessionDateTime <= minBookingTime;
    } catch {
      return false;
    }
  };

  // Get available time options for a specific date (filtering out times within 48 hours)
  const getAvailableTimeOptions = (dateISO: string): string[] => {
    return timeOptions.filter((time) => !isWithin48Hours(dateISO, time));
  };

  // Get a safe default time that's not within 48 hours
  const getDefaultTime = (dateISO: string): string => {
    const availableTimes = getAvailableTimeOptions(dateISO);
    if (availableTimes.length > 0) {
      return availableTimes[0]; // Use first available time
    }
    // Fallback: calculate a time that's at least 48 hours from now
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 48 * 60 * 60 * 1000 + 60 * 60 * 1000); // 49 hours to be safe
    const hours = String(minBookingTime.getHours()).padStart(2, '0');
    const minutes = String(minBookingTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [sessions, setSessions] = useState<
    Record<string, { startTime: string; durationMinutes: number }>
  >(() => {
    const init: Record<string, { startTime: string; durationMinutes: number }> = {};
    selectedDatesISO.forEach((dateISO) => {
      init[dateISO] = { startTime: getDefaultTime(dateISO), durationMinutes: 60 };
    });
    return init;
  });

  const busySessionsForDate = (dateISO: string) => {
    const key = dateISO.split('T')[0];
    return occupiedSessionsByDate[key] || [];
  };

  const parseTimeToMinutes = (time: string) => {
    const [hh, mm] = time.split(':').map((v) => parseInt(v, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  };

  const hasConflictForDate = (dateISO: string, currentSessions: Record<string, { startTime: string; durationMinutes: number }>) => {
    // Sử dụng currentSessions được truyền vào thay vì state `sessions`
    const config = currentSessions[dateISO]; 
    if (!config?.startTime || !config?.durationMinutes) return false;

    const startMinutes = parseTimeToMinutes(config.startTime);
    if (startMinutes === null) return false;
    const endMinutes = startMinutes + config.durationMinutes;

    const busy = busySessionsForDate(dateISO);
    return busy.some((session) => {
      if (!session.scheduledTime) return false;
      const start = new Date(session.scheduledTime);
      
      // 🚨 Chú ý Múi giờ: Đảm bảo getHours/getMinutes là đúng giờ địa phương mong muốn
      const busyStartMinutes = start.getHours() * 60 + start.getMinutes(); 

      let busyEndMinutes: number;
      if (session.endTime) {
        const end = new Date(session.endTime);
        busyEndMinutes = end.getHours() * 60 + end.getMinutes();
      } else if (session.durationMinutes) {
        busyEndMinutes = busyStartMinutes + session.durationMinutes;
      } else {
        busyEndMinutes = busyStartMinutes;
      }

      // Overlap if ranges intersect
      return startMinutes < busyEndMinutes && endMinutes > busyStartMinutes;
    });
  };

  // 1. Tính toán hasAnyConflict bằng cách sử dụng hasConflictForDate với state `sessions` hiện tại
  const hasAnyConflict = useMemo(() => {
    return selectedDatesISO.some((dateISO) => hasConflictForDate(dateISO, sessions));
  }, [selectedDatesISO, sessions]);

  // Check if any session is within 48 hours
  const hasSessionWithin48Hours = useMemo(() => {
    return selectedDatesISO.some((dateISO) => {
      const session = sessions[dateISO];
      if (!session?.startTime) return false;
      return isWithin48Hours(dateISO, session.startTime);
    });
  }, [selectedDatesISO, sessions]);

  const canSubmit =
    !hasAnyConflict &&
    !hasSessionWithin48Hours &&
    selectedDatesISO.every(
      (d) => !!sessions[d]?.startTime && !!sessions[d]?.durationMinutes
    );

  // 2. Sửa lỗi cập nhật state không đồng bộ bằng cách dùng functional update
  const setTime = (dateISO: string, value: string) => {
    setSessions(prevSessions => ({ 
      ...prevSessions, 
      [dateISO]: { ...prevSessions[dateISO], startTime: value } 
    }));
  };

  // 3. Sửa lỗi cập nhật state không đồng bộ bằng cách dùng functional update
  const setDuration = (dateISO: string, value: number) => {
    setSessions(prevSessions => ({
      ...prevSessions,
      [dateISO]: { ...prevSessions[dateISO], durationMinutes: value },
    }));
  };

  const formatTimeRange = (session: OccupiedSession) => {
    if (!session?.scheduledTime) return '';
    const start = new Date(session.scheduledTime);
    const end = session.endTime
      ? new Date(session.endTime)
      : new Date(start.getTime() + (session.durationMinutes || 0) * 60000);
    const format = (date: Date) =>
      date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${format(start)} - ${format(end)}`;
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
          const busySessions = busySessionsForDate(dateISO);
          // Sử dụng hasConflictForDate với state sessions hiện tại
          const hasConflict = hasConflictForDate(dateISO, sessions); 
          return (
            <View key={dateISO} style={styles.card}>
              <Text style={styles.dateLabel}>{formatDateLabel(dateISO)}</Text>

             
                {busySessions.length > 0 && (
                   <View style={styles.busyWrapper}>
                    <Text style={styles.busyLabel}>Khung giờ biên đạo đã bận</Text>
                    {busySessions.map((session, idx) => (
                      <View key={`${session.scheduledTime}-${idx}`} style={styles.busyItem}>
                        <Text style={styles.busyTime}>{formatTimeRange(session)}</Text>
                        {session.sessionNo ? (
                          <Text style={styles.busyMeta}>Buổi #{session.sessionNo}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) }
              

              <View style={styles.row}>
                <View style={styles.dropdownColumn}>
                  <Text style={styles.dropdownLabel}>Giờ bắt đầu</Text>
                  <Dropdown
                    data={getAvailableTimeOptions(dateISO).map((t) => ({ value: t, label: t }))}
                    onChange={(item) => setTime(dateISO, item.value)}
                    placeholder={s.startTime}
                  />
                </View>

                <View style={styles.spacer} />

                <View style={styles.dropdownColumn}>
                  <Text style={styles.dropdownLabel}>Thời lượng</Text>
                  <Dropdown
                    data={durationOptions.map((d) => ({
                      value: String(d),
                      label: `${d} phút`,
                    }))}
                    onChange={(item) => setDuration(dateISO, parseInt(item.value))}
                    placeholder={`${s.durationMinutes} phút`}
                  />
                </View>
              </View>

              {hasConflict && (
                <Text style={styles.conflictText}>
                  Khung giờ này trùng với lịch đã có. Vui lòng chọn khung giờ khác.
                </Text>
              )}
              {isWithin48Hours(dateISO, s.startTime) && (
                <Text style={styles.warningText}>
                  ⚠️ Phải đặt lịch trước ít nhất 48 giờ. Vui lòng chọn giờ muộn hơn.
                </Text>
              )}
            </View>
          );
        })}

        {hasSessionWithin48Hours && (
          <View style={styles.warningCard}>
            <Text style={styles.warningCardText}>
              ⚠️ Một hoặc nhiều buổi tập được đặt trong vòng 48 giờ. Vui lòng chọn thời gian muộn hơn.
            </Text>
          </View>
        )}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            disabled={!canSubmit}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
              Tiếp theo
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
// ... (Styles không thay đổi)
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
  busyWrapper: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  busyLabel: {
    fontSize: 12,
    color: '#B45309',
    marginBottom: 6,
    fontFamily: 'RobotoMono_700Bold',
  },
  busyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  busyTime: {
    fontSize: 13,
    color: '#92400E',
    fontFamily: 'RobotoMono_700Bold',
  },
  busyMeta: {
    fontSize: 12,
    color: '#D97706',
  },
  freeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'RobotoMono_700Bold',
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
    fontFamily: 'RobotoMono_700Bold',
  },
  submitTextDisabled: {
    color: '#9CA3AF',
  },
  submitButtonContainer: {
    marginTop: 16,
    paddingBottom: 40,
  },
  conflictText: {
    marginTop: 8,
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'RobotoMono_400Regular',
  },
  warningText: {
    marginTop: 8,
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'RobotoMono_700Bold',
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningCardText: {
    fontSize: 13,
    color: '#92400E',
    fontFamily: 'RobotoMono_700Bold',
  },
});