import React, { useMemo, useState, useCallback } from "react";
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
  customerPrice?: number;
}

interface ActItem {
  songName: string;
  danceTypeId: number;
  durationMinutes: number;
  description: string;
  referenceLink: string;
  orderIndex: number;
}

interface DancerPayload {
  location: string;
  description?: string;
  areaId: number;
  bookingExtraServiceRequests: { extraServiceId: number; quantity: number }[];
  goalId?: number;
  danceTypeIds?: number[];
  performanceDurationMinutes?: number;
  bookingNature?: "STANDARD" | "URGENT";
  callTime?: string;
  actItems?: ActItem[];
  customerPrice?: number;
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
  danceTypeIds?: number[];
  performanceDurationMinutes?: number;
  callTime?: string;
  customerPrice?: number;
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
  danceTypeIds = [],
  performanceDurationMinutes,
  callTime,
  customerPrice,
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

  // Dancer-specific fields
  const [callTimeInput, setCallTimeInput] = useState(callTime ?? "");
  const [customerPriceInput, setCustomerPriceInput] = useState(
    customerPrice?.toString() ?? ""
  );

  // ActItems state for dancer booking
  const [actItems, setActItems] = useState<ActItem[]>([]);
  const [newActItem, setNewActItem] = useState<Partial<ActItem>>({
    songName: "",
    danceTypeId: undefined,
    durationMinutes: 0,
    description: "",
    referenceLink: "",
  });
  console.log(parseInt(customerPriceInput));

  // Calculate total performance duration from sessions
  const totalSessionDuration = useMemo(() => {
    return sessions.reduce(
      (total, session) => total + session.durationMinutes,
      0
    );
  }, [sessions]);

  const performanceDurationDisplay = useMemo(() => {
    return String(totalSessionDuration);
  }, [totalSessionDuration]);

  // Calculate total act items duration
  const totalActItemsDuration = useMemo(() => {
    return actItems.reduce((total, item) => total + item.durationMinutes, 0);
  }, [actItems]);

  // Calculate available time for act items (performanceDuration - 15 minutes buffer)
  const availableActItemsDuration = useMemo(() => {
    return Math.max(0, totalSessionDuration - 15);
  }, [totalSessionDuration]);

  // Check if we can add more act items
  const canAddMoreActItems = totalActItemsDuration < availableActItemsDuration;

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

