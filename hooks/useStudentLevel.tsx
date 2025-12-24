import { useCallback, useEffect, useState } from 'react';
import { StudentLevel, getStudentLevelsActive } from '../service/api';

interface UseStudentLevelReturn {
  data: StudentLevel[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch active student levels.
 */
export default function useStudentLevel(): UseStudentLevelReturn {
  const [data, setData] = useState<StudentLevel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentLevelsActive();
      const result = res?.data?.result ?? res?.data ?? [];
      setData(Array.isArray(result) ? result : []);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Không thể tải student levels.';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return { data, loading, error, refetch: fetchLevels };
}


