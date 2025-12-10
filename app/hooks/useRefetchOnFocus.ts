import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useRefetchOnFocus(callback: () => void | Promise<void>) {
  useFocusEffect(
    useCallback(() => {
      void callback();
    }, [callback])
  );
}


