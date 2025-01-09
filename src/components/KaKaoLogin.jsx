import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { login, me } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../apis/axios';

const KaKaoLogin = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log('카카오 로그인 시도...');
      const result = await login();
      console.log('카카오 로그인 결과:', result);

      if (result.accessToken) {
        try {
          const kakaoAccessToken = result.accessToken;
          console.log('전송할 카카오 액세스 토큰:', kakaoAccessToken);
          
          const response = await api.post(
            '/api/v1/auth/login/kakao',
            null,
            {
              params: {
                kakaoAccessToken: kakaoAccessToken
              }
            }
          );
          
          console.log('서버 응답:', response.data);

          // 응답의 code가 200이고 토큰이 있으면 로그인 성공
          if (response.data.code === "200" && response.data.data?.tokens) {
            const { accessToken, refreshToken } = response.data.data.tokens;
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('loginType', 'kakao');
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTab' }],
            });
            return;
          }
          
          // 회원가입이 필요한 경우
          const profile = await me(result.accessToken);
          console.log('카카오 프로필:', profile);

          if (!profile.email) {
            console.error('카카오 이메일 정보 없음');
            return;
          }

          navigation.navigate('SignUp', {
            email: profile.email,
            loginType: 'kakao',
            kakaoAccessToken: kakaoAccessToken
          });

        } catch (error) {
          console.error('서버 통신 에러:', error);
          if (error.response?.status === 409) {
            Alert.alert(
              '알림',
              '이미 존재하는 이메일입니다.',
              [{ text: '확인' }]
            );
          } else {
            console.error('에러 응답:', error.response?.data);
            Alert.alert(
              '오류',
              '로그인 중 문제가 발생했습니다.',
              [{ text: '확인' }]
            );
          }
        }
      }
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.kakaoButton} onPress={handleLogin}>
        <Image
          source={require('../assets/loginicon/kakaologo.png')}
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