  // For actItems, always use all available dance types without filtering
  const actItemsDanceTypeOptions = useMemo(() => {
    return danceTypes.map((dt) => ({
      value: String(dt.id),
      label: dt.type,
    }));
  }, [danceTypes]);

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleNewActItemChange = useCallback(
    (field: keyof ActItem, value: any) => {
      setNewActItem((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const addActItem = useCallback(() => {
    if (
      !newActItem.songName?.trim() ||
      !newActItem.danceTypeId ||
      !newActItem.durationMinutes ||
      !newActItem.description?.trim() ||
      !newActItem.referenceLink?.trim()
    ) {
      return;
    }

    // Check if adding this act item would exceed the available duration
    if (
      totalActItemsDuration + newActItem.durationMinutes >
      availableActItemsDuration
    ) {
      return;
    }

    const item: ActItem = {
      songName: newActItem.songName.trim(),
      danceTypeId: newActItem.danceTypeId,
      durationMinutes: newActItem.durationMinutes,
      description: newActItem.description.trim(),
      referenceLink: newActItem.referenceLink.trim(),
      orderIndex: actItems.length + 1,
    };
    setActItems([...actItems, item]);
    setNewActItem({
      songName: "",
      danceTypeId: undefined,
      durationMinutes: 0,
      description: "",
      referenceLink: "",
    });
  }, [newActItem, totalActItemsDuration, availableActItemsDuration, actItems]);

  const removeActItem = useCallback((index: number) => {
    setActItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      const reordered = updated.map((item, i) => ({
        ...item,
        orderIndex: i + 1,
      }));
      return reordered;
    });
  }, []);

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
        performanceDurationMinutes: totalSessionDuration || undefined,
        bookingNature:
          (bookingNatureInput as "STANDARD" | "URGENT") || undefined,
        // callTime: callTimeInput.trim() || undefined,
        actItems: actItems.length > 0 ? actItems : undefined,
        customerPrice: customerPriceInput
          ? parseInt(customerPriceInput)
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
        numberOfMaleStudents: numberOfMaleStudentsInput
          ? parseInt(numberOfMaleStudentsInput)
          : undefined,
        numberOfFemaleStudents: numberOfFemaleStudentsInput
          ? parseInt(numberOfFemaleStudentsInput)
          : undefined,
        bookingNature:
          (bookingNatureInput as "STANDARD" | "URGENT") || undefined,
        customerPrice: customerPriceInput
          ? parseInt(customerPriceInput)
          : undefined,
        desiredSongLinks:
          desiredSongLinks.length > 0 ? desiredSongLinks : undefined,
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

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Giá tiền (tuỳ chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập giá tiền..."
          placeholderTextColor="#9CA3AF"
          value={customerPriceInput}
          onChangeText={setCustomerPriceInput}
          keyboardType="decimal-pad"
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
            <Text style={styles.label}>Thể loại nhảy</Text>
            <Dropdown
              data={danceTypeOptions}
              onChange={(item) => {
                // For choreographer, we might want to store selected dance types
                // This could be added to the payload if needed
              }}
              placeholder={
                danceTypesLoading
                  ? "Đang tải..."
                  : "Chọn thể loại nhảy (tuỳ chọn)"
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
            <Text style={styles.label}>Thời lượng biểu diễn (phút)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              placeholder="Nhập thời lượng..."
              placeholderTextColor="#9CA3AF"
              value={performanceDurationDisplay}
              editable={false}
            />
          </View>

          {/* Act Items Section for Dancer */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Các tiết mục biểu diễn</Text>

            {/* Display Added Act Items */}
            {actItems.length > 0 && (
              <View style={styles.actItemsList}>
                {actItems.map((item, index) => (
                  <View key={index} style={styles.actItemCard}>
                    <View style={styles.actItemHeader}>
                      <Text style={styles.actItemIndex}>
                        #{item.orderIndex}
                      </Text>
                      <Text style={styles.actItemSong}>{item.songName}</Text>
                      <TouchableOpacity
                        onPress={() => removeActItem(index)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.actItemRemove}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.actItemDetails}>
                      <Text style={styles.actItemDetailText}>
                        Thể loại:{" "}
                        {danceTypeOptions.find(
                          (o) => o.value === String(item.danceTypeId)
                        )?.label || `ID: ${item.danceTypeId}`}
                      </Text>
                      <Text style={styles.actItemDetailText}>
                        Thời lượng: {item.durationMinutes} phút
                      </Text>
                    </View>
                    <Text style={styles.actItemDesc}>{item.description}</Text>
                    <Text style={styles.actItemLink} numberOfLines={1}>
                      {item.referenceLink}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Add New Act Item Form */}
            <View style={styles.addActItemContainer}>
              <Text style={styles.addActItemTitle}>
                {actItems.length > 0
                  ? "Thêm tiết mục khác"
                  : "Thêm tiết mục mới"}
              </Text>

              {/* Time Remaining Info */}
              <View style={styles.timeRemainingContainer}>
                <Text style={styles.timeRemainingText}>
                  Thời gian sẵn có:{" "}
                  <Text style={styles.timeRemainingValue}>
                    {availableActItemsDuration} phút
                  </Text>
                </Text>
                <Text style={styles.timeRemainingText}>
                  Đã sử dụng:{" "}
                  <Text style={styles.timeUsedValue}>
                    {totalActItemsDuration} phút
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.timeRemainingText,
                    availableActItemsDuration - totalActItemsDuration <= 0 &&
                      styles.timeWarning,
                  ]}
                >
                  Còn lại:{" "}
                  <Text style={styles.timeRemainingValue}>
                    {Math.max(
                      0,
                      availableActItemsDuration - totalActItemsDuration
                    )}{" "}
                    phút
                  </Text>
                </Text>
              </View>

              <View style={styles.fieldGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Tên bài hát (bắt buộc)"
                  placeholderTextColor="#9CA3AF"
                  value={newActItem.songName || ""}
                  onChangeText={(text) =>
                    handleNewActItemChange("songName", text)
                  }
                />
              </View>

              <View style={styles.fieldGroup}>
                <Dropdown
                  data={actItemsDanceTypeOptions}
                  onChange={(item) =>
                    handleNewActItemChange("danceTypeId", parseInt(item.value))
                  }
                  placeholder={
                    danceTypesLoading
                      ? "Đang tải..."
                      : "Chọn loại múa (bắt buộc)"
                  }
                />
              </View>

              <View style={styles.fieldGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Thời lượng (phút, bắt buộc)"
                  placeholderTextColor="#9CA3AF"
                  value={String(newActItem.durationMinutes || "")}
                  onChangeText={(text) =>
                    handleNewActItemChange(
                      "durationMinutes",
                      text ? parseInt(text) : 0
                    )
                  }
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.fieldGroup}>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Mô tả tiết mục (bắt buộc)"
                  placeholderTextColor="#9CA3AF"
                  value={newActItem.description || ""}
                  onChangeText={(text) =>
                    handleNewActItemChange("description", text)
                  }
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.fieldGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Link tham khảo (YouTube, bắt buộc)"
                  placeholderTextColor="#9CA3AF"
                  value={newActItem.referenceLink || ""}
                  onChangeText={(text) =>
                    handleNewActItemChange("referenceLink", text)
                  }
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.addActItemBtn,
                  !newActItem.songName?.trim() ||
                  !newActItem.danceTypeId ||
                  !newActItem.durationMinutes ||
                  !newActItem.description?.trim() ||
                  !newActItem.referenceLink?.trim() ||
                  !canAddMoreActItems
                    ? styles.addActItemBtnDisabled
                    : null,
                ]}
                onPress={addActItem}
                disabled={
                  !newActItem.songName?.trim() ||
                  !newActItem.danceTypeId ||
                  !newActItem.durationMinutes ||
                  !newActItem.description?.trim() ||
                  !newActItem.referenceLink?.trim() ||
                  !canAddMoreActItems
                }
              >
                <Text style={styles.addActItemBtnText}>+ Thêm tiết mục</Text>
              </TouchableOpacity>

              {!canAddMoreActItems && actItems.length > 0 && (
                <Text style={styles.durationWarningText}>
                  ⚠️ Đã đạt giới hạn thời gian cho tiết mục
                </Text>
              )}
            </View>
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
  readOnlyInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
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
  // ActItems Styles
  actItemsList: {
    gap: 12,
    marginBottom: 16,
  },
  actItemCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
  },
  actItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  actItemIndex: {
    fontSize: 12,
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actItemSong: {
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "RobotoMono_700Bold",
    flex: 1,
  },
  actItemRemove: {
    fontSize: 18,
    color: "#EF4444",
    fontFamily: "RobotoMono_700Bold",
  },
  actItemDetails: {
    marginBottom: 8,
    gap: 4,
  },
  actItemDetailText: {
    fontSize: 12,
    color: "#4B5563",
    fontFamily: "RobotoMono_400Regular",
  },
  actItemDesc: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
    marginBottom: 6,
    lineHeight: 16,
  },
  actItemLink: {
    fontSize: 11,
    color: "#3B82F6",
    fontFamily: "RobotoMono_400Regular",
  },
  addActItemContainer: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD8B4",
    padding: 14,
  },
  timeRemainingContainer: {
    backgroundColor: "#F0F9FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
    marginBottom: 12,
  },
  timeRemainingText: {
    fontSize: 12,
    color: "#4B5563",
    fontFamily: "RobotoMono_400Regular",
    marginBottom: 6,
  },
  timeRemainingValue: {
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
  },
  timeUsedValue: {
    color: "#EF4444",
    fontFamily: "RobotoMono_700Bold",
  },
  timeWarning: {
    color: "#EF4444",
  },
  durationWarningText: {
    fontSize: 12,
    color: "#EF4444",
    fontFamily: "RobotoMono_500Medium",
    marginTop: 8,
    textAlign: "center",
  },
  addActItemTitle: {
    fontSize: 13,
    color: "#FF7A00",
    fontFamily: "RobotoMono_700Bold",
    marginBottom: 12,
  },
  addActItemBtn: {
    backgroundColor: "#FF7A00",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  addActItemBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  addActItemBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
});
