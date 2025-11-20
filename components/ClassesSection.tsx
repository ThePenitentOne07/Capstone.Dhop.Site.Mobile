import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface ClassItem {
  id: string;
  image: any;
}

interface ClassesSectionProps {
  onEditPress?: () => void;
  onFilterChange?: (filter: string) => void;
  onClassPress?: (classItem: ClassItem) => void;
}

const classData: ClassItem[] = [
  {
    id: '1',
    image: require('../assets/girl-dancing-2830024-2357254.webp')
  },
  {
    id: '2',
    image: require('../assets/energetic-dance-performance-given-by-lady-illustration-svg-download-png-11526278.webp')
  }
];

const filters = ['All', 'Hip hop', 'Free style', 'Belly'];

export const ClassesSection: React.FC<ClassesSectionProps> = ({ 
  onEditPress,
  onFilterChange,
  onClassPress 
}) => {
  const [activeFilter, setActiveFilter] = React.useState('All');

  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thể loại</Text>
        <TouchableOpacity onPress={onEditPress}>
          <Text style={styles.showMore}>Edit &gt;</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter}
            style={[
              styles.filterPill,
              activeFilter === filter && styles.filterPillActive
            ]}
            onPress={() => handleFilterPress(filter)}
          >
            <Text style={[
              styles.filterPillText,
              activeFilter === filter && styles.filterPillTextActive
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classCardsContainer}>
        {classData.map((classItem) => (
          <TouchableOpacity 
            key={classItem.id}
            style={styles.classCard}
            onPress={() => onClassPress?.(classItem)}
          >
            <Image 
              source={classItem.image} 
              style={styles.classCardImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  filterContainer: {
    paddingLeft: 20,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  filterPillActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FF7A00',
    marginRight: 12,
  },
  filterPillText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterPillTextActive: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  classCardsContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  classCard: {
    width: 140,
    height: 100,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  classCardImage: {
    width: '100%',
    height: '100%',
  },
});

