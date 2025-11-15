import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { getChoreographySchedule } from '../../service/api';

interface Step2Props {
  choreographerId: string;
  numberOfDays: number;
  onNext: (selectedDatesISO: string[]) => void;
}

interface ChoreographyScheduleItem {
  id: number;
  scheduledTime: string;
  durationMinutes: number;
  endTime: string;
  sessionNo: number;
  statusName: string;
}

function getDaysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function getWeekdayIndex(year: number, monthIndex0: number, day: number) {
  // 0 = Sunday, 1 = Monday, ...
  return new Date(year, monthIndex0, day).getDay();
}

function formatDateKey(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function Step2({ choreographerId, numberOfDays, onNext }: Step2Props) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState<number>(today.getMonth());
  const [visibleYear, setVisibleYear] = useState<number>(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, number>>({});
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const monthMatrix = useMemo(() => {
    const daysInMonth = getDaysInMonth(visibleYear, visibleMonth);
    const firstWeekday = getWeekdayIndex(visibleYear, visibleMonth, 1);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(visibleYear, visibleMonth, d));
    while (cells.length < 42) cells.push(null);
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < 42; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [visibleMonth, visibleYear]);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!choreographerId) {
        setSessionsByDate({});
        return;
      }

      const monthStart = new Date(visibleYear, visibleMonth, 1);
      const monthEnd = new Date(visibleYear, visibleMonth + 1, 0);
      const startTime = formatDateKey(monthStart);
      const endTime = formatDateKey(monthEnd);

      try {
        setSessionsError(null);
        const response = await getChoreographySchedule({
          id: choreographerId,
          startTime,
          endTime,
        });
        const items: ChoreographyScheduleItem[] = Array.isArray(response.data)
          ? response.data
          : [];
        const grouped = items.reduce<Record<string, number>>((acc, session) => {
          if (!session?.scheduledTime) return acc;
          const key = session.scheduledTime.split('T')[0];
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        console.log('Fetched schedule sessions:', {
          choreographerId,
          startTime,
          endTime,
          grouped,
        });
        setSessionsByDate(grouped);
      } catch (error) {
        console.error('Failed to fetch choreography schedule:', error);
        setSessionsByDate({});
        setSessionsError('Không thể tải lịch. Vui lòng thử lại.');
      }
    };

    fetchSchedule();
  }, [choreographerId, visibleMonth, visibleYear]);

  const isPast = (date: Date) => {
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return startOfDate < startOfToday;
  };

  const handlePrevMonth = () => {
    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear((year) => year - 1);
    } else {
      setVisibleMonth((month) => month - 1);
    }
  };

  const handleNextMonth = () => {
    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear((year) => year + 1);
    } else {
      setVisibleMonth((month) => month + 1);
    }
  };

  const sameDay = (a: Date, b: Date) => (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );

  const handleSelectDate = (date: Date) => {
    if (isPast(date)) return;
    const exists = selectedDates.find((d) => sameDay(d, date));
    if (exists) {
      setSelectedDates(selectedDates.filter((d) => !sameDay(d, date)));
      return;
    }
    if (selectedDates.length >= numberOfDays) return;
    setSelectedDates([...selectedDates, date]);
  };

  const canProceed = selectedDates.length === numberOfDays;
  const selectedDatesISO = selectedDates
    .slice()
    .sort((a, b) => a.getTime() - b.getTime())
    .map((d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString());

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chọn ngày</Text>
        <Text style={styles.subtitle}>Chọn {numberOfDays} ngày riêng lẻ để đặt lịch</Text>
        {sessionsError ? <Text style={styles.errorText}>{sessionsError}</Text> : null}
      </View>

      <Animated.View entering={FadeInUp.delay(100)} style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
            <Text style={styles.navText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
              new Date(visibleYear, visibleMonth, 1)
            )}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
            <Text style={styles.navText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((wd) => (
            <Text key={wd} style={styles.weekdayText}>
              {wd}
            </Text>
          ))}
        </View>
        <Text style={styles.sessionLegend}>
          Số trong vòng tròn thể số buổi tập mà biên đạo đang có trong hôm đó 
        </Text>

        {monthMatrix.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.weekRow}>
            {row.map((cell, colIdx) => {
              if (!cell) return <View key={colIdx} style={styles.dayCellEmpty} />;
              const disabled = isPast(cell);
              const isSelected = selectedDates.some((d) => sameDay(d, cell));
              const dateKey = formatDateKey(cell);
              const sessionCount = sessionsByDate[dateKey] ?? 0;

              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    disabled && styles.dayCellDisabled,
                  ]}
                  onPress={() => handleSelectDate(cell)}
                  activeOpacity={disabled ? 1 : 0.7}
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      disabled && styles.dayTextDisabled,
                    ]}
                  >
                    {cell.getDate()}
                  </Text>
                  {sessionCount > 0 ? (
                    <View
                      style={[
                        styles.sessionBadge,
                        isSelected && styles.sessionBadgeSelected,
                        disabled && styles.sessionBadgeDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sessionBadgeText,
                          isSelected && styles.sessionBadgeTextSelected,
                          disabled && styles.sessionBadgeTextDisabled,
                        ]}
                      >
                        {sessionCount}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.sessionBadgePlaceholder} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInRight.delay(150)} style={styles.selectionCard}>
        <Text style={styles.selectionLabel}>Ngày đã chọn ({selectedDates.length}/{numberOfDays})</Text>
        <Text style={styles.selectionValue}>
          {selectedDates
            .slice()
            .sort((a, b) => a.getTime() - b.getTime())
            .map((d) =>
              d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
            )
            .join('  •  ')}
        </Text>
        {!canProceed && (
          <Text style={styles.selectionHint}>
            Chọn thêm {Math.max(0, numberOfDays - selectedDates.length)} ngày
          </Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.nextButtonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={() => onNext(selectedDatesISO)}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>
            Tiếp theo
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#DC2626',
  },
  calendarCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
  },
  navText: {
    fontSize: 18,
    color: '#1F2937',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dayCellEmpty: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingTop: 4,
    paddingBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  dayCellDisabled: {
    backgroundColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dayTextDisabled: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  sessionLegend: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  sessionBadge: {
    marginTop: 6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sessionBadgePlaceholder: {
    marginTop: 6,
    height: 22,
  },
  sessionBadgeSelected: {
    backgroundColor: '#FF9F43',
  },
  sessionBadgeDisabled: {
    backgroundColor: '#E5E7EB',
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F97316',
  },
  sessionBadgeTextSelected: {
    color: '#FFFFFF',
  },
  sessionBadgeTextDisabled: {
    color: '#6B7280',
  },
  selectionCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  selectionLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  selectionValue: {
    fontSize: 16,
    color: '#78350F',
    fontWeight: '800',
  },
  selectionHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#92400E',
  },
  nextButtonContainer: {
    marginTop: 16,
    paddingBottom: 40,
  },
  nextButton: {
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
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});


