import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Linking, Modal } from 'react-native'
import React, { useMemo, useState } from 'react'
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated'
import { useAppModal } from '../../hooks/useAppModal'

const { width } = Dimensions.get('window');

// ⚠️ Suggestion: Update your Profile interface to pass video titles
interface Experience {
  id: number;
  title: string;
  subject: string;
  years: string;
}

interface Profile {
  profileId: number;
  // Videos should ideally be an array of objects: { url: string, title: string }
  videos: string[] | { url: string, title: string }[]; 
  images: string[];
  achievements: string[];
  experiences?: Experience[];
}

interface ChoreographerProjectProps {
  profiles?: Profile[];
}

// Function to extract YouTube video ID and generate thumbnail URL
const getYouTubeThumbnail = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    const videoId = match[2];
    // YouTube thumbnail URLs (maxresdefault is highest quality)
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  return "https://via.placeholder.com/300x200/FF7A00/FFFFFF?text=Video+Thumbnail";
};

interface ProjectItem {
  id: string;
  type: 'video' | 'image';
  title: string; // This will hold the actual video title
  url: string;
  thumbnail: string;
  profileId: number;
}

export default function ChoreographerProject({ profiles = [] }: ChoreographerProjectProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { showModal, modal } = useAppModal();
  
  // Transform profiles into separated displayable items
  const { allVideos, allImages, allAchievements, allExperiences } = useMemo(() => {
    const videos: ProjectItem[] = [];
    const images: ProjectItem[] = [];
    const achievements: string[] = [];
    const experiences: Experience[] = [];

    profiles.forEach((profile) => {
      // 1. Process Achievements
      if (profile.achievements && Array.isArray(profile.achievements)) {
        achievements.push(...profile.achievements);
      }
      
      // 2. Process Experiences
      if (profile.experiences && Array.isArray(profile.experiences)) {
        experiences.push(...profile.experiences);
      }
      
      // 3. Process Videos
      profile.videos?.forEach((videoData, index) => {
        // Handle both string[] (old) and { url: string, title: string }[] (new) format
        const isObject = typeof videoData === 'object' && videoData !== null && 'url' in videoData;
        const videoUrl = isObject ? videoData.url : videoData;
        const videoTitle = isObject ? videoData.title : `Video ${index + 1}`; // Use provided title or fallback

        videos.push({
          id: `video-${profile.profileId}-${index}`,
          type: 'video',
          title: videoTitle,
          url: videoUrl,
          thumbnail: getYouTubeThumbnail(videoUrl),
          profileId: profile.profileId,
        });
      });
      
      // 4. Process Images
      profile.images?.forEach((imageUrl, index) => {
        images.push({
          id: `image-${profile.profileId}-${index}`,
          type: 'image',
          title: `Hình ảnh ${index + 1}`,
          url: imageUrl,
          thumbnail: imageUrl,
          profileId: profile.profileId,
        });
      });
    });
    
    return { allVideos: videos, allImages: images, allAchievements: achievements, allExperiences: experiences };
  }, [profiles]);

  // Function to open YouTube video in app or browser
  const openYouTubeVideo = async (videoUrl: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = videoUrl.match(regExp);
      
      if (match && match[2].length === 11) {
        const videoId = match[2];
        const youtubeAppUrl = `youtube://${videoId}`;
        
        const canOpenYouTubeApp = await Linking.canOpenURL(youtubeAppUrl);
        
        if (canOpenYouTubeApp) {
          await Linking.openURL(youtubeAppUrl);
        } else {
          await Linking.openURL(videoUrl);
        }
      } else {
        await Linking.openURL(videoUrl);
      }
    } catch (error) {
      showModal({
        title: 'Không thể mở video',
        message: 'Không thể mở video. Vui lòng thử lại.',
        status: 'error',
      });
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const ProjectCard = ({ project, index }: { project: ProjectItem, index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 100)}
      style={styles.projectCard}
    >
      <TouchableOpacity 
        style={styles.projectContent}
        onPress={() => {
          if (project.type === 'video') {
            openYouTubeVideo(project.url);
          } else {
            handleImagePress(project.url);
          }
        }}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: project.thumbnail }}
            style={styles.thumbnail}
            resizeMode="contain"
          />
          {project.type === 'video' && (
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          )}
        </View>
{/*         
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {project.type === 'video' ? '🎬 Video' : '🖼️ Hình ảnh'}
            </Text>
          </View>
        </View> */}
      </TouchableOpacity>
    </Animated.View>
  );


  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInLeft.delay(200)} style={styles.header}>
        <Text style={styles.headerTitle}>🎬 Dự án</Text>
        <Text style={styles.headerSubtitle}>
          {allVideos.length + allImages.length} {allVideos.length + allImages.length === 1 ? 'dự án' : 'dự án'} 
          {allAchievements.length > 0 && ` • ${allAchievements.length} thành tích`}
          {allExperiences.length > 0 && ` • ${allExperiences.length} kinh nghiệm`}
        </Text>
      </Animated.View>

      {/* Achievements Section */}
      {allAchievements.length > 0 && (
        <Animated.View entering={FadeInUp.delay(300)} style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>🏆 Thành tích</Text>
          <View style={styles.achievementsContainer}>
            {allAchievements.map((achievement, index) => (
              <View key={index} style={styles.achievementBadge}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Projects Grid */}
      <ScrollView style={styles.projectsContainer} showsVerticalScrollIndicator={false}>
        
        {/* === Experiences Section === */}
        {allExperiences.length > 0 && (
          <View>
            <Animated.Text entering={FadeInLeft.delay(350)} style={styles.sectionTitle}>
              💼 Kinh nghiệm ({allExperiences.length})
            </Animated.Text>
            <View style={styles.sectionSeparator} />
            {allExperiences.map((experience, index) => (
              <Animated.View
                key={experience.id}
                entering={FadeInUp.delay(350 + index * 50)}
                style={styles.experienceCard}
              >
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceTitle}>{experience.title}</Text>
                  <View style={styles.experienceYearBadge}>
                    <Text style={styles.experienceYear}>{experience.years}</Text>
                  </View>
                </View>
                <Text style={styles.experienceSubject}>{experience.subject}</Text>
              </Animated.View>
            ))}
          </View>
        )}
        
        
        {/* === Video Section === */}
        {allVideos.length > 0 && (
          <View>
            <Animated.Text entering={FadeInLeft.delay(400)} style={[styles.sectionTitle, { marginTop: allExperiences.length > 0 ? 20 : 0 }]}>
              🎥 Các video dự án ({allVideos.length})
            </Animated.Text>
            <View style={styles.sectionSeparator} />
            {allVideos.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </View>
        )}
        
        {/* === Image Section === */}
        {allImages.length > 0 && (
          <View>
            <Animated.Text entering={FadeInLeft.delay(500)} style={[styles.sectionTitle, { marginTop: allVideos.length > 0 ? 20 : 0 }]}>
              🖼️ Hình ảnh các buổi diễn ({allImages.length})
            </Animated.Text>
            <View style={styles.sectionSeparator} />
            {allImages.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {allVideos.length === 0 && allImages.length === 0 && allExperiences.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có dự án nào</Text>
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={previewImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {previewImage && (
                <Image
                  source={{ uri: previewImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPreviewImage(null)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {modal}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 15,
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
    alignItems: 'center', // Added for centering content when using 'contain'
    justifyContent: 'center', // Added for centering content when using 'contain'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Changed from 'cover' to 'contain'
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
  typeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  achievementText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: width,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  experienceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  experienceYearBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  experienceYear: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  experienceSubject: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 20,
  },
});