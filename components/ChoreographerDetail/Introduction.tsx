import { View, Text, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInUp, FadeInLeft, FadeInRight } from 'react-native-reanimated'

const { width } = Dimensions.get('window');

export default function Introduction({ props }: { props: { title: string, name: string, price: number, yearExperience: number, about: string, area: Array<{ id: number, city: string, ward: string }>, danceType: Array<{ id: number, type: string, description: string }> } }) {
  console.log("props", props);
  return (
    <View style={styles.container}>
      {/* Spotify-style Header */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{props.title}</Text>
          {!!props.name && (
            <Animated.Text entering={FadeInLeft.delay(400)} style={styles.subtitle}>
              {props.name}
            </Animated.Text>
          )}
          <View style={styles.headerStats}>
            <Text style={styles.statText}>{props.yearExperience || 0} năm kinh nghiệm</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>{props.danceType?.length || 0} thể loại</Text>
          </View>
        </View>
      </Animated.View>

      {/* Dance Types - Spotify-style Tags */}
      <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
        <Text style={styles.sectionTitle}>Thể loại</Text>
        <View style={styles.tagsContainer}>
          {props.danceType && props.danceType.map((dance, index) => (
            <Animated.View 
              key={dance.id || index} 
              entering={FadeInRight.delay(800 + index * 100)}
              style={styles.tagWrapper}
            >
              <View style={styles.tag}>
                <Text style={styles.tagText}>{dance.type}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Area Section */}
      <Animated.View entering={FadeInUp.delay(800)} style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Khu vực hoạt động</Text>
        <View style={styles.areaContainer}>
          {props.area && props.area.map((location, index) => (
            <Animated.View 
              key={location.id || index} 
              entering={FadeInRight.delay(1000 + index * 100)}
              style={styles.areaCard}
            >
              <View style={styles.areaContent}>
                <Text style={styles.cityText}>{location.city}</Text>
                <Text style={styles.wardText}>{location.ward}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* About Section - Spotify-style Card */}
      <Animated.View entering={FadeInUp.delay(1200)} style={styles.section}>
        <Text style={styles.sectionTitle}>Về tôi</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.paragraph}>
            {props.about}
          </Text>
        </View>
      </Animated.View>

      {/* Stats Cards - Spotify-style */}
      <Animated.View entering={FadeInUp.delay(1400)} style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>🎯</Text>
          </View>
          <Text style={styles.statNumber}>{props.yearExperience || 0}</Text>
          <Text style={styles.statLabel}>Năm</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>🎭</Text>
          </View>
          <Text style={styles.statNumber}>{props.danceType?.length || 0}</Text>
          <Text style={styles.statLabel}>Thể loại</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>⭐</Text>
          </View>
          <Text style={styles.statNumber}>5.0</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
      </Animated.View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937', // Dark text for white background
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280', // Gray text for white background
    fontWeight: '400',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  statDot: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937', // Dark text for white background
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagWrapper: {
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#FF7A00', // Orange theme
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  areaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  areaCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 3,
    borderLeftColor: '#FF7A00',
    minWidth: 140,
  },
  areaContent: {
    alignItems: 'flex-start',
  },
  cityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  wardText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  aboutCard: {
    backgroundColor: '#F9FAFB', // Light gray card background
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 3,
    borderLeftColor: '#FF7A00', // Orange accent
  },
  paragraph: {
    fontSize: 14,
    color: '#374151', // Darker text for light background
    lineHeight: 20,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray card background
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopWidth: 2,
    borderTopColor: '#FF7A00', // Orange accent
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF7A00', // Orange theme
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937', // Dark text for light background
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280', // Gray text for light background
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})