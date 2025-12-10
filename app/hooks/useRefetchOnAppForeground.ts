import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useRefetchOnAppForeground(callback: () => void | Promise<void>) {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasBackground = appState.current.match(/inactive|background/);
      if (wasBackground && nextAppState === 'active') {
        void callback();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [callback]);
}


