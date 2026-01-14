import { useCallback, useEffect, useState } from 'react';
import { BookingGoal, getBookingGoalsActive } from '../service/api';

type ProviderType = 'DANCER' | 'CHOREOGRAPHER';

interface UseBookingGoalReturn {
  data: BookingGoal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch active booking goals for a provider type.
 * providerType should be 'DANCER' or 'CHOREOGRAPHER'.
 */
export default function useBookingGoal(providerType: ProviderType): UseBookingGoalReturn {
  const [data, setData] = useState<BookingGoal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!providerType) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getBookingGoalsActive(providerType);
      const result = res?.data?.result ?? res?.data ?? [];
      setData(Array.isArray(result) ? result : []);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Không thể tải booking goals.';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [providerType]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return { data, loading, error, refetch: fetchGoals };
}












