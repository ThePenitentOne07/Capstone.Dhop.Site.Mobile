import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Dropdown from "../common/Dropdown";
import useArea from "../../hooks/useArea";
import useBookingGoal from "../../hooks/useBookingGoal";
import useStudentLevel from "../../hooks/useStudentLevel";
import useDanceType from "../../hooks/useDanceType";

export type ProviderType = "CHOREOGRAPHER" | "DANCER";

interface ChoreographerPayload {
  location: string;
  description?: string;
  areaId: number;
  bookingExtraServiceRequests: { extraServiceId: number; quantity: number }[];
  goalId?: number;
  numberOfStudents?: number;
  averageAge?: number;
  studentLevelId?: number;
  studentGender?: "BOTH" | "MALE" | "FEMALE";
  desiredSongLinks?: string[];
  numberOfMaleStudents?: number;
  numberOfFemaleStudents?: number;
  bookingNature?: "STANDARD" | "URGENT";
}

interface DancerPayload {
  location: string;
  description?: string;
  areaId: number;
  bookingExtraServiceRequests: { extraServiceId: number; quantity: number }[];
  goalId?: number;
  referenceLink?: string;
  danceTypeIds?: number[];
  specificSong?: string;
  performanceDurationMinutes?: number;
  bookingNature?: "STANDARD" | "URGENT";
  callTime?: string;
  desiredSongLinks?: string[];
}

interface Step4Props {
  providerType?: ProviderType;
  sessions: { dateISO: string; startTime: string; durationMinutes: number }[];
  onSubmit: (data: ChoreographerPayload | DancerPayload) => void;
  choreographerAreas?: Array<{ id: number; city: string; ward: string }>;
  extraServices?: Array<{
    id: number;
    name: string;
    description?: string;
    price?: number;
  }>;
  goalId?: number;
  numberOfStudents?: number;
  averageAge?: number;
  studentLevelId?: number;
  studentGender?: "BOTH" | "MALE" | "FEMALE";
  desiredSongLinks?: string[];
  numberOfMaleStudents?: number;
  numberOfFemaleStudents?: number;
  bookingNature?: "STANDARD" | "URGENT";
  referenceLink?: string;
  danceTypeIds?: number[];
  specificSong?: string;
  performanceDurationMinutes?: number;
  callTime?: string;
}

