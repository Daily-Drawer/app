import axios from 'axios';
import { API_URL } from '@env';

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
  error => {
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
    return Promise.reject(error);
  }
);

// API 연결 테스트 함수
api.testConnection = async () => {
  try {
    const response = await api.get('/');
    console.log('API Connection Test:', response.status);
    return true;
  } catch (error) {
    console.error('API Connection Test Failed:', error.message);
    return false;
  }
};

export default api;
