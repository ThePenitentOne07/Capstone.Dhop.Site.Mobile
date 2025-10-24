import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getChoreographyUsers } from '../service/api';

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
  require('../assets/girl-dancing-2830024-2357254.webp'),
  require('../assets/energetic-dance-performance-given-by-lady-illustration-svg-download-png-11526278.webp'),
];

const categories = ['Nổi bật', 'Mới nhất', 'Tất cả'];

export const FeaturedChoreography: React.FC<FeaturedChoreographyProps> = ({ 
  onShowMore,
  onCategoryChange,
  onItemPress 
}) => {
  const [activeCategory, setActiveCategory] = React.useState('Nổi bật');
  const [data, setData] = React.useState<ApiChoreographyItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const pageNo = 1;
  const pageSize = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getChoreographyUsers(pageNo, pageSize);
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
        <View style={styles.categoryNav}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category}
              style={styles.categoryButton}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
            {data.map((item, index) => {
              const title = item.choreography?.nickname || item.name;
              const artist = item.name;
              const imageSource = item.avatar
                ? { uri: item.avatar }
                : fallbackImages[index % fallbackImages.length];

              return (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.choreographyCard}
                  onPress={() => onItemPress?.({
                    // map to a minimal shape for consumer code
                    // @ts-ignore allow consumer to decide
                    id: String(item.id),
                    title,
                    artist,
                    image: imageSource,
                    avatar: item.avatar,
                    price: item.choreography?.price,
                    yearExperience: item.choreography?.yearExperience,
                    about: item.choreography?.about,
                    area: item.choreography?.area,
                    danceType: item.choreography?.danceType,
                  }
                )}
                >
                  <Image 
                    source={imageSource} 
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.cardTitle}>{title}</Text>
                  {/* <Text style={styles.cardSubtitle}>by {artist}</Text> */}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    width: 160,
    marginRight: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  retryText: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
