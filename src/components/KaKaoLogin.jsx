import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { login } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';
import { handleLoginSuccess } from '../../utils/auth';
import api from '../apis/axios';
import kakaologo from '../assets/loginicon/kakaologo.png';

const KaKaoLogin = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const result = await login();
      console.log('카카오 로그인 결과:', result);

      if (result.accessToken) {
        try {

          const response = await api.post(
            '/api/v1/auth/login/kakao',
            {},  // empty body
            {
              params: {
                kakaoAccessToken: result.accessToken,
              },
            }
          );

          console.log('서버 응답:', response.data);

          // 307 상태 코드 체크 (회원가입 필요)
          if (response.status === 307) {
            Alert.alert(
              '회원가입 필요',
              '카카오 계정으로 회원가입을 진행해주세요.',
              [
                {
                  text: '확인',
                  onPress: () => {
                    navigation.navigate('SignUp', {
                      email: response.data.data.kakaoUserInfo,
                      loginType: 'kakao',
                      kakaoAccessToken: result.accessToken,
                    });
                  },
                },
              ]
            );
            return;
          }

          // 로그인 성공 처리
          const loginSuccess = await handleLoginSuccess(response, navigation);
          if (!loginSuccess) {
            Alert.alert('오류', '로그인 처리 중 문제가 발생했습니다.');
          }

        } catch (error) {
          console.error('서버 통신 에러 상세:');
          console.error('- 에러 메시지:', error.response);

          Alert.alert(
            '오류',
            '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            [{ text: '확인' }]
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
