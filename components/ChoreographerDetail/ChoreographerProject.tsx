import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Linking, Alert } from 'react-native'
import React, { useState } from 'react'
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated'

const { width } = Dimensions.get('window');

// Function to extract YouTube video ID and generate thumbnail URL
const getYouTubeThumbnail = (url: string): string => {
  // Extract video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    const videoId = match[2];
    // YouTube thumbnail URLs (maxresdefault is highest quality)
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  // Fallback thumbnail if URL parsing fails
  return "https://via.placeholder.com/300x200/FF7A00/FFFFFF?text=Video+Thumbnail";
};

// Mock project data - in real app, this would come from API
const mockProjects = [
  {
    id: 1,
    title: "Contemporary Dance Performance",
    description: "A beautiful contemporary piece showcasing modern dance techniques",
    videoUrl: "https://youtu.be/U8lJRcUeEMs?si=mjvMOdsBQ4waLUsl",
    thumbnail: getYouTubeThumbnail("https://youtu.be/U8lJRcUeEMs?si=mjvMOdsBQ4waLUsl"),
    duration: "3:45",
    views: "125K",
    date: "2024-01-15"
  },
  {
    id: 2,
    title: "Ballet Masterclass",
    description: "Professional ballet training session with advanced techniques",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: getYouTubeThumbnail("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    duration: "8:20",
    views: "89K",
    date: "2024-01-10"
  },
  {
    id: 3,
    title: "Jazz Dance Workshop",
    description: "High-energy jazz dance workshop for all skill levels",
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    thumbnail: getYouTubeThumbnail("https://www.youtube.com/watch?v=jNQXAC9IVRw"),
    duration: "5:30",
    views: "67K",
    date: "2024-01-05"
  },
  {
    id: 4,
    title: "Hip Hop Choreography",
    description: "Urban hip hop dance routine with street style moves",
    videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnail: getYouTubeThumbnail("https://www.youtube.com/watch?v=9bZkp7q19f0"),
    duration: "4:15",
    views: "156K",
    date: "2023-12-28"
  }
];

export default function ChoreographerProject() {
  const [activeFilter, setActiveFilter] = useState('All');

  // Function to open YouTube video in app or browser
  const openYouTubeVideo = async (videoUrl: string) => {
    try {
      // Extract video ID from URL
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = videoUrl.match(regExp);
      
      if (match && match[2].length === 11) {
        const videoId = match[2];
        const youtubeAppUrl = `youtube://${videoId}`;
        
        const canOpenYouTubeApp = await Linking.canOpenURL(youtubeAppUrl);
        
        if (canOpenYouTubeApp) {
          await Linking.openURL(youtubeAppUrl);
        } else {
          // Fallback to browser
          await Linking.openURL(videoUrl);
        }
      } else {
        // If we can't extract video ID, just open in browser
        await Linking.openURL(videoUrl);
      }
    } catch (error) {
      // Show alert if opening fails
      Alert.alert(
        'Không thể mở video',
        'Không thể mở video. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  

  const filteredProjects = activeFilter === 'All' 
    ? mockProjects 
    : mockProjects.filter(project => 
        project.title.toLowerCase().includes(activeFilter.toLowerCase())
      );

  const ProjectCard = ({ project, index }: { project: typeof mockProjects[0], index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 100)}
      style={styles.projectCard}
    >
      <TouchableOpacity 
        style={styles.projectContent}
        onPress={() => openYouTubeVideo(project.videoUrl)}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: project.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{project.duration}</Text>
          </View>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
        
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectDescription}>{project.description}</Text>
          
          <View style={styles.projectStats}>
            <Text style={styles.statText}>👁 {project.views}</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>{project.date}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );


  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInLeft.delay(200)} style={styles.header}>
        <Text style={styles.headerTitle}>🎬 Dự án</Text>
        <Text style={styles.headerSubtitle}>{mockProjects.length} video projects</Text>
      </Animated.View>

      {/* Filters */}
     

      {/* Projects Grid */}
      <ScrollView style={styles.projectsContainer} showsVerticalScrollIndicator={false}>
        {filteredProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  projectsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  projectCard: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  projectContent: {
    flex: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 122, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  projectInfo: {
    padding: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statDot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  bottomSpacer: {
    height: 20,
  },
})