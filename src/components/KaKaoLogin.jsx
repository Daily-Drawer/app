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
    <View style={styles.container}>
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
  container: {
    alignItems: 'center',
    width: '100%',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 300,
    position: 'relative',
  },
  logo: {
    width: 22,
    height: 22,
    position: 'absolute',
    left: 14,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default KaKaoLogin;
