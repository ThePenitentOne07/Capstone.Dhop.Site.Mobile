 import {
     View,
     Text,
     TouchableOpacity,
     StyleSheet,
     FlatList,
     Modal,
     TouchableWithoutFeedback,
   } from "react-native";
   import React, { useCallback, useState } from "react";
   import { AntDesign } from "@expo/vector-icons";
  
  type OptionItem = {
    value: string;
    label: string;
  };
  
  interface DropDownProps {
    data: OptionItem[];
    onChange: (item: OptionItem) => void;
    placeholder: string;
  }
  
  export default function Dropdown({
    data,
    onChange,
    placeholder,
  }: DropDownProps) {
    const [expanded, setExpanded] = useState(false);
  
    const toggleExpanded = useCallback(() => setExpanded(!expanded), [expanded]);
  
   const [value, setValue] = useState("");
  
    const onSelect = useCallback((item: OptionItem) => {
      onChange(item);
      setValue(item.label);
      setExpanded(false);
    }, []);
    return (
      <View>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={toggleExpanded}
        >
          <Text style={styles.text}>{value || placeholder}</Text>
          <AntDesign name={expanded ? 'up' : 'down'} size={14} />
        </TouchableOpacity>
        {expanded ? (
          <Modal visible={expanded} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
              <View style={styles.modalRoot}>
                {/* Blur backdrop if expo-blur is available; otherwise dim */}
                <BlurBackdrop />
                <TouchableWithoutFeedback>
                  <View style={styles.centeredPanel}>
                    <FlatList
                      keyExtractor={(item) => item.value}
                      data={data}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.optionItem}
                          onPress={() => onSelect(item)}
                        >
                          <Text style={styles.optionText}>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
                      )}
                      style={styles.list}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        ) : null}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionItem: {
      height: 40,
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    separator: {
      height: 4,
    },
    centeredPanel: {
      width: '86%',
      maxHeight: 360,
      backgroundColor: 'white',
      borderRadius: 12,
      paddingVertical: 8,
      elevation: 16,
    },
    list: {
      maxHeight: 360,
    },
    listContent: {
      paddingVertical: 6,
    },
    text: {
      fontSize: 15,
      opacity: 0.8,
    },
    button: {
      height: 50,
      justifyContent: "space-between",
      backgroundColor: "#fff",
      flexDirection: "row",
      width: "100%",
      alignItems: "center",
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    optionText: {
      fontSize: 14,
      color: '#111827',
      fontWeight: '600',
    },
  });

  // Lightweight blur fallback: try to require expo-blur; if unavailable, return dim overlay
  function BlurBackdrop() {
    let BlurView: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      BlurView = require('expo-blur').BlurView;
    } catch (e) {
      BlurView = null;
    }
    if (BlurView) {
      return (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
      );
    }
    return <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />;
  }