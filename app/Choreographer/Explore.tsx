import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
} from "react-native";
import { Stack } from "expo-router";
import useArea from "../../hooks/useArea";
import FilterControls from "../../components/ChoreographerExplore/FilterControls";
import ChoreographerCard, {
  ChoreographerListItem,
} from "../../components/ChoreographerExplore/ChoreographerCard";
import { FilterState } from "../../components/ChoreographerExplore/types";
import {
  getChoreographyUsers,
  ChoreographyUsersQuery,
} from "../../service/api";

interface ApiResponse {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElements: number;
  items: ChoreographerListItem[];
}

const PAGE_SIZE = 10;

const defaultFilters: FilterState = {
  areas: null,
  name: "",
  // minExperience: "",
  // maxExperience: "",
};

const ExploreChoreographersScreen = () => {
  const { areas, loading: areasLoading } = useArea();

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedName, setDebouncedName] = useState(
    defaultFilters.name ?? ""
  );
  const [items, setItems] = useState<ChoreographerListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);

  const safeParseNumber = useCallback((value: string) => {
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedName(filters.name?.trim() ?? "");
    }, 1000);
    return () => clearTimeout(handle);
  }, [filters.name]);

  const queryFilters: ChoreographyUsersQuery = useMemo(
    () => ({
      areas: filters.areas,
      // minExperience: safeParseNumber(filters.minExperience),
      // maxExperience: safeParseNumber(filters.maxExperience),
      name: debouncedName || undefined,
    }),
    [filters.areas, debouncedName /* safeParseNumber */]
  );

  useEffect(() => {
    console.log("Filters changed:", filters);
  }, [filters]);

  const queryKey = useMemo(
    () => JSON.stringify(queryFilters),
    [queryFilters]
  );

  const loadPage = useCallback(
    async (pageToLoad: number, mode: "initial" | "refresh" | "loadMore") => {
      if (inFlight.current) return;
      inFlight.current = true;

      if (mode === "initial") {
        setLoading(true);
        setError(null);
      }
      if (mode === "refresh") {
        setRefreshing(true);
        setError(null);
      }
      if (mode === "loadMore") {
        setLoadingMore(true);
      }

      try {
        const requestParams = {
          pageNo: pageToLoad,
          pageSize: PAGE_SIZE,
          ...queryFilters,
        } as ChoreographyUsersQuery & { pageNo: number; pageSize: number };
        console.log("Fetching choreographers with params:", requestParams);

        const response = await getChoreographyUsers(requestParams);
        const payload: ApiResponse = response.data;
        const nextItems = Array.isArray(payload?.items) ? payload.items : [];
        setTotalPages(payload?.totalPage ?? pageToLoad);
        setPage(pageToLoad);

        if (pageToLoad === 1) {
          setItems(nextItems);
        } else {
          setItems((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const merged = [...prev];
            nextItems.forEach((item) => {
              if (!existingIds.has(item.id)) {
                merged.push(item);
              }
            });
            return merged;
          });
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách biên đạo.";
        setError(message);
      } finally {
        if (mode === "initial") {
          setLoading(false);
        }
        if (mode === "refresh") {
          setRefreshing(false);
        }
        if (mode === "loadMore") {
          setLoadingMore(false);
        }
        inFlight.current = false;
      }
    },
    [queryFilters]
  );

  useEffect(() => {
    loadPage(1, "initial");
  }, [queryKey, loadPage]);

  const handleLoadMore = () => {
    if (loadingMore || loading || refreshing) return;
    if (page >= totalPages) return;
    loadPage(page + 1, "loadMore");
  };

  const handleRefresh = () => {
    loadPage(1, "refresh");
  };

  const handleChangeFilters = (next: Partial<FilterState>) => {
    console.log("Applying filter diff:", next);
    setFilters((prev) => ({
      ...prev,
      ...next,
    }));
  };

  const handleClearFilters = () => {
    console.log("Clearing filters to defaults:", defaultFilters);
    setFilters({ ...defaultFilters });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Tìm biên đạo",
          headerStyle: {
            backgroundColor: "#FF7A00",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontFamily: "RobotoMono_700Bold",
          },
        }}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && !loading ? styles.listContentEmpty : null,
        ]}
        ListHeaderComponent={
          <FilterControls
            filters={filters}
            onChangeFilters={handleChangeFilters}
            onClearFilters={handleClearFilters}
            areas={areas}
            areaLoading={areasLoading}
          />
        }
        renderItem={({ item }) => <ChoreographerCard item={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Không tìm thấy biên đạo phù hợp</Text>
              <Text style={styles.emptySubtitle}>
                Thử điều chỉnh lại bộ lọc hoặc làm mới danh sách.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color="#FF7A00" />
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#FF7A00" size="large" />
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoading: {
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#111827",
    fontFamily: 'RobotoMono_700Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  errorBanner: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 30,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(248,113,113,0.95)",
  },
  errorText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: 'RobotoMono_700Bold',
  },
});

export default ExploreChoreographersScreen;

