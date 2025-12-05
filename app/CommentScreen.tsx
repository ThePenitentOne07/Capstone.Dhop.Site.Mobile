import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getChoreographyFeedbacks, ChoreographyFeedbackItem } from "../service/api";

const PAGE_SIZE = 10;

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

export default function CommentScreen() {
  const router = useRouter();
  const { choreographyId, choreographID } = useLocalSearchParams();
  const resolvedId = useMemo(
    () => (choreographyId || choreographID || "") as string,
    [choreographyId, choreographID]
  );

  const [pageNo, setPageNo] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [comments, setComments] = useState<ChoreographyFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  const fetchComments = useCallback(
    async (page: number, append = false) => {
      if (!resolvedId) {
        setError("Không tìm thấy thông tin biên đạo");
        setLoading(false);
        return;
      }
      try {
        if (page === 1 && !append) setLoading(true);
        if (page > 1) setLoadingMore(true);
        setError(null);
        const { data } = await getChoreographyFeedbacks(resolvedId, page, PAGE_SIZE);
        setAvgRating(data?.avgRating ?? null);
        setTotalPage(data?.totalPage ?? 1);
        setPageNo(data?.pageNo ?? page);
        setComments((prev) => (append ? [...prev, ...(data?.items || [])] : data?.items || []));
      } catch (err: any) {
        const message = err?.response?.data?.message || "Không thể tải đánh giá";
        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [resolvedId]
  );

  useEffect(() => {
    fetchComments(1, false);
  }, [fetchComments, resolvedId]);

  const handleLoadMore = () => {
    if (loadingMore || loading || pageNo >= totalPage) return;
    fetchComments(pageNo + 1, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComments(1, false);
  };

  const headerTitle = useMemo(() => {
    if (avgRating === null || avgRating === undefined) return "Đánh giá";
    return `Đánh giá (⭐ ${avgRating.toFixed(1)})`;
  }, [avgRating]);

  const renderItem = ({ item }: { item: ChoreographyFeedbackItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.fromUser || "Người dùng"}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{headerTitle}</Text>
        <Text style={styles.backLink} onPress={() => router.back()}>
          Đóng
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#FF7A00" />
          <Text style={styles.subtleText}>Đang tải đánh giá...</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retry} onPress={() => fetchComments(1, false)}>
            Thử lại
          </Text>
        </View>
      ) : null}

      {!loading && !error && comments.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.subtleText}>Chưa có đánh giá nào.</Text>
        </View>
      ) : null}

      {!error && (
        <FlatList
          data={comments}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color="#FF7A00" />
                <Text style={styles.subtleText}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: "#1F2937",
    fontFamily: "RobotoMono_700Bold",
  },
  backLink: {
    fontSize: 14,
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
  },
  centered: {
    alignItems: "center",
    paddingVertical: 20,
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
  retry: {
    marginTop: 6,
    color: "#FF7A00",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
  listContent: {
    paddingBottom: 24,
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
  footer: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
});


