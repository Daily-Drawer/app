import React from 'react';
import { Button, View } from 'react-native';
import { login, me } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../apis/axios';

const KaKaoLogin = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const result = await login();

      if (result.accessToken) {
        // 카카오 사용자 정보 가져오기
        const userInfo = await me(result.accessToken);

        // 서버에 전송할 데이터 준비
        const loginData = {
          kakaoAccessToken: result.accessToken,
          email: userInfo.email,
          // 필요한 추가 데이터
        };

        // 서버로 데이터 전송
        const response = await api.post('/api/v1/auth/login/kakao', loginData);

        // 서버에서 받은 JWT 토큰 저장
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);

        navigation.navigate('MainTab');
      }
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    <View>
      <Button title="카카오 로그인" onPress={handleLogin} />
    </View>
  );
};

export default KaKaoLogin;
