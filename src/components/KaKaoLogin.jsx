import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { login } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';
import api from '../apis/axios';
import kakaologo from '../assets/loginicon/kakaologo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KaKaoLogin = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      // 1. 카카오 SDK 로그인
      const result = await login();

      if (result.accessToken) {
        try {
          // 2. 서버 로그인 요청
          const response = await api.post(
            '/api/v1/auth/login/kakao',
            null,
            {
              params: {
                kakaoAccessToken: result.accessToken
              }
            }
          );

          console.log('서버 응답:', JSON.stringify(response.data, null, 2));  // 응답 구조 확인

          // 3. 로그인 성공 처리
          if (response.data.code === '200') {
            // tokens 구조로 수정
            if (!response.data.data?.tokens) {
              throw new Error('토큰 정보가 없습니다.');
            }

            // 토큰 저장 - tokens 구조에 맞게 수정
            const { accessToken, refreshToken } = response.data.data.tokens;
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('loginType', 'kakao');

            // MainTab으로 이동
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTab' }],
            });
            return;
          }

        } catch (error) {
          console.error('서버 로그인 에러:', error);
          console.error('에러 응답:', error.response?.data);  // 에러 응답 확인
          
          // 회원가입이 필요한 경우 (307)
          if (error.response?.status === 307) {
            navigation.navigate('SignUp', {
              email: error.response.data.data.kakaoUserInfo.kakao_account.email,
              loginType: 'kakao',
              kakaoAccessToken: result.accessToken
            });
            return;
          }

          Alert.alert(
            '로그인 실패',
            '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
          );
        }
      }
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      Alert.alert('오류', '카카오 로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.kakaoButton} onPress={handleLogin}>
        <Image
          source={kakaologo}
          style={styles.logo}
        />
        <Text style={styles.buttonText}>카카오 로그인</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  kakaoButton: {
    backgroundColor: '#FEE500', // 카카오 브랜드 색상
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 300,
  },
  logo: {
    width: 18,
    height: 18,
    marginLeft: 14,
  },
  buttonText: {
    color: '#000000',  // 카카오 권장 텍스트 색상
    fontSize: 16,
    paddingHorizontal: 86,
    fontWeight: '400',
  },
});

export default KaKaoLogin;
