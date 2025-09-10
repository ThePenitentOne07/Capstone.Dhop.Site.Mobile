import { View, Text, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>📄 Details Screen - {id}</Text>
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}
