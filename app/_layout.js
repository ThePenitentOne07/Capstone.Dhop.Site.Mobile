import { Stack } from "expo-router";
import { useFonts, RobotoMono_400Regular, RobotoMono_700Bold } from "@expo-google-fonts/roboto-mono";

export default function Layout() {
  const [loaded] = useFonts({
    RobotoMono_400Regular,
    RobotoMono_700Bold,
  });
  if (!loaded) return null;

  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      <Stack.Screen name="otpSignUp" options={{ headerShown: false }} />
    </Stack>
  );
}