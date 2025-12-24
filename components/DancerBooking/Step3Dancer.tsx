import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Dropdown from '../common/Dropdown';
import type { OccupiedSession } from './Step1Date';

interface Step3DancerProps {
  selectedDatesISO: string[];
  occupiedSessionsByDate?: Record<string, OccupiedSession[]>;
  bookingNature?: 'STANDARD' | 'URGENT';
  onSubmit: (sessions: { dateISO: string; startTime: string; durationMinutes: number }[]) => void;
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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

// At most 4-hour sessions for dancer booking when using start/end
const MAX_SESSION_MINUTES = 4 * 60;

export default function Step3Dancer({
  selectedDatesISO,
  occupiedSessionsByDate = {},
  bookingNature = 'STANDARD',
  onSubmit,
}: Step3DancerProps) {
  const timeOptions = useMemo(() => generateTimeOptions(), []);
  const minBookingTime = useMemo(() => new Date(Date.now() + 48 * 60 * 60 * 1000), []);

  const isWithin48Hours = (dateISO: string, startTime: string): boolean => {
    try {
      const date = new Date(dateISO);
      const [hours, minutes] = startTime.split(':').map(Number);
      const sessionDateTime = new Date(date);
      sessionDateTime.setHours(hours, minutes, 0, 0);

      return sessionDateTime <= minBookingTime;
    } catch {
      return false;
    }
  };

  const getAvailableTimeOptions = (dateISO: string): string[] => {
    if (bookingNature === 'URGENT') {
      return timeOptions.filter((time) => isWithin48Hours(dateISO, time));
    }
    return timeOptions.filter((time) => !isWithin48Hours(dateISO, time));
  };

  const getDefaultStartTime = (dateISO: string): string => {
    const availableTimes = getAvailableTimeOptions(dateISO);
    if (availableTimes.length > 0) {
      return availableTimes[0];
    }
    const now = new Date();
    const minBooking = new Date(now.getTime() + 48 * 60 * 60 * 1000 + 60 * 60 * 1000);
    const hours = String(minBooking.getHours()).padStart(2, '0');
    const minutes = String(minBooking.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const parseTimeToMinutes = (time: string) => {
    const [hh, mm] = time.split(':').map((v) => parseInt(v, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  };

  // For end time options we only allow times strictly after start time
  const getEndTimeOptions = (dateISO: string, startTime: string | undefined): string[] => {
    if (!startTime) return [];
    const startMinutes = parseTimeToMinutes(startTime);
    if (startMinutes == null) return [];

    return timeOptions.filter((time) => {
      const minutes = parseTimeToMinutes(time);
      if (minutes == null) return false;
      const diff = minutes - startMinutes;
      return diff > 0 && diff <= MAX_SESSION_MINUTES;
    });
  };

  const [sessions, setSessions] = useState<
    Record<string, { startTime: string; endTime: string }>
  >(() => {
    const init: Record<string, { startTime: string; endTime: string }> = {};
    selectedDatesISO.forEach((dateISO) => {
      const startTime = getDefaultStartTime(dateISO);
      const endOptions = getEndTimeOptions(dateISO, startTime);
      const endTime = endOptions[0] || startTime;
      init[dateISO] = { startTime, endTime };
    });
    return init;
  });

  const busySessionsForDate = (dateISO: string) => {
    const key = dateISO.split('T')[0];
    return occupiedSessionsByDate[key] || [];
  };

  const hasConflictForDate = (
    dateISO: string,
    currentSessions: Record<string, { startTime: string; endTime: string }>
  ) => {
    const config = currentSessions[dateISO];
    if (!config?.startTime || !config?.endTime) return false;

    const startMinutes = parseTimeToMinutes(config.startTime);
    const endMinutes = parseTimeToMinutes(config.endTime);
    if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) return false;

    const busy = busySessionsForDate(dateISO);
    return busy.some((session) => {
      if (!session.scheduledTime) return false;
      const start = new Date(session.scheduledTime);
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

      return startMinutes < busyEndMinutes && endMinutes > busyStartMinutes;
    });
  };

  const hasAnyConflict = useMemo(() => {
    return selectedDatesISO.some((dateISO) => hasConflictForDate(dateISO, sessions));
  }, [selectedDatesISO, sessions]);

  const hasSessionWithin48Hours = useMemo(() => {
    return selectedDatesISO.some((dateISO) => {
      const session = sessions[dateISO];
      if (!session?.startTime) return false;
      return isWithin48Hours(dateISO, session.startTime);
    });
  }, [selectedDatesISO, sessions]);

  const isEndBeforeStartForAny = useMemo(() => {
    return selectedDatesISO.some((dateISO) => {
      const s = sessions[dateISO];
      if (!s?.startTime || !s?.endTime) return true;
      const startMinutes = parseTimeToMinutes(s.startTime);
      const endMinutes = parseTimeToMinutes(s.endTime);
      return (
        startMinutes == null ||
        endMinutes == null ||
        endMinutes <= startMinutes ||
        endMinutes - startMinutes > MAX_SESSION_MINUTES
      );
    });
  }, [selectedDatesISO, sessions]);

  const standardInvalid = bookingNature === 'STANDARD' && hasSessionWithin48Hours;
  const urgentInvalid = bookingNature === 'URGENT' && !hasSessionWithin48Hours;

  const canSubmit =
    !hasAnyConflict &&
    !isEndBeforeStartForAny &&
    !standardInvalid &&
    !urgentInvalid &&
    selectedDatesISO.every(
      (d) => !!sessions[d]?.startTime && !!sessions[d]?.endTime
    );

  const setStartTime = (dateISO: string, value: string) => {
    setSessions((prev) => {
      const current = prev[dateISO] || { startTime: value, endTime: value };
      const updatedStart = value;
      const endOptions = getEndTimeOptions(dateISO, updatedStart);
      let updatedEnd = current.endTime;
      const valid = endOptions.includes(updatedEnd);
      if (!valid) {
        updatedEnd = endOptions[0] || updatedStart;
      }
      return {
        ...prev,
        [dateISO]: { startTime: updatedStart, endTime: updatedEnd },
      };
    });
  };

  const setEndTime = (dateISO: string, value: string) => {
    setSessions((prev) => ({
      ...prev,
      [dateISO]: { ...prev[dateISO], endTime: value },
    }));
  };

  const formatTimeRange = (session: OccupiedSession) => {
    if (!session?.scheduledTime) return '';
    const start = new Date(session.scheduledTime);
    const end = session.endTime
      ? new Date(session.endTime)
      : new Date(start.getTime() + (session.durationMinutes || 0) * 60000);
    const format = (date: Date) =>
      date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    return `${format(start)} - ${format(end)}`;
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const result = selectedDatesISO.map((dateISO) => {
      const s = sessions[dateISO];
      const startMinutes = parseTimeToMinutes(s.startTime) || 0;
      const endMinutes = parseTimeToMinutes(s.endTime) || startMinutes;
      const durationMinutes = endMinutes - startMinutes;
      return {
        dateISO,
        startTime: s.startTime,
        durationMinutes,
      };
    });
    onSubmit(result);
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {selectedDatesISO.map((dateISO) => {
          const s = sessions[dateISO];
          const busySessions = busySessionsForDate(dateISO);
          const hasConflict = hasConflictForDate(dateISO, sessions);
          const endOptions = getEndTimeOptions(dateISO, s?.startTime);

          return (
            <View key={dateISO} style={styles.card}>
              <Text style={styles.dateLabel}>{formatDateLabel(dateISO)}</Text>

              {busySessions.length > 0 && (
                <View style={styles.busyWrapper}>
                  <Text style={styles.busyLabel}>Khung giờ nhóm nhảy đã bận</Text>
                  {busySessions.map((session, idx) => (
                    <View
                      key={`${session.scheduledTime}-${idx}`}
                      style={styles.busyItem}
                    >
                      <Text style={styles.busyTime}>{formatTimeRange(session)}</Text>
                      {session.sessionNo ? (
                        <Text style={styles.busyMeta}>Buổi #{session.sessionNo}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.row}>
                <View style={styles.dropdownColumn}>
                  <Text style={styles.dropdownLabel}>Giờ bắt đầu</Text>
                  <Dropdown
                    data={getAvailableTimeOptions(dateISO).map((t) => ({
                      value: t,
                      label: t,
                    }))}
                    onChange={(item) => setStartTime(dateISO, item.value)}
                    placeholder={s?.startTime}
                  />
                </View>

                <View style={styles.spacer} />

                <View style={styles.dropdownColumn}>
                  <Text style={styles.dropdownLabel}>Giờ kết thúc</Text>
                  <Dropdown
                    data={endOptions.map((t) => ({
                      value: t,
                      label: t,
                    }))}
                    onChange={(item) => setEndTime(dateISO, item.value)}
                    placeholder={s?.endTime || 'Chọn giờ kết thúc'}
                  />
                </View>
              </View>

              {hasConflict && (
                <Text style={styles.conflictText}>
                  Khung giờ này trùng với lịch đã có. Vui lòng chọn khung giờ khác.
                </Text>
              )}
              {bookingNature === 'STANDARD' && s?.startTime && isWithin48Hours(dateISO, s.startTime) && (
                <Text style={styles.warningText}>
                  ⚠️ Phải đặt lịch trước ít nhất 48 giờ. Vui lòng chọn giờ muộn hơn.
                </Text>
              )}
            </View>
          );
        })}

        {bookingNature === 'STANDARD' && hasSessionWithin48Hours && (
          <View style={styles.warningCard}>
            <Text style={styles.warningCardText}>
              ⚠️ Một hoặc nhiều buổi tập được đặt trong vòng 48 giờ. Vui lòng chọn thời gian muộn hơn.
            </Text>
          </View>
        )}
        {bookingNature === 'URGENT' && !hasSessionWithin48Hours && (
          <View style={styles.warningCard}>
            <Text style={styles.warningCardText}>
              ⚠️ Buổi diễn phải nằm trong 48 giờ tới.
            </Text>
          </View>
        )}

        {isEndBeforeStartForAny && (
          <View style={styles.warningCard}>
            <Text style={styles.warningCardText}>
              ⚠️ Giờ kết thúc phải sau giờ bắt đầu và tối đa {MAX_SESSION_MINUTES} phút cho mỗi buổi.
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


