import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '@react-native-kakao/user';
import api from '../apis/axios';
import { Alert } from 'react-native';

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  
  checkAuth: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      set({ isLoggedIn: !!accessToken });
    } catch (error) {
      console.error('토큰 확인 실패:', error);
      set({ isLoggedIn: false });
    }
  },

  logout: async () => {
    try {
      const storedLoginType = await AsyncStorage.getItem('loginType');
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 이메일 로그아웃
      if (storedLoginType === 'email' && accessToken) {
        try {
          await api.post('/api/v1/auth/logout', null, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        } catch (error) {
          console.error('서버 로그아웃 요청 실패:', error);
        }
      }

      // 카카오 로그아웃
      if (storedLoginType === 'kakao') {
        try {
          await logout();
        } catch (error) {
          console.error('카카오 로그아웃 실패:', error);
        }
      }

      // AsyncStorage 클리어
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'loginType']);
      set({ isLoggedIn: false });
      
      return true;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
      throw error;
    }
  },
}));

export default useAuthStore;
