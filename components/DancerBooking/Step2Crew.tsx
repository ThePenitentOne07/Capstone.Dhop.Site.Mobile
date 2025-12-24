import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { getDancerById } from "../../service/api";

const ACTIVE_STATUS = "Thành viên đang hoạt động";

interface CrewMember {
  crewId: number;
  dancerName: string;
  dancerStatus?: string;
  description?: string;
}

export interface Step2CrewSelection {
  crewMembers: number;
  selectionMode: "auto" | "manual";
  selectedCrewIds: number[];
}

interface Step2CrewProps {
  dancerId: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  onNext: (selection: Step2CrewSelection) => void;
}

export default function Step2Crew({
  dancerId,
  defaultValue = 4,
  min = 1,
  max = 30,
  onNext,
}: Step2CrewProps) {
  const [crewMembers, setCrewMembers] = useState(defaultValue);
  const [crewMembersInput, setCrewMembersInput] = useState(
    defaultValue.toString()
  );
  const [selectionMode, setSelectionMode] = useState<"auto" | "manual">("auto");
  const [crewList, setCrewList] = useState<CrewMember[]>([]);
  const [selectedCrewIds, setSelectedCrewIds] = useState<number[]>([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [crewError, setCrewError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrew = async () => {
      if (!dancerId) return;
      try {
        setLoadingCrew(true);
        setCrewError(null);
        const response = await getDancerById(dancerId);
        const result = response.data?.result ?? response.data;
        const crews: CrewMember[] = Array.isArray(result?.crews)
          ? result.crews
          : [];
        const activeCrews = crews.filter(
          (crew) => crew.dancerStatus?.trim() === ACTIVE_STATUS
        );
        setCrewList(activeCrews);
      } catch (error) {
        console.error("Failed to fetch crew list:", error);
        setCrewError("Không thể tải danh sách thành viên đang hoạt động");
        setCrewList([]);
      } finally {
        setLoadingCrew(false);
      }
    };

    fetchCrew();
  }, [dancerId]);

  useEffect(() => {
    if (selectionMode === "manual") {
      setSelectedCrewIds((prev) => prev.slice(0, crewMembers));
    } else {
      setSelectedCrewIds([]);
    }
  }, [crewMembers, selectionMode]);

  const handleToggleCrew = (crewId: number) => {
    setSelectedCrewIds((prev) => {
      if (prev.includes(crewId)) {
        return prev.filter((id) => id !== crewId);
      }
      if (prev.length >= crewMembers) {
        return prev;
      }
      return [...prev, crewId];
    });
  };

  const handleDecrease = () => {
    const newValue = Math.max(min, crewMembers - 1);
    setCrewMembers(newValue);
    setCrewMembersInput(newValue.toString());
  };

  const handleIncrease = () => {
    const newValue = Math.min(max, crewMembers + 1);
    setCrewMembers(newValue);
    setCrewMembersInput(newValue.toString());
  };

  const handleInputChange = (text: string) => {
    setCrewMembersInput(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      setCrewMembers(num);
    }
  };

  const canProceed = true;
  const nextDisabled = false;

  const handleNext = () => {
    if (!canProceed) return;
    onNext({
      crewMembers,
      selectionMode,
      selectedCrewIds,
    });
  };

  const renderCrewList = () => {
    if (loadingCrew) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#FF7A00" />
          <Text style={styles.loaderText}>
            Đang tải danh sách thành viên...
          </Text>
        </View>
      );
    }

    if (crewError) {
      return <Text style={styles.errorText}>{crewError}</Text>;
    }

    if (!crewList.length) {
      return (
        <Text style={styles.helperText}>
          Không có thành viên hoạt động để lựa chọn. Bạn có thể chọn chế độ tự
          động.
        </Text>
      );
    }

    return (
      <View style={styles.crewList}>
        {crewList.map((crew) => {
          const isSelected = selectedCrewIds.includes(crew.crewId);
          const disabled = !isSelected && selectedCrewIds.length >= crewMembers;
          return (
            <TouchableOpacity
              key={crew.crewId}
              style={[
                styles.crewCard,
                isSelected && styles.crewCardSelected,
                disabled && styles.crewCardDisabled,
              ]}
              activeOpacity={0.8}
              onPress={() => !disabled && handleToggleCrew(crew.crewId)}
            >
              <View style={styles.crewInfo}>
                <Text style={styles.crewName}>{crew.dancerName}</Text>
                {!!crew.description && (
                  <Text style={styles.crewDescription} numberOfLines={2}>
                    {crew.description}
                  </Text>
                )}
                <Text style={styles.crewStatus}>{crew.dancerStatus}</Text>
              </View>
              <View
                style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              >
                {isSelected && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Số lượng thành viên</Text>
        <Text style={styles.subtitle}>
          Nhóm nhảy sẽ biểu diễn với bao nhiêu người?
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Chọn số thành viên</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={handleDecrease}
            activeOpacity={0.8}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.counterInput}
            value={crewMembersInput}
            onChangeText={handleInputChange}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="0"
            placeholderTextColor="#D1D5DB"
          />
          <TouchableOpacity
            style={styles.counterButton}
            onPress={handleIncrease}
            activeOpacity={0.8}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        {/* <Text style={styles.helperText}>
          Từ {min} đến {max} thành viên (tuỳ thuộc vào quy mô sân khấu).
        </Text> */}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Cách chọn thành viên</Text>
        <Text style={styles.helperText}>
          Chúng tôi sẽ đề xuất {crewMembers} thành viên đang hoạt động phù hợp
          nhất với lịch biểu diễn của bạn.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
        onPress={handleNext}
        activeOpacity={0.9}
        disabled={nextDisabled}
      >
        <Text style={styles.nextButtonText}>Tiếp theo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: "#1F2937",
    marginBottom: 8,
    fontFamily: "RobotoMono_700Bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  card: {
    backgroundColor: "#FFF9EF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE1BC",
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "RobotoMono_700Bold",
    marginBottom: 16,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    fontSize: 32,
    color: "#FFFFFF",
    fontFamily: "RobotoMono_700Bold",
    marginTop: -4,
  },
  counterValueContainer: {
    alignItems: "center",
  },
  counterValue: {
    fontSize: 48,
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
  },
  counterValueLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  counterInput: {
    flex: 1,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 32,
    fontFamily: "RobotoMono_700Bold",
    color: "#FF7A00",
    textAlign: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE1BC",
    backgroundColor: "#FFFFFF",
  },
  helperText: {
    marginTop: 16,
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  manualHelper: {
    marginTop: 12,
    fontSize: 13,
    color: "#1F2937",
    fontFamily: "RobotoMono_500Medium",
  },
  nextButton: {
    marginTop: 24,
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  selectionToggle: {
    borderWidth: 1,
    borderColor: "#FFE1BC",
    borderRadius: 12,
    overflow: "hidden",
  },
  toggleButton: {
    padding: 16,
    backgroundColor: "#FFF",
  },
  toggleButtonActive: {
    backgroundColor: "#FFE6CC",
  },
  toggleButtonText: {
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
    color: "#6B7280",
  },
  toggleButtonTextActive: {
    color: "#FF7A00",
  },
  toggleHint: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  crewList: {
    marginTop: 16,
  },
  crewCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE1BC",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  crewCardSelected: {
    borderColor: "#FF7A00",
    backgroundColor: "#FFF5EB",
  },
  crewCardDisabled: {
    opacity: 0.5,
  },
  crewInfo: {
    flex: 1,
    marginRight: 12,
  },
  crewName: {
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  crewDescription: {
    fontSize: 13,
    fontFamily: "RobotoMono_400Regular",
    color: "#4B5563",
    marginBottom: 4,
  },
  crewStatus: {
    fontSize: 12,
    fontFamily: "RobotoMono_500Medium",
    color: "#059669",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#FF7A00",
    backgroundColor: "#FF7A00",
  },
  checkboxTick: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
  loaderContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  loaderText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  errorText: {
    marginTop: 16,
    fontSize: 13,
    color: "#DC2626",
    fontFamily: "RobotoMono_500Medium",
  },
  warningText: {
    marginTop: 8,
    fontSize: 13,
    color: "#D97706",
    fontFamily: "RobotoMono_500Medium",
  },
});
