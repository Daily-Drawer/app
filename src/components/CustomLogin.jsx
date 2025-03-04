import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../apis/axios';
import { handleLoginSuccess } from '../utils/auth';
import { fs, spacing } from '../utils/responsive';
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
    <View style={styles.inputContainer}>
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
  inputContainer: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: spacing.sm,
    fontSize: fs(16),
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#2B96ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  loginButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: fs(16),
    fontWeight: '400',
  },
  errorText: {
    color: '#FF0000',
    fontSize: fs(14),
    marginTop: 2,
    alignSelf: 'flex-start',
  },
});

export default CustomLogin;
