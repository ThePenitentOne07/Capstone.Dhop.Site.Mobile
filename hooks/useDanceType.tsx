import { useEffect, useState } from 'react';
import api from '../config/axios';

export type DanceType = {
  id: number;
  type: string;
  description: string;
};

export default function useDanceType() {
  const [danceTypes, setDanceTypes] = useState<DanceType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchDanceTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<DanceType[]>('/dance-types');
        if (!cancelled) setDanceTypes(res.data ?? []);
        console.log("DanceTypes:", res.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load dance types');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDanceTypes();
    return () => {
      cancelled = true;
    };
  }, []);

  return { danceTypes, loading, error };
}
