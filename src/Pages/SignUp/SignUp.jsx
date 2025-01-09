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
    try {
      let response;
      const signUpData = {
        userEmail: formData.email,
        nickName: formData.name,
      };
      
      if (loginType === 'kakao') {
        // 카카오 회원가입
        try {
          response = await api.post('/api/v1/auth/signup/kakao', signUpData);
        } catch (error) {
          if (error.response?.status === 409) {
            // 이미 가입된 회원인 경우 바로 로그인 시도
            const loginResponse = await api.post(
              '/api/v1/auth/login/kakao',
              null,
              {
                params: {
                  kakaoAccessToken: route.params.kakaoAccessToken
                }
              }
            );
            
            if (loginResponse.data.accessToken) {
              await AsyncStorage.setItem('accessToken', loginResponse.data.accessToken);
              await AsyncStorage.setItem('refreshToken', loginResponse.data.refreshToken);
              await AsyncStorage.setItem('loginType', 'kakao');
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTab' }],
              });
              return;
            }
          }
          throw error; // 다른 에러는 상위로 전달
        }
      } else {
        // 일반 회원가입
        signUpData.password = formData.password;
        response = await api.post('/api/v1/auth/signup/local', signUpData);
      }

      if (response.data) {
        Alert.alert(
          '환영합니다!',
          `${formData.name}님, 회원가입이 완료되었습니다.`,
          [
            {
              text: '확인',
              onPress: async () => {
                try {
                  let loginResponse;
                  if (loginType === 'kakao') {
                    loginResponse = await api.post(
                      '/api/v1/auth/login/kakao',
                      null,
                      {
                        params: {
                          kakaoAccessToken: route.params.kakaoAccessToken
                        }
                      }
                    );
                  } else {
                    loginResponse = await api.post('/api/v1/auth/login/local', {
                      userEmail: formData.email,
                      password: formData.password,
                    });
                  }

                  if (loginResponse.data.accessToken) {
                    await AsyncStorage.setItem('accessToken', loginResponse.data.accessToken);
                    await AsyncStorage.setItem('refreshToken', loginResponse.data.refreshToken);
                    await AsyncStorage.setItem('loginType', loginType);
                    
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainTab' }],
                    });
                  }
                } catch (loginError) {
                  console.error('로그인 에러:', loginError);
                }
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
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
                onChangeText={(text) => setFormData({...formData, password: text})}
                placeholder="비밀번호를 입력해주세요"
                secureTextEntry
              />
              <Text style={styles.passwordGuide}>
                영문 대소문자, 숫자, 특수문자를 3가지 이상으로 조합해 8자 이상 16자 이하로 입력해주세요
              </Text>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                placeholder="비밀번호를 다시 입력해주세요"
                secureTextEntry
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
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
});

export default SignUp;
