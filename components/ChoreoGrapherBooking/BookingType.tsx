import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

export type BookingNature = "STANDARD" | "URGENT";
export type ProviderType = "CHOREOGRAPHER" | "DANCER";

interface BookingTypeProps {
  providerType?: ProviderType;
  defaultValue?: BookingNature;
  onNext: (value: BookingNature) => void;
}

export default function BookingType({
  providerType = "CHOREOGRAPHER",
  defaultValue = "STANDARD",
  onNext,
}: BookingTypeProps) {
  const [selected, setSelected] = useState<BookingNature>(defaultValue);

  const isDancer = providerType === "DANCER";

  const standardDesc = isDancer
    ? "Đặt lịch tiêu chuẩn cần trước ít nhất 7 ngày"
    : "Buổi tập đầu tiên phải sau ít nhất 7 ngày. Các buổi tiếp theo cách nhau tối đa 7 ngày.";

  const standardNote = isDancer
    ? "Thời gian biểu diễn phải sau ít nhất 7 ngày kể từ hiện tại."
    : "Buổi tập đầu tiên phải sau ít nhất 7 ngày. Các buổi tiếp theo cách nhau tối đa 7 ngày.";

  const urgentDesc = isDancer
    ? "Đặt lịch khẩn cấp cần trước ít nhất 16 tiếng"
    : "Buổi tập đầu tiên phải trong khoảng 16-48 tiếng. Các buổi tiếp theo cách nhau tối đa 7 ngày.";

  const urgentNote = isDancer
    ? "Thời gian biểu diễn phải sau ít nhất 16 giờ kề từ hiện tại."
    : "Buổi tập đầu tiên phải trong khoảng 16-48 giờ. Các buổi tiếp theo cách nhau tối đa 7 ngày.";

  const handleSelect = (value: BookingNature) => {
    setSelected(value);
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chọn loại đặt lịch</Text>
        <Text style={styles.subtitle}>
          Vui lòng chọn loại đặt lịch phù hợp với nhu cầu của bạn
        </Text>
      </View>

      <View style={styles.cardStack}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleSelect("STANDARD")}
          style={[
            styles.card,
            styles.standardCard,
            selected === "STANDARD" && styles.cardSelected,
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.radio,
                selected === "STANDARD" && styles.radioSelected,
              ]}
            >
              {selected === "STANDARD" && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.cardTitle, styles.standardTitle]}>
              Đặt lịch tiêu chuẩn
            </Text>
          </View>
          <Text style={styles.cardDescription}>{standardDesc}</Text>
          <View style={[styles.note, styles.standardNote]}>
            <Text style={styles.noteLabel}>Lưu ý:</Text>
            <Text style={styles.noteText}>{standardNote}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleSelect("URGENT")}
          style={[
            styles.card,
            styles.urgentCard,
            selected === "URGENT" && styles.cardSelected,
          ]}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.radio,
                selected === "URGENT" && styles.radioSelected,
              ]}
            >
              {selected === "URGENT" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.cardTitle}>Đặt lịch khẩn cấp</Text>
          </View>
          <Text style={styles.cardDescription}>{urgentDesc}</Text>
          <View style={[styles.note, styles.urgentNote]}>
            <Text style={styles.noteLabel}>Lưu ý:</Text>
            <Text style={styles.noteText}>{urgentNote}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        activeOpacity={0.85}
        onPress={() => onNext(selected)}
      >
        <Text style={styles.nextText}>Tiếp tục</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#0F172A",
    fontFamily: "RobotoMono_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "RobotoMono_400Regular",
  },
  cardStack: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  cardSelected: {
    shadowColor: "#FF7A00",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  standardCard: {
    borderColor: "#22C55E",
    backgroundColor: "#ECFDF3",
  },
  urgentCard: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioSelected: {
    borderColor: "#22C55E",
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
  },
  cardTitle: {
    fontSize: 18,
    color: "#0F172A",
    fontFamily: "RobotoMono_700Bold",
  },
  standardTitle: {
    color: "#15803D",
  },
  cardDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: "RobotoMono_400Regular",
  },
  note: {
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  standardNote: {
    backgroundColor: "#D1FAE5",
  },
  urgentNote: {
    backgroundColor: "#EEF2FF",
  },
  noteLabel: {
    fontSize: 13,
    color: "#0F172A",
    fontFamily: "RobotoMono_700Bold",
  },
  noteText: {
    fontSize: 13,
    color: "#111827",
    lineHeight: 18,
    fontFamily: "RobotoMono_400Regular",
  },
  nextButton: {
    marginTop: 24,
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
});

