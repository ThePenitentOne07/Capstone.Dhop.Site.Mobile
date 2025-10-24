import React from 'react';
import { SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useUserInfo } from "../hooks/useUserInfo";
import { Header, SearchBar, FeaturedChoreography, ArtistSection, ClassesSection } from "../components";
import { sharedStyles } from "../styles/shared";

export default function HomeScreen() {
  const { user, loading, error } = useUserInfo();
  const router = useRouter();

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleSearchChange = (text: string) => {
    console.log('Search:', text);
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const handleChoreographyShowMore = () => {
    console.log('Choreography show more pressed');
  };

  const handleChoreographyCategoryChange = (category: string) => {
    console.log('Choreography category changed:', category);
  };

  const handleChoreographyItemPress = (item: any) => {
    router.push({
      pathname: "/detailsChoreography/[id]",
      params: {
        id: item?.id,
        title: item?.title,
        name: item?.artist,
        avatar: item?.image?.uri || item?.avatar,
        price: item?.price,
        yearExperience: item?.yearExperience,
        about: item?.about,
      },
    });
  };

  const handleArtistShowMore = () => {
    console.log('Artist show more pressed');
  };

  const handleArtistPress = (artist: any) => {
    console.log('Artist pressed:', artist);
  };

  const handleAddArtist = () => {
    console.log('Add artist pressed');
  };

  const handleClassesEdit = () => {
    console.log('Classes edit pressed');
  };

  const handleClassesFilterChange = (filter: string) => {
    console.log('Classes filter changed:', filter);
  };

  const handleClassPress = (classItem: any) => {
    console.log('Class pressed:', classItem);
  };

  return (
    <SafeAreaView style={sharedStyles.screenRoot}>
      <ScrollView style={sharedStyles.scrollView} showsVerticalScrollIndicator={false}>
        <Header 
          userName={user?.name}
          onNotificationPress={handleNotificationPress}
          onMenuPress={handleMenuPress}
        />

        <SearchBar 
          onSearchChange={handleSearchChange}
          onFilterPress={handleFilterPress}
        />

        <FeaturedChoreography 
          onShowMore={handleChoreographyShowMore}
          onCategoryChange={handleChoreographyCategoryChange}
          onItemPress={handleChoreographyItemPress}
        />

        <ArtistSection 
          onShowMore={handleArtistShowMore}
          onArtistPress={handleArtistPress}
          onAddArtist={handleAddArtist}
        />

        <ClassesSection 
          onEditPress={handleClassesEdit}
          onFilterChange={handleClassesFilterChange}
          onClassPress={handleClassPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

