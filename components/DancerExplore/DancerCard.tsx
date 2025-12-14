import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

export interface DancerProfile {
  dancerId: number;
  about?: string;
  danceGroupName?: string;
  teamSize?: number;
  price?: number;
  yearExperience?: number;
  area?: Array<{ id: number; city: string; ward: string }> | null;
  danceType?: Array<{ id: number; type: string; description: string }> | null;
  averageRating?: number;
}

export interface DancerListItem {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  dancer?: DancerProfile | null;
  averageRating?: number;
}

export interface DancerCardProps {
  item: DancerListItem;
  onPress?: (item: DancerListItem) => void;
}

const fallbackAvatar = require("../../assets/logo-icon.png");

const DancerCard: React.FC<DancerCardProps> = ({ item, onPress }) => {
  const router = useRouter();
  const experienceLabel = item?.dancer?.yearExperience
    ? `${item.dancer.yearExperience} năm kinh nghiệm`
    : "Chưa cập nhật kinh nghiệm";

  const priceLabel =
    typeof item?.dancer?.price === "number"
      ? `${item.dancer.price.toLocaleString("vi-VN")}₫ / giờ`
      : "Giá thoả thuận";

  // Format areas array
//   const areaValue = item?.dancer?.area;
  

  // Get dance types array
  const danceTypes = item?.dancer?.danceType;

  const avatarSource = item.avatar
    ? { uri: item.avatar }
    : fallbackAvatar;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        console.log('DancerCard pressed, item:', item);
        onPress?.(item);
        router.push({ pathname: '/DetailsDancer/[id]', params: { id: String(item.dancer?.dancerId) } });
      }}
    >
      <Image source={avatarSource} style={styles.avatar} />
      <View style={styles.content}>
        {item.dancer?.danceGroupName ? (
          <Text style={styles.nickname}>{item.dancer.danceGroupName}</Text>
        ) : null}
        {/* <Text style={styles.name}>{item.name}</Text> */}
        <Text style={styles.detail}>{experienceLabel}</Text>
        {/* <Text style={styles.detail}>{areaLabel}</Text> */}
        {danceTypes && danceTypes.length > 0 ? (
          <View style={styles.chipsContainer}>
            {danceTypes.map((dt) => (
              <View key={dt.id} style={styles.chip}>
                <Text style={styles.chipText}>{dt.type}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {/* <Text style={styles.price}>{priceLabel}</Text> */}
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
    fontSize: 14,
    color: "#111827",
    fontFamily: 'RobotoMono_400Regular',
  },
  nickname: {
    fontSize: 16,
    color: "#F97316",
    fontFamily: 'RobotoMono_700Bold',
  },
  detail: {
    fontSize: 13,
    color: "#4B5563",
    fontFamily: 'RobotoMono_400Regular',
  },
  price: {
    marginTop: 6,
    fontSize: 14,
    color: "#047857",
    fontFamily: 'RobotoMono_700Bold',
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  chip: {
    backgroundColor: "#F97316",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontFamily: 'RobotoMono_700Bold',
  },
});

export default DancerCard;

