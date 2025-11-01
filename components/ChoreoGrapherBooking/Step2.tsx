import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

interface Step2Props {
  numberOfDays: number;
  onNext: (selectedDatesISO: string[]) => void;
}

function getDaysInMonth(year: number, monthIndex0: number) {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function getWeekdayIndex(year: number, monthIndex0: number, day: number) {
  // 0 = Sunday, 1 = Monday, ...
  return new Date(year, monthIndex0, day).getDay();
}

export default function Step2({ numberOfDays, onNext }: Step2Props) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState<number>(today.getMonth());
  const [visibleYear, setVisibleYear] = useState<number>(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

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

  const isPast = (date: Date) => {
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return startOfDate < startOfToday;
  };

  const handlePrevMonth = () => {
    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear(visibleYear - 1);
    } else {
      setVisibleMonth(visibleMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear(visibleYear + 1);
    } else {
      setVisibleMonth(visibleMonth + 1);
    }
  };

  const sameDay = (a: Date, b: Date) => (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );

  const handleSelectDate = (date: Date) => {
    if (isPast(date)) return;
    const exists = selectedDates.find(d => sameDay(d, date));
    if (exists) {
      setSelectedDates(selectedDates.filter(d => !sameDay(d, date)));
      return;
    }
    if (selectedDates.length >= numberOfDays) return;
    setSelectedDates([...selectedDates, date]);
  };

  const canProceed = selectedDates.length === numberOfDays;
  const selectedDatesISO = selectedDates
    .slice()
    .sort((a, b) => a.getTime() - b.getTime())
    .map(d => d.toISOString());

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chọn ngày</Text>
        <Text style={styles.subtitle}>Chọn {numberOfDays} ngày riêng lẻ để đặt lịch</Text>
      </View>

      <Animated.View entering={FadeInUp.delay(100)} style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
            <Text style={styles.navText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(visibleYear, visibleMonth, 1))}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
            <Text style={styles.navText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdayRow}>
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((wd) => (
            <Text key={wd} style={styles.weekdayText}>{wd}</Text>
          ))}
        </View>

        {monthMatrix.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.weekRow}>
            {row.map((cell, colIdx) => {
              if (!cell) return <View key={colIdx} style={styles.dayCellEmpty} />;
              const disabled = isPast(cell);
              const isSelected = selectedDates.some(d => sameDay(d, cell));
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected, disabled && styles.dayCellDisabled]}
                  onPress={() => handleSelectDate(cell)}
                  activeOpacity={disabled ? 1 : 0.7}
                  disabled={disabled}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected, disabled && styles.dayTextDisabled]}>
                    {cell.getDate()}
                  </Text>
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
            .map(d => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }))
            .join('  •  ')}
        </Text>
        {!canProceed && (
          <Text style={styles.selectionHint}>Chọn thêm {Math.max(0, numberOfDays - selectedDates.length)} ngày</Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.nextButtonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={() => onNext(selectedDatesISO)}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>Tiếp theo</Text>
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
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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


