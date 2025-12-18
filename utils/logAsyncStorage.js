import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Logs all AsyncStorage keys + raw values to console (dev helper).
 */
export async function logAsyncStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const entries = keys.length ? await AsyncStorage.multiGet(keys) : [];

    console.log(`🧾 AsyncStorage keys (${keys.length}):`, keys);
    console.log("🧾 AsyncStorage entries:", entries); // [ [key, rawValueString], ... ]

    return { keys, entries };
  } catch (err) {
    console.error("Failed to dump AsyncStorage:", err);
    return { keys: [], entries: [], error: err };
  }
}


