import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { login } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';
import api from '../apis/axios';
import kakaologo from '../assets/loginicon/kakaologo.png';
import { handleLoginSuccess } from '../utils/auth';

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

          const loginResult = await handleLoginSuccess(response, navigation, 'kakao');

          if (!loginResult) {
            return;
          }

        } catch (error) {
          Alert.alert('로그인 실패', '로그인 중 문제가 발생했습니다.');
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
