import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Runs the callback whenever the current screen regains focus.
 */
export function useRefetchOnFocus(callback: () => void | Promise<void>) {
  useFocusEffect(
    useCallback(() => {
      void callback();
    }, [callback])
  );
}