export default function Step4({
  providerType = "CHOREOGRAPHER",
  sessions,
  onSubmit,
  choreographerAreas = [],
  extraServices = [],
  goalId,
  numberOfStudents,
  averageAge,
  studentLevelId,
  studentGender,
  desiredSongLinks = [],
  numberOfMaleStudents,
  numberOfFemaleStudents,
  bookingNature,
  referenceLink,
  danceTypeIds = [],
  specificSong,
  performanceDurationMinutes,
  callTime,
}: Step4Props) {
  const isDancer = providerType === "DANCER";
  const { areas, loading } = useArea();
  const { data: bookingGoals, loading: goalsLoading } =
    useBookingGoal(providerType);
  const { data: studentLevels, loading: levelsLoading } = useStudentLevel();
  const { danceTypes, loading: danceTypesLoading } = useDanceType();

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState<number | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [goalIdInput, setGoalIdInput] = useState(goalId?.toString() ?? "");
  const [numberOfStudentsInput, setNumberOfStudentsInput] = useState(
    numberOfStudents?.toString() ?? ""
  );
  const [averageAgeInput, setAverageAgeInput] = useState(
    averageAge?.toString() ?? ""
  );
  const [studentLevelIdInput, setStudentLevelIdInput] = useState(
    studentLevelId?.toString() ?? ""
  );
  const [studentGenderInput, setStudentGenderInput] = useState(
    studentGender ?? ""
  );
  const [numberOfMaleStudentsInput, setNumberOfMaleStudentsInput] = useState(
    numberOfMaleStudents?.toString() ?? ""
  );
  const [numberOfFemaleStudentsInput, setNumberOfFemaleStudentsInput] =
    useState(numberOfFemaleStudents?.toString() ?? "");
  const [bookingNatureInput, setBookingNatureInput] = useState(
    bookingNature ?? "STANDARD"
  );
  const [desiredSongLinksInput, setDesiredSongLinksInput] = useState(
    desiredSongLinks?.join("\n") ?? ""
  );

  // Dancer-specific fields
  const [referenceLinkInput, setReferenceLinkInput] = useState(
    referenceLink ?? ""
  );
  const [danceTypeIdsInput, setDanceTypeIdsInput] = useState(
    danceTypeIds.length ? String(danceTypeIds[0]) : ""
  );
  const [specificSongInput, setSpecificSongInput] = useState(
    specificSong ?? ""
  );
  const [performanceDurationInput, setPerformanceDurationInput] = useState(
    performanceDurationMinutes?.toString() ?? ""
  );
  const [callTimeInput, setCallTimeInput] = useState(callTime ?? "");

  // Filter areas to only include those that the choreographer has
  const areaOptions = useMemo(() => {
    const choreographerAreaIds = new Set(choreographerAreas.map((a) => a.id));
    return areas
      .filter((a) => choreographerAreaIds.has(a.id))
      .map((a) => ({ value: String(a.id), label: `${a.ward} - ${a.city}` }));
  }, [areas, choreographerAreas]);

  const goalOptions = useMemo(
    () =>
      bookingGoals.map((goal) => ({
        value: String(goal.id),
        label: goal.description ?? "",
      })),
    [bookingGoals]
  );

  const studentLevelOptions = useMemo(
    () =>
      studentLevels.map((level) => ({
        value: String(level.id),
        label: level.description ?? "",
      })),
    [studentLevels]
  );

  const bookingExtraServiceRequests = useMemo(
    () => selectedServiceIds.map((id) => ({ extraServiceId: id, quantity: 1 })),
    [selectedServiceIds]
  );

  const danceTypeOptions = useMemo(() => {
    const hasAllowedIds = danceTypeIds && danceTypeIds.length > 0;
    const allowedIds = new Set(danceTypeIds ?? []);
    const filtered = hasAllowedIds
      ? danceTypes.filter((dt) => allowedIds.has(dt.id))
      : danceTypes;
    return filtered.map((dt) => ({
      value: String(dt.id),
      label: dt.type,
    }));
  }, [danceTypes, danceTypeIds]);

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const isValid = location.trim().length > 0 && !!areaId;

  const handleSubmit = () => {
    if (!isValid) return;

    const basePayload = {
      location: location.trim(),
      description: description.trim() || undefined,
      areaId: areaId!,
      bookingExtraServiceRequests,
      goalId: goalIdInput ? parseInt(goalIdInput) : undefined,
    };

    if (isDancer) {
      const dancerPayload: DancerPayload = {
        ...basePayload,
        referenceLink: referenceLinkInput.trim() || undefined,
        danceTypeIds: danceTypeIdsInput.trim()
          ? [parseInt(danceTypeIdsInput)]
          : undefined,
        specificSong: specificSongInput.trim() || undefined,
        performanceDurationMinutes: performanceDurationInput
          ? parseInt(performanceDurationInput)
          : undefined,
        bookingNature:
          (bookingNatureInput as "STANDARD" | "URGENT") || undefined,
        // callTime: callTimeInput.trim() || undefined,
        desiredSongLinks: desiredSongLinksInput.trim()
          ? desiredSongLinksInput.split("\n").filter((link) => link.trim())
          : undefined,
      };
      onSubmit(dancerPayload);
    } else {
      const choreographerPayload: ChoreographerPayload = {
        ...basePayload,
        numberOfStudents: numberOfStudentsInput
          ? parseInt(numberOfStudentsInput)
          : undefined,
        averageAge: averageAgeInput ? parseInt(averageAgeInput) : undefined,
        studentLevelId: studentLevelIdInput
          ? parseInt(studentLevelIdInput)
          : undefined,
        studentGender:
          (studentGenderInput as "BOTH" | "MALE" | "FEMALE") || undefined,
        desiredSongLinks: desiredSongLinksInput.trim()
          ? desiredSongLinksInput.split("\n").filter((link) => link.trim())
          : undefined,
        numberOfMaleStudents: numberOfMaleStudentsInput
          ? parseInt(numberOfMaleStudentsInput)
          : undefined,
        numberOfFemaleStudents: numberOfFemaleStudentsInput
          ? parseInt(numberOfFemaleStudentsInput)
          : undefined,
        bookingNature:
          (bookingNatureInput as "STANDARD" | "URGENT") || undefined,
      };
      onSubmit(choreographerPayload);
    }
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Địa điểm</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa điểm buổi tập..."
          placeholderTextColor="#9CA3AF"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mô tả (tuỳ chọn)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Ghi chú thêm..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Booking Details - Input Fields */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mục tiêu (Goal)</Text>
        <Dropdown
          data={goalOptions}
          onChange={(item) => setGoalIdInput(item.value)}
          placeholder={
            goalsLoading
              ? "Đang tải..."
              : goalIdInput
              ? goalOptions.find((o) => o.value === goalIdInput)?.label ??
                "Chọn mục tiêu"
              : "Chọn mục tiêu"
          }
        />
      </View>

      {!isDancer && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Số lượng học viên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số lượng học viên..."
            placeholderTextColor="#9CA3AF"
            value={numberOfStudentsInput}
            onChangeText={setNumberOfStudentsInput}
            keyboardType="number-pad"
          />
        </View>
      )}

      {!isDancer && (
        <>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tuổi trung bình</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tuổi trung bình..."
              placeholderTextColor="#9CA3AF"
              value={averageAgeInput}
              onChangeText={setAverageAgeInput}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cấp độ học viên</Text>
            <Dropdown
              data={studentLevelOptions}
              onChange={(item) => setStudentLevelIdInput(item.value)}
              placeholder={
                levelsLoading
                  ? "Đang tải..."
                  : studentLevelIdInput
                  ? studentLevelOptions.find(
                      (o) => o.value === studentLevelIdInput
                    )?.label ?? "Chọn cấp độ"
                  : "Chọn cấp độ"
              }
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderRow}>
              {["MALE", "FEMALE", "BOTH"].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderBtn,
                    studentGenderInput === gender && styles.genderBtnSelected,
                  ]}
                  onPress={() => setStudentGenderInput(gender)}
                >
                  <Text
                    style={[
                      styles.genderText,
                      studentGenderInput === gender &&
                        styles.genderTextSelected,
                    ]}
                  >
                    {gender === "MALE"
                      ? "Nam"
                      : gender === "FEMALE"
                      ? "Nữ"
                      : "Cả hai"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {isDancer && (
        <>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Link tham khảo</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập link YouTube..."
              placeholderTextColor="#9CA3AF"
              value={referenceLinkInput}
              onChangeText={setReferenceLinkInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Loại múa (ID, cách nhau bằng dấu phẩy)
            </Text>
            <Dropdown
              data={danceTypeOptions}
              onChange={(item) => setDanceTypeIdsInput(item.value)}
              placeholder={
                danceTypesLoading
                  ? "Đang tải..."
                  : danceTypeOptions.length
                  ? "Chọn loại múa"
                  : "Không có loại múa khả dụng"
              }
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bài hát cụ thể</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Shape of You - Ed Sheeran"
              placeholderTextColor="#9CA3AF"
              value={specificSongInput}
              onChangeText={setSpecificSongInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Thời lượng biểu diễn (phút)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập thời lượng..."
              placeholderTextColor="#9CA3AF"
              value={performanceDurationInput}
              onChangeText={setPerformanceDurationInput}
              keyboardType="number-pad"
            />
          </View>

          {/* <View style={styles.fieldGroup}>
            <Text style={styles.label}>Thời gian xuất hiện (ISO format)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-12-15T13:00:00"
              placeholderTextColor="#9CA3AF"
              value={callTimeInput}
              onChangeText={setCallTimeInput}
            />
          </View> */}
        </>
      )}

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Bài hát yêu cầu (một URL mỗi dòng)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Dán URL YouTube mỗi dòng..."
          placeholderTextColor="#9CA3AF"
          value={desiredSongLinksInput}
          onChangeText={setDesiredSongLinksInput}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Khu vực</Text>
        <Dropdown
          data={areaOptions}
          onChange={(item) => setAreaId(parseInt(item.value))}
          placeholder={
            loading
              ? "Đang tải..."
              : areaId
              ? areaOptions.find((o) => o.value === String(areaId))?.label ??
                "Chọn khu vực"
              : "Chọn khu vực"
          }
        />
      </View>

      {!!extraServices.length && (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Dịch vụ bổ sung</Text>
          <View style={styles.servicesList}>
            {extraServices.map((service) => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selected && styles.serviceCardSelected,
                  ]}
                  onPress={() => toggleService(service.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                  </View>
                  <Text style={styles.servicePrice}>
                    {service.price
                      ? `${service.price.toLocaleString("vi-VN")}₫`
                      : "Liên hệ"}
                  </Text>
                  {!!service.description && (
                    <Text style={styles.serviceDescription}>
                      {service.description}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected,
                    ]}
                  >
                    {selected && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
        disabled={!isValid}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.submitText, !isValid && styles.submitTextDisabled]}
        >
          Xác nhận đặt lịch
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    fontFamily: "RobotoMono_400Regular",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#1F2937",
    fontSize: 14,
    fontFamily: "RobotoMono_400Regular",
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
  submitTextDisabled: {
    color: "#9CA3AF",
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    position: "relative",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  serviceCardSelected: {
    borderColor: "#FF7A00",
    backgroundColor: "#FFF7ED",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    color: "#1F2937",
    flex: 1,
    paddingRight: 12,
    fontFamily: "RobotoMono_700Bold",
  },
  servicePrice: {
    fontSize: 14,
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
  },
  serviceDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
    fontFamily: "RobotoMono_400Regular",
  },
  checkbox: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxSelected: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },
  checkboxTick: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  genderBtnSelected: {
    borderColor: "#FF7A00",
    backgroundColor: "#FFF7ED",
  },
  genderText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "RobotoMono_500Medium",
  },
  genderTextSelected: {
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
  },
  bookingNatureRow: {
    flexDirection: "row",
    gap: 8,
  },
  natureBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  natureBtnSelected: {
    borderColor: "#FF7A00",
    backgroundColor: "#FFF7ED",
  },
  natureText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "RobotoMono_500Medium",
  },
  natureTextSelected: {
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
  },
});
