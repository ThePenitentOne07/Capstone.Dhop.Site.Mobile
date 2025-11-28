import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNotificationStore } from '../states/notificationStore';
import type { Notification } from '../states/notificationStore';
import { getNotifications, markNotificationAsRead as markNotificationAsReadApi, markAllNotificationsAsRead } from '../service/api';

const ORANGE2 = '#FF7A00';

export default function NotificationList() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, setNotifications } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const normalizeType = (type: string | undefined): Notification['type'] => {
    if (type === 'success' || type === 'warning' || type === 'error') {
      return type;
    }
    return 'info';
  };

  const fetchNotifications = useCallback(
    async (opts: { usePullToRefresh?: boolean } = {}) => {
      const { usePullToRefresh } = opts;
      if (usePullToRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const response = await getNotifications();
        const serverItems = response.data?.items ?? [];
        console.log("notfications", serverItems);
        
        const normalized = serverItems.map<Notification>((item) => ({
          id: item.id,
          title: item.title ?? 'Notification',
          message: item.message ?? '',
          type: normalizeType(item.type),
          timestamp: new Date(item.createdAt),
          read: !!item.read,
          data: {
            link: item.link,
            userUUID: item.userUUID,
          },
        }));
        setNotifications(normalized);
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        setErrorMessage(
          error?.response?.data?.message || error?.message || 'Không thể tải thông báo'
        );
      } finally {
        if (usePullToRefresh) {
          setRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [setNotifications]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    fetchNotifications({ usePullToRefresh: true });
  };

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (!notification.read) {
        markAsRead(notification.id);
        try {
          await markNotificationAsReadApi(notification.id);
        } catch (err) {
          console.error('Failed to mark notification as read:', err);
        }
      }
      // TODO: Navigate to relevant screen based on notification.data
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    markAllAsRead();
    setIsMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  }, [markAllAsRead, unreadCount]);

  const handleDeleteNotification = (id: string) => {
    removeNotification(id);
  };

  const formatDate = (date: Date) => {
    try {
      const now = new Date();
      const notificationDate = new Date(date);
      
      if (isNaN(notificationDate.getTime())) {
        return '';
      }

      const diffTime = now.getTime() - notificationDate.getTime();
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return 'Vừa xong';
      } else if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      } else if (diffDays === 1) {
        return 'Hôm qua';
      } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
      } else {
        return notificationDate.toLocaleDateString('vi-VN', { 
          day: '2-digit', 
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
      default:
        return ORANGE2;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconColor = getNotificationColor(item.type);
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Text style={[styles.iconText, { color: iconColor }]}>
            {getNotificationIcon(item.type)}
          </Text>
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, isUnread && styles.unreadTitle]}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notificationDate}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.markAllButton, isMarkingAll && styles.markAllButtonDisabled]}
            onPress={handleMarkAllAsRead}
            disabled={isMarkingAll}
          >
            <Text style={styles.markAllText}>
              {isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => fetchNotifications()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ORANGE2} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          <Text style={styles.emptySubtext}>
            Thông báo mới sẽ xuất hiện ở đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[ORANGE2]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  markAllButton: {
    alignSelf: 'flex-end',
  },
  markAllButtonDisabled: {
    opacity: 0.5,
  },
  markAllText: {
    fontSize: 14,
    color: ORANGE2,
    fontFamily: 'RobotoMono_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'RobotoMono_700Bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'RobotoMono_400Regular',
  },
  listContainer: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#FFF9F5',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontFamily: 'RobotoMono_700Bold',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'RobotoMono_700Bold',
    flex: 1,
  },
  unreadTitle: {
    fontFamily: 'RobotoMono_700Bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE2,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'RobotoMono_400Regular',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'RobotoMono_400Regular',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 24,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'RobotoMono_400Regular',
    marginBottom: 4,
  },
  retryText: {
    color: ORANGE2,
    fontFamily: 'RobotoMono_700Bold',
  },
});

