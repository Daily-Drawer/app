import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../apis/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleSignUpSuccess } from '../../utils/auth';

const SignUp = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { email: initialEmail, loginType } = route.params || {};

  const [formData, setFormData] = useState({
    email: initialEmail || '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const [passwordMatch, setPasswordMatch] = useState({
    isMatching: false,
    message: '',
    color: '',
  });

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const conditions = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial];
    const passedConditions = conditions.filter(condition => condition).length;

    return passedConditions >= 3 && password.length >= 8 && password.length <= 16;
  };

  const handleSignUp = async () => {
    // 기본 검증
    if (!formData.name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    // 이메일 회원가입일 경우 비밀번호 검증
    if (loginType === 'email') {
      if (!formData.password) {
        Alert.alert('알림', '비밀번호를 입력해주세요.');
        return;
      }

      if (!validatePassword(formData.password)) {
        Alert.alert('알림',
          '비밀번호는 영문 대소문자, 숫자, 특수문자 중 3가지 이상을 포함하여\n8자 이상 16자 이하로 입력해주세요.'
        );
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    try {
      const signUpData = {
        userEmail: formData.email,
        nickName: formData.name,
      };

      if (loginType === 'kakao') {
        console.log('카카오 회원가입 시작', {
          signUpData,
          kakaoToken: route.params?.kakaoAccessToken
        });

        try {
          // 1. 카카오 회원가입
          const signUpResponse = await api.post('/api/v1/auth/signup/kakao', signUpData);
          console.log('카카오 회원가입 응답:', signUpResponse.data);

          // 2. 카카오 로그인
          const loginResponse = await api.post(
            '/api/v1/auth/login/kakao',
            null,
            {
              params: {
                kakaoAccessToken: route.params.kakaoAccessToken
              }
            }
          );
          console.log('카카오 로그인 응답:', loginResponse.data);

          // 3. 회원가입 성공 처리
          await handleSignUpSuccess(signUpResponse, loginResponse, navigation, formData.name);
          console.log('회원가입 성공 처리 완료');

          // 4. 메인탭으로 이동
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTab' }],
          });

        } catch (error) {
          console.error('카카오 회원가입/로그인 에러:', error);
          if (error.response?.data?.code === '409') {
            Alert.alert('오류', '이미 가입된 회원입니다.');
          } else {
            Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
          }
        }
      } else if (loginType === 'email') {
        try {
          const emailSignUpData = {
            ...signUpData,
            password: formData.password,
          };

          // 1. 이메일 회원가입
          const signUpResponse = await api.post('/api/v1/auth/signup/local', emailSignUpData);
          console.log('이메일 회원가입 응답:', signUpResponse.data);

          if (signUpResponse.data.code === '409') {
            Alert.alert('오류', '이미 가입된 회원입니다.');
            return;
          }

          // 2. 이메일 로그인
          const loginResponse = await api.post('/api/v1/auth/login/local', {
            userEmail: formData.email,
            password: formData.password,
          });
          console.log('이메일 로그인 응답:', loginResponse.data);

          // 로그인 응답 검증 추가
          if (loginResponse.status === 404 || loginResponse.data.errorCode === '404') {
            Alert.alert('오류', '로그인에 실패했습니다.');
            return;
          }

          // 3. 회원가입 성공 처리
          await handleSignUpSuccess(signUpResponse, loginResponse, navigation, formData.name);

          // 4. 메인탭으로 이동
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTab' }],
          });

        } catch (error) {
          console.error('이메일 회원가입 에러:', error);
          if (error.response?.data?.code === '409') {
            Alert.alert('오류', '이미 가입된 회원입니다.');
          } else if (error.response?.status === 404 || error.response?.data?.errorCode === '404') {
            Alert.alert('오류', '로그인에 실패했습니다.');
          } else {
            Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
          }
        }
      }
    } catch (error) {
      console.error('전체 프로세스 에러:', error);
      Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setFormData({ ...formData, confirmPassword: text });
    
    if (text === '') {
      setPasswordMatch({
        isMatching: false,
        message: '',
        color: '',
      });
    } else if (formData.password === text) {
      setPasswordMatch({
        isMatching: true,
        message: '비밀번호 일치',
        color: '#2E8B57',  // 초록색
      });
    } else {
      setPasswordMatch({
        isMatching: false,
        message: '비밀번호를 다시 확인해주세요',
        color: '#FF6B6B',  // 빨간색
      });
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
            source={require('../../assets/icon/leftbackicon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원가입</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="이메일을 입력해주세요"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!initialEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="이름을 입력해주세요"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* 이메일 로그인일 때만 비밀번호 입력 필드 표시 */}
        {loginType === 'email' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({...formData, password: text});
                  // 비밀번호가 변경되면 확인 메시지도 업데이트
                  if (formData.confirmPassword) {
                    handleConfirmPasswordChange(formData.confirmPassword);
                  }
                }}
                placeholder="비밀번호를 입력해주세요"
                secureTextEntry
              />
              <Text style={styles.passwordGuide}>
                영문 대문자, 숫자, 특수문자를 3가지 이상으로 조합해 8자 이상 16자 이하로 입력해주세요
              </Text>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="비밀번호를 다시 입력해주세요"
                secureTextEntry
              />
              {passwordMatch.message && (
                <Text style={[styles.matchMessage, { color: passwordMatch.color }]}>
                  {passwordMatch.message}
                </Text>
              )}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
          <Text style={styles.submitButtonText}>가입하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
  formContainer: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordGuide: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  matchMessage: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,  // 연하게 표시
  },
});

export default SignUp;
