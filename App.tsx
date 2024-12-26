import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Router from './src/route/Router';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import Config from 'react-native-config';


function App(): React.JSX.Element {
  // SDK 초기화 전에 키 존재 여부 확인
  if (!Config.KAKAO_NATIVE_APP_KEY) {
    console.error('KAKAO_NATIVE_APP_KEY is not defined');
  }
  initializeKakaoSDK(Config.KAKAO_NATIVE_APP_KEY || '');

  return (
      <NavigationContainer>
        <Router />
      </NavigationContainer>
  );
}

export default App;
