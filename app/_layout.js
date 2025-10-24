import { Stack } from "expo-router";
import { useFonts, RobotoMono_400Regular, RobotoMono_700Bold } from "@expo-google-fonts/roboto-mono";
import { useUserInfo } from "../hooks/useUserInfo";

export default function Layout() {
  const [loaded] = useFonts({
    RobotoMono_400Regular,
    RobotoMono_700Bold,
  });
  
  // Call the hook on every screen
  const { user, loading, error } = useUserInfo();
  
  if (!loaded) return null;

  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
      <Stack.Screen name="otpSignUp" options={{ headerShown: false }} />
      <Stack.Screen name="Home" options={{ headerShown: false }} />
      <Stack.Screen 
        name="detailsChoreography/[id]" 
        options={{ 
          headerShown: true,
          title: "Chi tiết biên đạo",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          }
        }} 
      />
    </Stack>
  );
}