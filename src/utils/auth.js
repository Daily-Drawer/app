import { logout } from '@react-native-kakao/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../apis/axios';

// 토큰 저장 함수
export const saveTokens = async (tokens) => {
  try {
    await AsyncStorage.setItem('accessToken', tokens.access_token);
    await AsyncStorage.setItem('refreshToken', tokens.refresh_token);
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
};

// 로그인 성공 후 처리 함수
export const handleLoginSuccess = async (response, navigation, loginType = 'kakao') => {
  try {
    if (response.data.code === "200" && response.data.data?.token) {
      await saveTokens(response.data.data.token);
      await AsyncStorage.setItem('loginType', loginType);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('로그인 처리 실패:', error);
    throw error;
  }
};

export const applogout = async (loginType) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    
    // 1. 서버에 로그아웃 알림 (올바른 엔드포인트로 수정)
    await axios.post('/api/v1/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 2. 로그인 타입에 따른 처리
    if (loginType === 'kakao') {
      await logout(); // 카카오 SDK 로그아웃
    }

    // 3. 로컬 데이터 삭제
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'loginType'
    ]);

    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    // 서버 에러가 발생하더라도 로컬 데이터는 삭제
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'loginType'
    ]);
    throw error;
  }
};
