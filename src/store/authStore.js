import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../apis/axios';
import { Alert } from 'react-native';

const useAuthStore = create((set) => ({
  isLoggedIn: false,
  userInfo: {
    username: '',
    email: '',
    loginType: '',
  },
  isLoading: true,
  
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  
  setUserInfo: (info) => set({ userInfo: info }),
  
  updateUserInfo: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        set({ isLoggedIn: false, isLoading: false });
        return;
      }

      const response = await api.get('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.data.data) {
        set({
          userInfo: {
            username: response.data.data.nickName,
            email: response.data.data.userEmail,
            loginType: response.data.data.provider,
          },
          isLoading: false
        });
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        set({ isLoggedIn: false, isLoading: false });
        return;
      }
      
      set({ isLoggedIn: true });
      await useAuthStore.getState().updateUserInfo();
    } catch (error) {
      console.error('토큰 확인 실패:', error);
      set({ isLoggedIn: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 1. 서버 로그아웃 요청
      if (accessToken) {
        try {
          await api.post('/api/v1/auth/logout', null, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        } catch (error) {
          console.error('서버 로그아웃 요청 실패:', error);
        }
      }

      // 2. 로컬 스토리지 클리어
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'loginType']);
      
      // 3. 스토어 상태 초기화
      set({ 
        isLoggedIn: false,
        userInfo: {
          username: '',
          email: '',
          loginType: '',
        }
      });
      
      return true;
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
      throw error;
    }
  },
}));

export default useAuthStore;
