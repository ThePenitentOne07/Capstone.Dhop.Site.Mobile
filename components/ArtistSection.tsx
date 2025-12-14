import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getDancerUsers } from '../service/api';
import { useFormatCurrency } from '../hooks/useFormatCurrency';

interface Area {
  id: number;
  city: string;
  ward: string;
}

interface DanceType {
  id: number;
  type: string;
  description: string;
}

interface Dancer {
  dancerId: number;
  about?: string;
  danceGroupName?: string;
  teamSize?: number;
  bankAccount?: string;
  businessLicense?: string;
  price?: number;
  yearExperience?: number;
  area?: Area[];
  danceType?: DanceType[];
  profiles?: any[];
  averageRating?: number;
}

interface ApiDancerItem {
  id: number;
  userUUID: string;
  avatar?: string;
  email: string;
  name: string;
  phone?: string;
  active?: boolean;
  role: string;
  profileEmpty?: boolean;
  walletBalance?: number;
  dancer?: Dancer;
  averageRating?: number;
}

interface ApiResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: ApiDancerItem[];
}

interface ArtistSectionProps {
  onShowMore?: () => void;
  onArtistPress?: (artist: any) => void;
  onAddArtist?: () => void;
}

const fallbackImages = [
  require('../assets/logo-icon.png'),
];

export const ArtistSection: React.FC<ArtistSectionProps> = ({ 
  onShowMore,
  onArtistPress,
  onAddArtist 
}) => {
  const router = useRouter();
  const [data, setData] = React.useState<ApiDancerItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const {formatCurrency} = useFormatCurrency();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDancerUsers({
        pageNo: 1,
        pageSize: 10,
      });
      const payload: ApiResponse = res.data;
      setData(Array.isArray(payload?.items) ? payload.items : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load dancers');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nhóm nhảy</Text>
        <TouchableOpacity onPress={() => {
          onShowMore?.();
          router.push('/Dancer/Explore');
        }}>
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
                <Text style={styles.emptyStateText}>Hiện chưa có vũ công nào.</Text>
                <TouchableOpacity onPress={fetchData}>
                  <Text style={styles.retryText}>Tải lại</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
                {data.map((item, index) => {
                  const title = item.dancer?.danceGroupName || item.name;
                  const imageSource = item.avatar
                    ? { uri: item.avatar }
                    : fallbackImages[index % fallbackImages.length];
                  const price = item.dancer?.price;
                  const years = item.dancer?.yearExperience;

                  // danceType from API is an array of objects
                  const rawDanceType: any = item.dancer?.danceType;
                  let danceTypeLabel = '';

                  if (Array.isArray(rawDanceType)) {
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
                  } else if (typeof rawDanceType === 'string') {
                    danceTypeLabel = rawDanceType;
                  }

                  const formattedPrice =
                    typeof price === 'number'
                      ? `${formatCurrency(price)}`
                      : 'Liên hệ';

                  return (
                    <TouchableOpacity 
                      key={item.id}
                      style={styles.choreographyCard}
                      onPress={() => onArtistPress?.({
                        id: String(item.dancer?.dancerId || item.id),
                        title,
                        artist: item.name,
                        image: imageSource,
                        avatar: item.avatar,
                        price: item.dancer?.price,
                        yearExperience: years,
                        about: item.dancer?.about,
                        area: item.dancer?.area,
                        danceType: item.dancer?.danceType,
                        danceGroupName: item.dancer?.danceGroupName,
                        teamSize: item.dancer?.teamSize,
                      })}
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
    color: "#111827",
    fontFamily: 'RobotoMono_700Bold',
  },
  showMore: {
    fontSize: 14,
    color: "#FF7A00",
    fontFamily: 'RobotoMono_400Regular',
  },
  choreographyContainer: {
    paddingLeft: 20,
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
    fontFamily: 'RobotoMono_700Bold',
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
    fontFamily: 'RobotoMono_700Bold',
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    color: "#111827",
    fontFamily: 'RobotoMono_700Bold',
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: 'RobotoMono_400Regular',
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
    fontFamily: 'RobotoMono_400Regular',
  },
  priceValue: {
    fontSize: 18,
    color: '#FF7A00',
    fontFamily: 'RobotoMono_700Bold',
  },
  priceUnit: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'RobotoMono_400Regular',
  },
});

