import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { getChoreographyFeedbacks } from "../../service/api";

interface CommentSectionProps {
  choreographyId: string;
  avgRating?: number | null;
}

interface FeedbackItem {
  id: number;
  comment: string;
  rating: number;
  fromUser: string;
  createdAt: string;
}

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

export default function CommentSection({ choreographyId, avgRating }: CommentSectionProps) {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [average, setAverage] = useState<number | null>(avgRating ?? null);
  const ratingLabel = useMemo(() => {
    if (average === null || average === undefined) return "";
    return `${average.toFixed(1)} / 5`;
  }, [average]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!choreographyId) {
        setError("Không tìm thấy thông tin biên đạo");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data } = await getChoreographyFeedbacks(choreographyId, 1, 2);
        setFeedbacks(data?.items || []);
        setAverage(data?.avgRating ?? avgRating ?? null);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không thể tải đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [choreographyId, avgRating]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Đánh giá</Text>
        <View style={styles.headerRight}>
          {!!ratingLabel && <Text style={styles.ratingLabel}>⭐ {ratingLabel}</Text>}
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={() =>
              router.push({
                pathname: "/CommentScreen",
                // keep both keys to satisfy the navigation request
                params: { choreographyId, choreographID: choreographyId },
              })
            }
          >
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color="#FF7A00" />
          <Text style={styles.subtleText}>Đang tải đánh giá...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && feedbacks.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.subtleText}>Chưa có đánh giá nào.</Text>
        </View>
      )}

      {!loading &&
        !error &&
        feedbacks.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.userName}>{item.fromUser || "Người dùng"}</Text>
              <Text style={styles.rating}>⭐ {item.rating}</Text>
            </View>
            <Text style={styles.comment}>{item.comment}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    color: "#1F2937",
    fontFamily: "RobotoMono_700Bold",
  },
  ratingLabel: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: "RobotoMono_700Bold",
  },
  seeAll: {
    fontSize: 14,
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
  },
  centered: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  subtleText: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "RobotoMono_400Regular",
  },
  errorText: {
    color: "#C92A2A",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "RobotoMono_700Bold",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: {
    fontSize: 15,
    color: "#111827",
    fontFamily: "RobotoMono_700Bold",
  },
  rating: {
    fontSize: 14,
    color: "#F59E0B",
    fontFamily: "RobotoMono_700Bold",
  },
  comment: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
    fontFamily: "RobotoMono_400Regular",
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "RobotoMono_400Regular",
  },
});

