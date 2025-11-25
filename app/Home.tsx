import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useUserInfo } from "../hooks/useUserInfo";
import {
  Header,
  SearchBar,
  FeaturedChoreography,
  ArtistSection,
  ClassesSection,
} from "../components";
import { sharedStyles } from "../styles/shared";
import Animated, { FadeIn } from "react-native-reanimated";

export default function HomeScreen() {
  const { user, loading, error } = useUserInfo();
  const router = useRouter();

  // Debug: Log user data
  console.log("Home user data:", user);
  console.log("Home user name:", user?.name);

  const handleNotificationPress = () => {
    router.push("/NotificationList");
  };

  const handleMenuPress = () => {
    router.push("/CustomerMenu");
  };

  const handleSearchChange = (text: string) => {
    console.log("Search:", text);
  };

  const handleFilterPress = () => {
    console.log("Filter pressed");
  };

  const handleChoreographyShowMore = () => {
    router.push("/Choreographer/Explore");
  };

  const handleChoreographyCategoryChange = (category: string) => {
    console.log("Choreography category changed:", category);
  };

  const handleChoreographyItemPress = (item: any) => {
    router.push({
      pathname: "/DetailsChoreography/[id]",
      params: {
        id: item?.id,
        // title: item?.title,
        // name: item?.artist,
        // avatar: item?.image?.uri || item?.avatar,
        // price: item?.price,
        // yearExperience: item?.yearExperience,
        // about: item?.about,
        // area: item?.area ? JSON.stringify(item.area) : undefined,
        // danceType: item?.danceType ? JSON.stringify(item.danceType) : undefined,
      },
    });
    console.log("item", item);
  };

  const handleArtistShowMore = () => {
    console.log("Artist show more pressed");
  };

  const handleArtistPress = (artist: any) => {
    console.log("Artist pressed:", artist);
  };

  const handleAddArtist = () => {
    console.log("Add artist pressed");
  };

  const handleClassesEdit = () => {
    console.log("Classes edit pressed");
  };

  const handleClassesFilterChange = (filter: string) => {
    console.log("Classes filter changed:", filter);
  };

  const handleClassPress = (classItem: any) => {
    console.log("Class pressed:", classItem);
  };

  return (
    <SafeAreaView style={sharedStyles.screenRoot}>
      <ScrollView
        style={sharedStyles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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
