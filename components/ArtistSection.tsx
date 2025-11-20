import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface Artist {
  id: string;
  name: string;
  image: any;
  isAddButton?: boolean;
}

interface ArtistSectionProps {
  onShowMore?: () => void;
  onArtistPress?: (artist: Artist) => void;
  onAddArtist?: () => void;
}

const artistsData: Artist[] = [
  {
    id: '1',
    name: 'John Smith',
    image: require('../assets/vecteezy_man-using-smartphone-device_24096847.png'),
    isAddButton: true
  },
  {
    id: '2',
    name: 'Louise',
    image: require('../assets/girl-dancing-2830024-2357254.webp')
  },
  {
    id: '3',
    name: 'Henna',
    image: require('../assets/energetic-dance-performance-given-by-lady-illustration-svg-download-png-11526278.webp')
  },
  {
    id: '4',
    name: 'Leah',
    image: require('../assets/girl-dancing-2830024-2357254.webp')
  },
  {
    id: '5',
    name: 'Lisa',
    image: require('../assets/energetic-dance-performance-given-by-lady-illustration-svg-download-png-11526278.webp')
  }
];

export const ArtistSection: React.FC<ArtistSectionProps> = ({ 
  onShowMore,
  onArtistPress,
  onAddArtist 
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nhóm nhảy</Text>
        <TouchableOpacity onPress={onShowMore}>
          <Text style={styles.showMore}>Xem tất cả &gt;</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.artistContainer}>
        {artistsData.map((artist) => (
          <TouchableOpacity 
            key={artist.id}
            style={styles.artistCircle}
            onPress={() => artist.isAddButton ? onAddArtist?.() : onArtistPress?.(artist)}
          >
            <Image 
              source={artist.image} 
              style={styles.artistImage}
              resizeMode="cover"
            />
            {artist.isAddButton && (
              <View style={styles.addIcon}>
                <Text style={styles.addIconText}>+</Text>
              </View>
            )}
            <Text style={styles.artistName}>{artist.name}</Text>
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
  artistContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  artistCircle: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  addIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  artistName: {
    fontSize: 12,
    color: "#374151",
    textAlign: 'center',
    fontWeight: "500",
  },
});

