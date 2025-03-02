import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { navigate } from '../navigation/RootNavigation';  // 네비게이션 참조

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json;charset=UTF-8',
  },
  timeout: 30000,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  async config => {
    console.log('🚀 API Request:', {
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params
    });

    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.params) {
      Object.keys(config.params).forEach(key => {
        if (typeof config.params[key] === 'string') {
          config.params[key] = encodeURIComponent(config.params[key]);
        }
      });
    }

    return config;
  },
  error => {
    console.error('❌ Request Error:', {
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  response => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async error => {
    if (error.response) {
      console.error('❌ Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('❌ No Response:', {
        request: error.request,
        message: error.message
      });
    } else {
      console.error('❌ Request Setup Error:', {
        message: error.message
      });
    }

    const originalRequest = error.config;

    // 토큰 만료 에러 (401) 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 발급 시도
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다.');
        }

        const response = await axios.post('/auth/refresh', {
          refreshToken
        });

        if (response.data.token) {
          // 새 토큰 저장
          await AsyncStorage.setItem('token', response.data.token);
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 리프레시 토큰도 만료되었거나 갱신 실패
        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        
        Alert.alert(
          '세션 만료',
          '로그인이 만료되었습니다. 다시 로그인해 주세요.',
          [
            {
              text: '확인',
              onPress: () => {
                // 로그인 화면으로 이동하고 스택 초기화
                navigate('Auth', { screen: 'Login' });
              }
            }
          ]
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
