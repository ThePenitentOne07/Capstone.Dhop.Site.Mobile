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
import { DanceType } from "../../hooks/useDanceType";
import { FilterState } from "./types";

export interface FilterControlsProps {
  filters: FilterState;
  onChangeFilters: (next: Partial<FilterState>) => void;
  onClearFilters: () => void;
  areas: Area[];
  areaLoading?: boolean;
  danceTypes: DanceType[];
  danceTypeLoading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onChangeFilters,
  onClearFilters,
  areas,
  areaLoading = false,
  danceTypes,
  danceTypeLoading = false,
}) => {
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [danceTypeModalVisible, setDanceTypeModalVisible] = useState(false);

  const selectedAreaLabel = useMemo(() => {
    if (!filters.areas || filters.areas.length === 0) {
      return "Tất cả khu vực";
    }
    if (filters.areas.length === 1) {
      const selected = areas.find((area) => area.id === filters.areas[0]);
      return selected ? `${selected.city} - ${selected.ward}` : "Tất cả khu vực";
    }
    return `${filters.areas.length} khu vực đã chọn`;
  }, [areas, filters.areas]);

  const handleNameChange = (value: string) => {
    onChangeFilters({ name: value });
  };

  const handleAreaToggle = (areaId: number) => {
    const currentAreas = filters.areas || [];
    const isSelected = currentAreas.includes(areaId);
    const newAreas = isSelected
      ? currentAreas.filter((id) => id !== areaId)
      : [...currentAreas, areaId];
    onChangeFilters({ areas: newAreas });
  };

  const handleClearAreas = () => {
    onChangeFilters({ areas: [] });
  };

  const selectedDanceTypeLabel = useMemo(() => {
    if (!filters.danceTypes || filters.danceTypes.length === 0) {
      return "Tất cả thể loại";
    }
    if (filters.danceTypes.length === 1) {
      const selected = danceTypes.find((dt) => dt.id === filters.danceTypes[0]);
      return selected ? selected.type : "Tất cả thể loại";
    }
    return `${filters.danceTypes.length} thể loại đã chọn`;
  }, [danceTypes, filters.danceTypes]);

  const handleDanceTypeToggle = (danceTypeId: number) => {
    const currentDanceTypes = filters.danceTypes || [];
    const isSelected = currentDanceTypes.includes(danceTypeId);
    const newDanceTypes = isSelected
      ? currentDanceTypes.filter((id) => id !== danceTypeId)
      : [...currentDanceTypes, danceTypeId];
    onChangeFilters({ danceTypes: newDanceTypes });
  };

  const handleClearDanceTypes = () => {
    onChangeFilters({ danceTypes: [] });
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
          <Text style={styles.label}>Thể loại</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setDanceTypeModalVisible(true)}
            disabled={danceTypeLoading}
          >
            <Text style={styles.selectorText}>{selectedDanceTypeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.filterColumn}>
          <Text style={styles.label}>Tìm theo tên</Text>
          <View style={styles.searchInputWrapper}>
            <TextInput
              placeholder="Nhập tên biên đạo"
              style={styles.searchInput}
              value={filters.name}
              onChangeText={handleNameChange}
              placeholderTextColor="#9CA3AF"
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn khu vực</Text>
              {filters.areas && filters.areas.length > 0 && (
                <TouchableOpacity onPress={handleClearAreas}>
                  <Text style={styles.modalClearText}>Xóa tất cả</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={areas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = filters.areas?.includes(item.id) || false;
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleAreaToggle(item.id)}
                  >
                    <View style={styles.modalItemContent}>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.modalItemText}>
                        {item.city} - {item.ward}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={danceTypeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDanceTypeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDanceTypeModalVisible(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn thể loại</Text>
              {filters.danceTypes && filters.danceTypes.length > 0 && (
                <TouchableOpacity onPress={handleClearDanceTypes}>
                  <Text style={styles.modalClearText}>Xóa tất cả</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={danceTypes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = filters.danceTypes?.includes(item.id) || false;
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleDanceTypeToggle(item.id)}
                  >
                    <View style={styles.modalItemContent}>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.danceTypeInfo}>
                        <Text style={styles.modalItemText}>{item.type}</Text>
                        {item.description && (
                          <Text style={styles.modalItemDescription}>{item.description}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
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
    color: "#1F2937",
    fontFamily: 'RobotoMono_700Bold',
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
    fontFamily: 'RobotoMono_400Regular',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalClearText: {
    fontSize: 14,
    color: "#F97316",
    fontFamily: 'RobotoMono_700Bold',
  },
  modalItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: 'RobotoMono_700Bold',
  },
  searchInputWrapper: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 15,
    color: "#111827",
    fontFamily: 'RobotoMono_400Regular',
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
    fontFamily: 'RobotoMono_700Bold',
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
    color: "#111827",
    marginBottom: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemText: {
    fontSize: 15,
    color: "#111827",
    fontFamily: 'RobotoMono_400Regular',
  },
  modalItemAll: {
    color: "#F97316",
    fontFamily: 'RobotoMono_700Bold',
  },
  danceTypeInfo: {
    flex: 1,
    gap: 4,
  },
  modalItemDescription: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: 'RobotoMono_400Regular',
  },
});

export default FilterControls;



