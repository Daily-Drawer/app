import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import Router from './src/route/Router';

function App(): React.JSX.Element {
  const [isReady, setIsReady] = useState(false);

  // useEffect(() => {
  //   const prepare = async () => {
  //     try {
  //       // 실제 초기화 작업 수행
  //       await Promise.all([
  //         // 예: 폰트 로드
  //         // 예: 캐시된 데이터 로드
  //         // 예: 인증 상태 확인
  //         new Promise(resolve => setTimeout(resolve, 1500)),
  //       ]);
  //     } catch (e) {
  //       console.warn(e);
  //     } finally {
  //       setIsReady(true);
  //       SplashScreen.hide();
  //     }
  //   };

  //   prepare();
  // }, []);

  // if (!isReady) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#000000" />
  //     </View>
  //   );
  // }

  return (
      <NavigationContainer>
        <Router />
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
