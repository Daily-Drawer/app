import { useEffect } from 'react';
import { AppState } from 'react-native';
import useAppLifecycleStore from '../store/appLifecycleStore';

export const useAppLifecycle = () => {
  const handleAppStateChange = useAppLifecycleStore(state => state.handleAppStateChange);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);
}; 