import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

export interface ChoreographyProfile {
  choreographyId: number;
  nickname?: string;
  price?: number;
  yearExperience?: number;
  about?: string;
  area?: string | { id: number; city: string; ward: string } | null;
  danceType?: string;
}

export interface ChoreographerListItem {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  choreography?: ChoreographyProfile | null;
}

export interface ChoreographerCardProps {
  item: ChoreographerListItem;
  onPress?: (item: ChoreographerListItem) => void;
}

const fallbackAvatar = require("../../assets/logo-icon.png");

const ChoreographerCard: React.FC<ChoreographerCardProps> = ({ item, onPress }) => {
  const router = useRouter();
  const experienceLabel = item?.choreography?.yearExperience
    ? `${item.choreography.yearExperience} năm kinh nghiệm`
    : "Chưa cập nhật kinh nghiệm";

  const priceLabel =
    typeof item?.choreography?.price === "number"
      ? `${item.choreography.price.toLocaleString("vi-VN")}₫ / buổi`
      : "Giá thoả thuận";

  const areaValue = item?.choreography?.area;
  const areaLabel =
    typeof areaValue === "string"
      ? areaValue
      : areaValue && typeof areaValue === "object"
      ? `${areaValue.city} - ${areaValue.ward}`
      : "Chưa cập nhật khu vực";

  const avatarSource = item.avatar
    ? { uri: item.avatar }
    : fallbackAvatar;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        console.log('ChoreographerCard pressed, item:', item);
        onPress?.(item);
        router.push({ pathname: '/DetailsChoreography/[id]', params: { id: String(item.choreography?.choreographyId) } });
      }}
    >
      <Image source={avatarSource} style={styles.avatar} />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        {item.choreography?.nickname ? (
          <Text style={styles.nickname}>{item.choreography.nickname}</Text>
        ) : null}
        <Text style={styles.detail}>{experienceLabel}</Text>
        <Text style={styles.detail}>{areaLabel}</Text>
        <Text style={styles.price}>{priceLabel}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    backgroundColor: "#F3F4F6",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  nickname: {
    fontSize: 14,
    fontWeight: "500",
    color: "#F97316",
  },
  detail: {
    fontSize: 13,
    color: "#4B5563",
  },
  price: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
  },
});

export default ChoreographerCard;



