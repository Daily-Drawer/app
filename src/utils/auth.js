import { logout } from '@react-native-kakao/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from '../apis/axios';

export const applogout = async (loginType) => {
  try {
    // 1. 서버에 로그아웃 알림
    await axios.post('/auth/logout');

    // 2. 로그인 타입에 따른 처리
    if (loginType === 'KAKAO') {
      await logout(); // 카카오 SDK 로그아웃
    }

    // 3. 로컬 데이터 삭제
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'loginType',
      'userData',
    ]);

    // 4. axios 헤더에서 토큰 제거
    delete axios.defaults.headers.common['Authorization'];

    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};
