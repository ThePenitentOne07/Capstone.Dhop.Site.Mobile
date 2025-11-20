import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createBookingFeedback } from "../service/api";
import { useAppModal } from "../hooks/useAppModal";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function BookingFeedback() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const { showModal, modal } = useAppModal();
  const normalizedBookingId = useMemo(() => {
    if (typeof bookingId === "string") return Number(bookingId);
    if (Array.isArray(bookingId)) return Number(bookingId[0]);
    return NaN;
  }, [bookingId]);

  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!normalizedBookingId || Number.isNaN(normalizedBookingId)) {
      setError("Không tìm thấy mã đặt lịch.");
      return;
    }
    if (!selectedRating) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }
    if (!comment.trim()) {
      setError("Vui lòng nhập nhận xét.");
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await createBookingFeedback({
        bookingId: normalizedBookingId,
        rating: selectedRating,
        comment: comment.trim(),
      });
      setSuccess(true);
      showModal({
        title: "Cảm ơn bạn!",
        message: "Đánh giá đã được gửi thành công.",
        status: "success",
        buttons: [
          {
            text: "OK",
            variant: "primary",
            onPress: () => router.back(),
          },
        ],
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể gửi đánh giá. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Đánh giá biên đạo</Text>
        <Text style={styles.subtitle}>
          Đánh giá của bạn giúp chúng tôi cải thiện chất lượng dịch vụ.
        </Text>

        <Text style={styles.sectionLabel}>Chọn số sao</Text>
        <View style={styles.ratingRow}>
          {RATING_OPTIONS.map((value) => {
            const active = selectedRating !== null && value <= selectedRating;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.starButton, active && styles.starButtonActive]}
                onPress={() => setSelectedRating(value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.starText, active && styles.starTextActive]}>
                  ★
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Nhận xét</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? (
          <Text style={styles.successText}>Bạn đã gửi đánh giá thành công.</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.9}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Gửi đánh giá</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      {modal}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#222",
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  starButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  starButtonActive: {
    backgroundColor: "#FF7A00",
  },
  starText: {
    fontSize: 24,
    color: "#FF7A00",
  },
  starTextActive: {
    color: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111",
    minHeight: 140,
    marginBottom: 12,
  },
  errorText: {
    color: "#D80032",
    marginBottom: 8,
  },
  successText: {
    color: "#0F9D58",
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

