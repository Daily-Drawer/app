import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../apis/axios';
import { handleLoginSuccess } from '../utils/auth';

const CustomLogin = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await api.post('/api/v1/auth/login/local', {
        userEmail: formData.email,
        password: formData.password,
      });

      // 이미 다른 방식으로 가입된 계정인 경우
      if (response.status === 409 || response.data.code === '409') {
        setError('이미 다른 방식으로 가입된 계정입니다.');
        return;
      }

      const loginResult = await handleLoginSuccess(response, navigation, 'email');
      if (!loginResult) {
        if (response.status === 404) {
          setError('등록되지 않은 이메일입니다.');
        } else if (response.status === 401 || response.status === 422) {
          setError('이메일 또는 비밀번호가 일치하지 않습니다.');
        } else {
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      }
    } catch (error) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email);
  };

  return (
    <View style={styles.container}>
      <Text>이메일 로그인</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일을 입력해주세요"
        value={formData.email}
        onChangeText={(text) => {
          setFormData({ ...formData, email: text });
          setError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력해주세요"
        value={formData.password}
        onChangeText={(text) => {
          setFormData({ ...formData, password: text });
          setError('');
        }}
        secureTextEntry
        autoCapitalize="none"
      />
      {error !== '' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.loginButton,
          (!isValidEmail(formData.email) || !formData.password.trim()) &&
          styles.loginButtonDisabled,
        ]}
        onPress={handleLogin}
        disabled={!isValidEmail(formData.email) || !formData.password.trim()}
      >
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 40,
    maxWidth: 300,
    gap: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#2B96ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 11,
    paddingHorizontal: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  loginButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 2,
    marginLeft: 2,
  },
});

export default CustomLogin;
