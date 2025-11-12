import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { Area } from "../../hooks/useArea";
import { FilterState } from "./types";

export interface FilterControlsProps {
  filters: FilterState;
  onChangeFilters: (next: Partial<FilterState>) => void;
  onClearFilters: () => void;
  areas: Area[];
  areaLoading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onChangeFilters,
  onClearFilters,
  areas,
  areaLoading = false,
}) => {
  const [areaModalVisible, setAreaModalVisible] = useState(false);

  const selectedAreaLabel = useMemo(() => {
    const selected = areas.find((area) => area.id === filters.areas);
    return selected ? `${selected.city} - ${selected.ward}` : "Tất cả khu vực";
  }, [areas, filters.areas]);

  const handleNumberInputChange = (
    key: keyof FilterState,
    value: string
  ) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    onChangeFilters({ [key]: sanitized } as Partial<FilterState>);
  };

  const handleAreaSelect = (areaId: number | null) => {
    onChangeFilters({ areas: areaId });
    setAreaModalVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.filterColumn}>
          <Text style={styles.label}>Khu vực</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setAreaModalVisible(true)}
            disabled={areaLoading}
          >
            <Text style={styles.selectorText}>{selectedAreaLabel}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterColumn}>
          <Text style={styles.label}>Kinh nghiệm (năm)</Text>
          <View style={styles.inlineInputs}>
            <TextInput
              keyboardType="number-pad"
              placeholder="Từ"
              style={styles.numberInput}
              value={filters.minExperience}
              onChangeText={(value) =>
                handleNumberInputChange("minExperience", value)
              }
            />
            <Text style={styles.toLabel}>-</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="Đến"
              style={styles.numberInput}
              value={filters.maxExperience}
              onChangeText={(value) =>
                handleNumberInputChange("maxExperience", value)
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.filterColumn}>
          <Text style={styles.label}>Giá (VND)</Text>
          <View style={styles.inlineInputs}>
            <TextInput
              keyboardType="number-pad"
              placeholder="Từ"
              style={styles.numberInput}
              value={filters.minPrice}
              onChangeText={(value) => handleNumberInputChange("minPrice", value)}
            />
            <Text style={styles.toLabel}>-</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="Đến"
              style={styles.numberInput}
              value={filters.maxPrice}
              onChangeText={(value) => handleNumberInputChange("maxPrice", value)}
            />
          </View>
        </View>
        <View style={styles.actionsColumn}>
          <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
            <Text style={styles.clearText}>Xoá lọc</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={areaModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAreaModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setAreaModalVisible(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn khu vực</Text>
            <FlatList
              data={areas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleAreaSelect(item.id)}
                >
                  <Text style={styles.modalItemText}>
                    {item.city} - {item.ward}
                  </Text>
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleAreaSelect(null)}
                >
                  <Text style={[styles.modalItemText, styles.modalItemAll]}>
                    Tất cả khu vực
                  </Text>
                </TouchableOpacity>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  filterColumn: {
    flex: 1,
    gap: 8,
  },
  actionsColumn: {
    justifyContent: "flex-end",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  selector: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  selectorText: {
    fontSize: 14,
    color: "#111827",
  },
  inlineInputs: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  numberInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 14,
    color: "#111827",
  },
  toLabel: {
    paddingHorizontal: 6,
    color: "#6B7280",
  },
  clearButton: {
    borderWidth: 1,
    borderColor: "#F97316",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: "#F97316",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "60%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemText: {
    fontSize: 15,
    color: "#111827",
  },
  modalItemAll: {
    color: "#F97316",
    fontWeight: "600",
  },
});

export default FilterControls;



