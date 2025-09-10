import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="details/[id]" options={{ title: "Details" }} />
    </Stack>
  );
}
