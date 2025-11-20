import { useEffect, useState } from 'react';
import api from '../config/axios';

export type Area = {
  id: number;
  city: string;
  ward: string;
};

export default function useArea() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Area[]>('/areas');
        if (!cancelled) setAreas(res.data ?? []);
        console.log("Areas:", res.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load areas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAreas();
    return () => {
      cancelled = true;
    };
  }, []);

  return { areas, loading, error };
}


