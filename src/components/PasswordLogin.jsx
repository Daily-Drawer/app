import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { handleLoginSuccess } from '../utils/auth';
import api from '../apis/axios';

const PasswordLogin = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isButtonEnabled = password.length > 0;

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/v1/auth/login/local', {
        userEmail: email,
        password: password,
      });

      await handleLoginSuccess(response, navigation, 'email');

    } catch (error) {
      console.error('로그인 에러:', error);
      if (error.response?.status === 401) {
        setError('비밀번호를 다시 확인해주세요.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={leftbackbutton}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>로그인</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.emailContainer}>
          <Text style={styles.emailTitle}>이메일</Text>
          <View style={styles.input}>
            <Text style={styles.emailText}>{email}</Text>
          </View>
        </View>
        <Text style={styles.passwordTitle}>비밀번호</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError('');
          }}
          secureTextEntry
          autoCapitalize="none"
        />
        <Text style={styles.passwordText}>비밀번호는 영문 대소문자, 숫자, 특수문자 중 3가지 이상을 포함하여 8자 이상 16자 이하로 입력해주세요.</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[
            styles.loginButton,
            !isButtonEnabled && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={!isButtonEnabled}
        >
          <Text style={[
            styles.buttonText,
            !isButtonEnabled && styles.buttonTextDisabled
          ]}>로그인</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const leftbackbutton = require('../assets/icon/leftbackicon.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  emailContainer: {
    marginBottom: 20,
  },
  emailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
  },
  passwordText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#666666',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
});

export default PasswordLogin;