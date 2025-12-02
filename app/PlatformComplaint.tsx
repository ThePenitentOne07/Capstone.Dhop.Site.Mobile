import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { getUserComplaints, UserComplaintItem } from '../service/api';
import { useRefetchOnFocus } from './hooks/useRefetchOnFocus';

const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

export default function PlatformComplaint() {
  const [complaints, setComplaints] = useState<UserComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await getUserComplaints();
        const payload = res?.data;
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setComplaints(items);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách khiếu nại');
        setComplaints([]);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadComplaints({ silent: true });
    setRefreshing(false);
  }, [loadComplaints]);

  const refetchOnFocus = useCallback(() => {
    return loadComplaints({ silent: true });
  }, [loadComplaints]);

  useRefetchOnFocus(refetchOnFocus);

  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
  }, [complaints]);

  const stateContent = useMemo(() => {
    if (loading && !sortedComplaints.length) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={ORANGE2} />
          <Text style={styles.stateMessage}>Đang tải danh sách khiếu nại...</Text>
        </View>
      );
    }

    if (error && !sortedComplaints.length) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateMessage}>{error}</Text>
          <Text style={[styles.stateMessage, { marginTop: 8 }]}>Vuốt xuống để thử tải lại.</Text>
        </View>
      );
    }

    if (!sortedComplaints.length) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateMessage}>Bạn chưa có khiếu nại nào.</Text>
        </View>
      );
    }

    return null;
  }, [sortedComplaints.length, error, loading]);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Khiếu nại đơn đặt',
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontFamily: "RobotoMono_700Bold",
          }
        }} 
      />
      {stateContent && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ORANGE2} />}
        >
          {stateContent}
        </ScrollView>
      )}
      {!stateContent && (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ORANGE2} />}
        >
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}
          {sortedComplaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function ComplaintCard({ complaint }: { complaint: UserComplaintItem }) {
  const {
    bookingId,
    complainTypeName,
    complainTypeDescription,
    content,
    statusName,
    statusCode,
    evidenceUrls,
    createdAt,
    updatedAt,
  } = complaint;

  const colorSet = getStatusColors(statusCode);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Mã đơn: {bookingId}</Text>
          <Text style={styles.cardSubtitle}>{complainTypeDescription}</Text>
        </View>
       
      </View>
      <View style={[styles.statusChip, { backgroundColor: colorSet.bg }]}>
          <Text style={[styles.statusChipText, { color: colorSet.text }]}>{statusName}</Text>
        </View>

      {/* {complainTypeDescription ? (
        <Text style={styles.descriptionLabel}>Loại: {complainTypeDescription}</Text>
      ) : null} */}

      <Text style={styles.contentText}>{content || 'Không có mô tả'}</Text>

      <View style={styles.timestampRow}>
        <Text style={styles.timestampText}>Tạo lúc: {formatDate(createdAt)}</Text>
        
      </View>
      <View style={styles.timestampRow}>
      <Text style={styles.timestampText}>Cập nhật: {formatDate(updatedAt)}</Text>
        
      </View>

      

      {Array.isArray(evidenceUrls) && evidenceUrls.length > 0 && (
        <View style={styles.evidenceBlock}>
          <Text style={styles.evidenceTitle}>Ảnh minh chứng</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {evidenceUrls.map((url, idx) => (
              <Image key={`${complaint.id}-${idx}-${url}`} source={{ uri: url }} style={styles.evidenceImage} />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function formatDate(value?: string) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

function getStatusColors(statusCode?: string) {
  if (!statusCode) {
    return { bg: '#F3F4F6', text: '#111827' };
  }
  if (/RESOLVED|SUCCESS|DONE/i.test(statusCode)) {
    return { bg: '#DCFCE7', text: '#15803D' };
  }
  if (/REJECT|DENIED/i.test(statusCode)) {
    return { bg: '#FEE2E2', text: '#B91C1C' };
  }
  return { bg: '#FEF3C7', text: '#B45309' };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    flexGrow: 1,
  },
  errorBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#B45309',
    fontFamily: 'RobotoMono_700Bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
    marginTop: 2,
  },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start'
  },
  statusChipText: {
    fontSize: 12,
    fontFamily: 'RobotoMono_700Bold',
  },
  descriptionLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
    marginBottom: 6,
  },
  contentText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'RobotoMono_400Regular',
    marginBottom: 10,
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timestampText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
  },
  evidenceBlock: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  evidenceTitle: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'RobotoMono_700Bold',
    marginBottom: 8,
  },
  evidenceImage: {
    width: 96,
    height: 96,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    paddingHorizontal: 24,
  },
  stateMessage: {
    marginTop: 12,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 15,
    fontFamily: 'RobotoMono_400Regular',
  },
});

