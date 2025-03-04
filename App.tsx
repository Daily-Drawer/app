import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import Router from './src/route/Router';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import Config from 'react-native-config';
import { navigationRef } from './src/utils/navigationRef';
import { AppState, UIManager, Platform } from 'react-native';
import { useAppLifecycle } from './src/hooks/useAppLifecycle';

function App(): React.JSX.Element {
  useAppLifecycle();

  useEffect(() => {
    const initializeApp = async () => {
      // Android용 LayoutAnimation 활성화
      if (Platform.OS === 'android') {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
          UIManager.setLayoutAnimationEnabledExperimental(true);
        }
      }

      // Kakao SDK 초기화
      try {
        await initializeKakaoSDK(Config.KAKAO_NATIVE_APP_KEY || '');
      } catch (error) {
        console.error('Kakao SDK initialization failed:', error);
      }

      // 스플래시 스크린 숨기기
      SplashScreen.hide();
    };

    // 앱 초기화 실행
    initializeApp();

    // 앱 상태 변화 감지
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // 앱이 포그라운드로 올 때의 처리
      }
    });

    // 클린업 함수
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Router />
    </NavigationContainer>
  );
}

export default App;
