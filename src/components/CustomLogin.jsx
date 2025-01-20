import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../apis/axios';

const CustomLogin = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleEmailCheck = async () => {
    if (!email) return;

    try {
      // 이메일 체크 API 호출 시 loginType도 함께 전송
      const response = await api.post(`/api/v1/auth/check-email`, {
        userEmail: email,
        loginType: 'email'  // 자체 이메일 로그인임을 명시
      });

      if(response.status === 200){
        // 이메일이 존재하고 로그인 타입이 일치하면 비밀번호 입력 화면으로 이동
        navigation.navigate('PasswordLogin', { email });
      }

    } catch (error) {
      if (error.response?.status === 404) {
        // 이메일이 존재하지 않는 경우
        Alert.alert(
          '회원가입 안내',
          '가입된 이메일이 없습니다.\n회원가입을 하시겠습니까?',
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '확인',
              onPress: () => navigation.navigate('SignUp', {
                email,
                loginType: 'email',
              }),
            }
          ]
        );
      } else if (error.response?.status === 409) {
        // 이메일은 존재하지만 로그인 타입이 다른 경우
        Alert.alert(
          '로그인 안내',
          '해당 이메일은 카카오 계정으로 가입되어 있습니다.\n카카오 로그인을 이용해주세요.',
          [{ text: '확인' }]
        );
      } else {
        console.error('이메일 확인 에러:', error);
        Alert.alert('오류', '이메일 확인 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="이메일을 입력해주세요"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.customButton}
        onPress={handleEmailCheck}
      >
        <Text style={styles.buttonText}>이메일로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 300,
    gap: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  customButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '400',
  },
});

export default CustomLogin;
