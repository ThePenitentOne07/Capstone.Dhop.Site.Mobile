import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>🏠 Home Screen</Text>
      <Button title="Go to Details" onPress={() => router.push("/details/2")} />
    </View>
  );
}
