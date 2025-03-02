import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Router from './src/route/Router';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import Config from 'react-native-config';
import { navigationRef } from './src/utils/navigationRef';
import { AppState, UIManager, Platform } from 'react-native';
import { useAppLifecycle } from './src/hooks/useAppLifecycle';

function App(): React.JSX.Element {
  useAppLifecycle();

  useEffect(() => {
    // Android용 LayoutAnimation 활성화
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }

    // 앱 상태 변화 감지
    const subscription = AppState.addEventListener('change', nextAppState => {
      // 앱 상태 변화에 따른 처리
      if (nextAppState === 'active') {
        // 앱이 포그라운드로 올 때의 처리
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    // SDK 초기화를 useEffect 내에서 실행
    const initKakao = async () => {
      try {
        await initializeKakaoSDK(Config.KAKAO_NATIVE_APP_KEY || '');
      } catch (error) {
        console.error('Kakao SDK initialization failed:', error);
      }
    };
    
    initKakao();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Router />
    </NavigationContainer>
  );
}

export default App;
