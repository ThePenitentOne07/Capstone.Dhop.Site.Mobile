import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface SearchBarProps {
  placeholder?: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Tìm biên đạo, nhóm nhảy với AI",
  onSearchChange,
  onFilterPress 
}) => {
  const router = useRouter();
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < placeholder.length) {
        setTypedPlaceholder(placeholder.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 100); // Adjust speed here (100ms per character)

    return () => clearInterval(typingInterval);
  }, [placeholder]);

  const handlePress = () => {
    router.push('/ChatBoxAI');
  };

  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput 
          style={styles.searchInput}
          placeholder={isTypingComplete ? placeholder : typedPlaceholder}
          placeholderTextColor="#999"
          onChangeText={onSearchChange}
          editable={false}
        />
      </TouchableOpacity>
     
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    fontFamily: 'RobotoMono_400Regular',
  },
  filterButton: {
    width: 50,
    height: 70, 
    borderRadius: 12,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});
