import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getChoreographyUsers } from '../service/api';
import { useFormatCurrency } from '../hooks/useFormatCurrency';

interface Role { name: string }

interface ApiChoreographyItem {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: Role[];
  choreography?: {
    choreographyId: number;
    nickname?: string;
    price?: number;
    yearExperience?: number;
    about?: string;
    area?: string;
    danceType?: string;

  }
}

interface ApiResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: ApiChoreographyItem[];
}

interface FeaturedChoreographyProps {
  onShowMore?: () => void;
  onCategoryChange?: (category: string) => void;
  onItemPress?: (item: any) => void;
}

const fallbackImages = [
  require('../assets/logo-icon.png'),
];

// const categories = ['Nổi bật', 'Mới nhất', 'Tất cả'];



export const FeaturedChoreography: React.FC<FeaturedChoreographyProps> = ({ 
  onShowMore,
  onCategoryChange,
  onItemPress 
}) => {
  const [activeCategory, setActiveCategory] = React.useState('Nổi bật');
  const [data, setData] = React.useState<ApiChoreographyItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const {formatCurrency}= useFormatCurrency()

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getChoreographyUsers({
        pageNo: 1,
        pageSize: 10,
      });
      const payload: ApiResponse = res.data;
      setData(Array.isArray(payload?.items) ? payload.items : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load choreography');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Biên đạo dành cho bạn</Text>
        <TouchableOpacity onPress={onShowMore}>
          <Text style={styles.showMore}>Xem tất cả &gt;</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.choreographyContainer}>
       

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#FF7A00" />
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchData}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {data.length === 0 ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.emptyStateText}>Hiện chưa có biên đạo nào.</Text>
                <TouchableOpacity onPress={fetchData}>
                  <Text style={styles.retryText}>Tải lại</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
                {data.map((item, index) => {
                  const title = item.choreography?.nickname || item.name;
                  const imageSource = item.avatar
                    ? { uri: item.avatar }
                    : fallbackImages[index % fallbackImages.length];
                  const price = item.choreography?.price;
                  const years = item.choreography?.yearExperience;

                  // danceType from API can be string, object, or array of objects
                  const rawDanceType: any = item.choreography?.danceType;
                  let danceTypeLabel = '';

                  if (typeof rawDanceType === 'string') {
                    danceTypeLabel = rawDanceType;
                  } else if (Array.isArray(rawDanceType)) {
                    const parts = rawDanceType
                      .map((dt) => dt?.type || dt?.description)
                      .filter(Boolean);
                    if (parts.length > 0) {
                      danceTypeLabel = parts.join(', ');
                    }
                  } else if (rawDanceType && typeof rawDanceType === 'object') {
                    danceTypeLabel =
                      rawDanceType.type ||
                      rawDanceType.description ||
                      danceTypeLabel;
                  }

                  const formattedPrice =
                    typeof price === 'number'
                      ? `${formatCurrency(price)}`
                      : 'Liên hệ';

                  return (
                    <TouchableOpacity 
                      key={item.id}
                      style={styles.choreographyCard}
                      onPress={() => onItemPress?.({
                        // map to a minimal shape for consumer code
                        // @ts-ignore allow consumer to decide
                        id: String(item.choreography?.choreographyId || item.id),
                        title,
                        artist: item.name,
                        image: imageSource,
                        avatar: item.avatar,
                        price: item.choreography?.price,
                        yearExperience: years,
                        about: item.choreography?.about,
                        area: item.choreography?.area,
                        danceType: item.choreography?.danceType,
                      }
                    )}
                    >
                      <View style={styles.cardImageWrap}>
                        <Image 
                          source={imageSource} 
                          style={styles.cardImage}
                          resizeMode="contain"
                        />
                        {typeof years === 'number' && years > 0 && (
                          <View style={styles.experienceBadge}>
                            <Text style={styles.experienceText}>{years}+ năm kinh nghiệm</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.cardBody}>
                        <Text numberOfLines={1} style={styles.cardTitle}>{title}</Text>
                        <Text numberOfLines={1} style={styles.cardSubtitle}>{danceTypeLabel}</Text>
                        <View style={styles.cardFooter}>
                          <View>
                            <Text style={styles.priceLabel}>Từ</Text>
                            <Text style={styles.priceValue}>{formattedPrice}</Text>
                            <Text style={styles.priceUnit}>/ buổi</Text>
                          </View>
                         
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  showMore: {
    fontSize: 14,
    color: "#FF7A00",
    fontWeight: "500",
  },
  choreographyContainer: {
    paddingLeft: 20,
  },
  categoryNav: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 20,
  },
  categoryButton: {
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  categoryTextActive: {
    fontSize: 16,
    color: "#FF7A00",
    fontWeight: "600",
  },
  cardsContainer: {
    paddingRight: 20,
  },
  choreographyCard: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#6B7280',
    marginBottom: 4,
  },
  retryText: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  cardImageWrap: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#FFF7ED',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  experienceBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  experienceText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  cardFooter: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF7A00',
  },
  priceUnit: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  bookTag: {
    backgroundColor: '#FFEDE1',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  bookTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A00',
  },
});
