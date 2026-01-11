import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  getDancerBookingTotalPrice,
  createDancerBooking,
  DancerBooking,
} from "../../service/api";
import { useFormatCurrency } from "../../hooks/useFormatCurrency";
import Successful from "../ChoreoGrapherBooking/Successful";

interface ActItem {
  songName: string;
  danceTypeId: number;
  durationMinutes: number;
  description: string;
  referenceLink: string;
  orderIndex: number;
}

interface Step5DancerProps {
  dancerId: string;
  areaId: number;
  location: string;
  detail?: string | null;
  sessions: { dateISO: string; startTime: string; durationMinutes: number }[];
  bookingExtraServiceRequests?: { extraServiceId: number; quantity: number }[];
  crewMembers?: number;
  selectionMode?: "auto" | "manual";

  dancerName?: string;
  price?: number;
  yearExperience?: number;
  danceType?: any[];
  bookingNature: "STANDARD" | "URGENT";
  goalId?: number;
  referenceLink?: string;

  specificSong?: string;
  performanceDurationMinutes?: number;
  callTime?: string;
  desiredSongLinks?: string[];
  actItems?: ActItem[];
}

function addMinutesToTime(hhmm: string, minutesToAdd: number): string {
  const [hh, mm] = hhmm.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return hhmm;
  const total = hh * 60 + mm + minutesToAdd;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const nm = String(normalized % 60).padStart(2, "0");
  return `${nh}:${nm}`;
}

export default function Step5Dancer({
  dancerId,
  areaId,
  location,
  detail,
  sessions,
  bookingExtraServiceRequests = [],
  crewMembers,
  selectionMode,

  dancerName,
  price,
  yearExperience,
  danceType,
  bookingNature,
  goalId,
  referenceLink,

  specificSong,
  performanceDurationMinutes,
  callTime,
  desiredSongLinks = [],
  actItems = [],
}: Step5DancerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [totalSessions, setTotalSessions] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean | null>(null);
  const { formatCurrency } = useFormatCurrency();
  const payloadRef = useRef<string>("");
  const hasCalculatedRef = useRef(false);

  // Build crewId & numberOfPeople based on selection mode

  const numberOfPeople = crewMembers;
  const payload: DancerBooking = useMemo(() => {
    const firstSession = sessions[0];
    const bookingDate = firstSession ? firstSession.dateISO.split("T")[0] : "";
    const startTime = firstSession?.startTime ?? "";
    const endTime = firstSession
      ? addMinutesToTime(firstSession.startTime, firstSession.durationMinutes)
      : "";

    return {
      dancerId,
      areaId: String(areaId),
      location,
      detail: detail ?? null,
      bookingDate,
      startTime,
      endTime,
      bookingExtraServiceRequests,
      // crewMembers,

      numberOfPeople,
      bookingNature,
      goalId,
      referenceLink,
      customerPrice: price,
      specificSong,
      performanceDurationMinutes,
      callTime,
      desiredSongLinks,
      actItems,
    };
  }, [
    dancerId,
    areaId,
    location,
    detail,
    sessions,
    bookingExtraServiceRequests,
    // crewMembers,

    numberOfPeople,
    bookingNature,
    goalId,
    referenceLink,
    price,
    specificSong,
    performanceDurationMinutes,
    callTime,
    desiredSongLinks,
    actItems,
  ]);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDancerBookingTotalPrice(payload);
      // Expecting API to return { totalPrice: number } or similar
      const value = res?.data?.totalPrice ?? res?.data?.data ?? res?.data;

      if (typeof value === "number") {
        setTotalPrice(value);
        setError(null); // Clear error on success
      } else {
        setError("Không thể đọc tổng giá từ phản hồi.");
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "Đã xảy ra lỗi khi tính tổng giá."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Create a stable string representation of the payload
    const payloadString = JSON.stringify(payload);

    // Only recalculate if the payload actually changed
    if (payloadRef.current !== payloadString) {
      payloadRef.current = payloadString;
      hasCalculatedRef.current = true;
      handleCalculate();
      console.log("payload dancer booking", payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dancerId,
    areaId,
    location,
    detail,
    sessions,
    bookingExtraServiceRequests,

    numberOfPeople,
    bookingNature,
    goalId,
    referenceLink,

    specificSong,
    performanceDurationMinutes,
    callTime,
    desiredSongLinks,
  ]);

  useEffect(() => {
    setTotalSessions(sessions?.length ?? 0);
  }, [sessions]);

  const handleBook = async () => {
    setBookingLoading(true);
    setError(null);
    setBookingSuccess(null);
    try {
      await createDancerBooking(payload);

      setBookingSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Đặt lịch thất bại.");
      setBookingSuccess(false);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      {bookingSuccess === true ? (
        <Successful totalPrice={totalPrice ?? 0} sessions={sessions} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>Tổng giá tiền là:</Text>
          <Text style={styles.subtitle}>{totalSessions} buổi </Text>
          {/* <Text style={styles.subtitle}>{formatCurrency(totalPrice ?? 0)}</Text> */}

          <Text style={styles.metaText}>
            Số thành viên yêu cầu: {crewMembers ?? "Không xác định"}
          </Text>
          <View style={styles.sessionsList}>
            {sessions.map((s, idx) => {
              const d = new Date(s.dateISO);
              const dateStr = d.toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              return (
                <Text key={idx} style={styles.sessionItem}>
                  {dateStr} • {s.startTime} • {s.durationMinutes} phút
                </Text>
              );
            })}
          </View>

          {typeof totalPrice === "number" && (
            <View style={styles.result}>
              <Text style={styles.resultLabel}>Tổng giá ước tính</Text>
              <Text style={styles.resultValue}>
                {" "}
                {formatCurrency(totalPrice ?? 0)}
              </Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.bookBtn,
              (bookingLoading || totalPrice == null) && styles.bookBtnDisabled,
            ]}
            onPress={handleBook}
            disabled={bookingLoading || totalPrice == null}
            activeOpacity={0.8}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.bookBtnText}>Đặt lịch!</Text>
            )}
          </TouchableOpacity>

          {/* Success handled by rendering <Successful /> above */}
        </View>
      )}
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
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  title: {
    fontSize: 20,
    color: "#1F2937",
    marginBottom: 8,
    fontFamily: "RobotoMono_700Bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    fontFamily: "RobotoMono_400Regular",
  },
  loadingRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: "#6B7280",
    fontFamily: "RobotoMono_400Regular",
  },
  result: {
    marginTop: 16,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  resultLabel: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 4,
    fontFamily: "RobotoMono_400Regular",
  },
  resultValue: {
    fontSize: 20,
    color: "#78350F",
    fontFamily: "RobotoMono_700Bold",
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
    fontFamily: "RobotoMono_400Regular",
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "RobotoMono_700Bold",
  },
  sessionsList: {
    marginTop: 8,
  },
  sessionItem: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
    fontFamily: "RobotoMono_400Regular",
  },
  metaText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    fontFamily: "RobotoMono_400Regular",
  },
  bookBtn: {
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 16,
  },
  bookBtnDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "RobotoMono_700Bold",
  },
  successText: {
    marginTop: 12,
    color: "#059669",
    fontFamily: "RobotoMono_700Bold",
  },
});
