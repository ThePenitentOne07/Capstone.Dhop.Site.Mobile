import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearchChange?: (text: string) => void;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Tìm biên đạo, nhóm nhảy",
  onSearchChange,
  onFilterPress 
}) => {
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

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput 
          style={styles.searchInput}
          placeholder={isTypingComplete ? placeholder : typedPlaceholder}
          placeholderTextColor="#999"
          onChangeText={onSearchChange}
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Text style={styles.filterIcon}>⚙️</Text>
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
    fontSize: 16,
    color: "#6B7280",
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
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

