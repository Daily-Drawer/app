import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { login } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';
import api from '../apis/axios';
import kakaologo from '../assets/loginicon/kakaologo.png';
import { handleKakaoLoginSuccess } from '../utils/auth';

const KaKaoLogin = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const result = await login();

      if (result.accessToken) {
        try {
          const response = await api.post(
            '/api/v1/auth/login/kakao',
            null,
            {
              params: {
                kakaoAccessToken: result.accessToken,
              },
            }
          );

          const loginResult = await handleKakaoLoginSuccess(response, navigation);
          if (!loginResult) {
            return;
          }

        } catch (error) {
          console.error('서버 로그인 에러:', error);
          Alert.alert(
            '로그인 실패', 
            '서버 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
          );
        }
      }
    } catch (error) {
      // 카카오 SDK 관련 에러 처리
      if (error.code === 'KakaoTalk not installed') {
        Alert.alert(
          '카카오톡 미설치',
          '카카오톡이 설치되어 있지 않습니다. 카카오톡을 설치한 후 다시 시도해주세요.'
        );
      } else {
        console.error('카카오 로그인 에러:', error);
      }
    }
  };

  return (
      <TouchableOpacity style={styles.kakaoButton} onPress={handleLogin}>
        <Image
          source={kakaologo}
          style={styles.logo}
        />
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  kakaoButton: {
    backgroundColor: '#FEE500',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 50,
  },
  logo: {
    width: 22,
    height: 22,
  },
});

export default KaKaoLogin;
