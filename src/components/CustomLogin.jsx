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
      // 이메일 확인 API 호출
      const response = await api.post('/api/v1/auth/check-email', {
        userEmail: email,
      });

      // 이메일이 존재하면 비밀번호 입력 화면으로 이동
      navigation.navigate('PasswordLogin', { email });

    } catch (error) {
      console.error('이메일 확인 에러:', error);

      // 이메일이 존재하지 않는 경우
      if (error.response?.status === 404) {
        Alert.alert(
          '회원가입 안내',
          '일치하는 이메일이 없습니다.\n회원가입을 하시겠습니까?',
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
