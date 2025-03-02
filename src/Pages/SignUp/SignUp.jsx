import React, { useState, useEffect } from 'react';
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
import { spacing, wp, hp, fs } from '../../utils/responsive';

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

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerId, setTimerId] = useState(null);

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
        try {
          // 1. 카카오 회원가입
          const signUpResponse = await api.post('/api/v1/auth/signup/kakao', signUpData);

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

          // 3. 회원가입 성공 처리
          const success = await handleSignUpSuccess(signUpResponse, loginResponse, navigation, formData.name);
          if (!success) {
            Alert.alert('오류', '회원가입 처리 중 문제가 발생했습니다.');
          }

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

          if (signUpResponse.data.code === '409') {
            Alert.alert('오류', '이미 가입된 회원입니다.');
            return;
          }

          // 2. 이메일 로그인
          const loginResponse = await api.post('/api/v1/auth/login/local', {
            userEmail: formData.email,
            password: formData.password,
          });

          // 3. 회원가입 성공 처리
          const success = await handleSignUpSuccess(signUpResponse, loginResponse, navigation, formData.name);
          if (!success) {
            Alert.alert('오류', '회원가입 처리 중 문제가 발생했습니다.');
          }

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

  // 타이머 시작 함수
  const startTimer = () => {
    setTimeLeft(600); // 10분 = 600초
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(id);
  };

  // 타이머 초기화 함수
  const resetTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setTimeLeft(0);
  };

  // 시간 형식 변환 함수
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  // 타이머가 0이 되면 인증 코드 입력 필드 초기화
  useEffect(() => {
    if (timeLeft === 0 && showVerificationCode) {
      setShowVerificationCode(false);
      setVerificationCode('');
      Alert.alert('알림', '인증 시간이 만료되었습니다. 다시 시도해주세요.');
    }
  }, [timeLeft]);

  // handleRequestVerification 수정
  const handleRequestVerification = async () => {
    if (!formData.email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }

    try {
      setIsVerifying(true);
      // 타이머 초기화 후 시작
      resetTimer();
      setShowVerificationCode(true);
      
      // 서버에 이메일 인증 요청
      await api.post(`/api/v1/auth/send-verification?userEmail=${formData.email}`);
      Alert.alert('알림', '인증 코드가 이메일로 전송되었습니다.');
      
      // 새로운 타이머 시작
      startTimer();
    } catch (error) {
      console.error('이메일 인증 요청 에러:', error);
      Alert.alert('오류', '이메일 인증 요청에 실패했습니다.');
      setShowVerificationCode(false);
      resetTimer();
    } finally {
      setIsVerifying(false);
    }
  };

  // handleVerifyCode 수정
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('알림', '인증 코드를 입력해주세요.');
      return;
    }

    try {
      setIsVerifying(true);
      const response = await api.post('/api/v1/auth/verification-code', {
        userEmail: formData.email,
        code: verificationCode,
      });
      
      if (response.status === 200) {
        setIsEmailVerified(true);
        setShowVerificationCode(false);
        setVerificationCode('');
        resetTimer(); // 인증 성공 시 타이머 초기화
        Alert.alert('알림', '이메일 인증이 완료되었습니다.');
      }
    } catch (error) {
      console.error('인증 코드 확인 에러:', error);
      setIsEmailVerified(false);
      
      if (error.response?.status === 401) {
        Alert.alert('오류', '인증 코드가 만료되었습니다. 다시 요청해주세요.');
        setShowVerificationCode(false);
        resetTimer(); // 인증 코드 만료 시 타이머 초기화
      } else if (error.response?.status === 404) {
        Alert.alert('오류', '잘못된 인증 코드입니다.');
      } else {
        Alert.alert('오류', '인증에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsVerifying(false);
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
          {loginType === 'email' ? (
            <>
              <View style={styles.emailContainer}>
                <TextInput
                  style={[styles.input, styles.emailInput]}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({...formData, email: text});
                    setIsEmailVerified(false);
                  }}
                  placeholder="이메일을 입력해주세요"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!initialEmail}
                />
                <TouchableOpacity
                  style={[
                    styles.verificationButton,
                    isEmailVerified && styles.verifiedButton
                  ]}
                  onPress={handleRequestVerification}
                  disabled={isEmailVerified || isVerifying}
                >
                  <Text style={styles.verificationButtonText}>
                    {isEmailVerified ? '인증완료' : '인증하기'}
                  </Text>
                </TouchableOpacity>
              </View>
              {showVerificationCode && (
                <View style={styles.verificationCodeContainer}>
                  <TextInput
                    style={[styles.input, styles.verifyCodeInput]}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="인증 코드를 입력해주세요"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                  <TouchableOpacity
                    style={[styles.verifyCodeButton, isVerifying && styles.verifyingButton]}
                    onPress={handleVerifyCode}
                    disabled={isVerifying}
                  >
                    <Text style={styles.verifyCodeButtonText}>
                      {isVerifying ? '전송중' : '확인'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <TextInput
              style={styles.input}
              value={formData.email}
              editable={false}
              placeholder="카카오 계정 이메일"
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="이름을 입력해주세요"
          />
        </View>

        {loginType === 'email' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({...formData, password: text});
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

        <TouchableOpacity 
          style={[
            styles.submitButton,
            ((loginType === 'email' && (!isEmailVerified || !formData.name || !formData.password || !passwordMatch.isMatching)) ||
             (loginType === 'kakao' && !formData.name)) && 
            styles.submitButtonDisabled
          ]}
          onPress={handleSignUp}
          disabled={
            (loginType === 'email' && (!isEmailVerified || !formData.name || !formData.password || !passwordMatch.isMatching)) ||
            (loginType === 'kakao' && !formData.name)
          }
        >
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: spacing.sm,
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  backIcon: {
    width: wp(6),
    height: wp(6),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fs(18),
    fontWeight: '600',
  },
  formContainer: {
    padding: spacing.lg,
    flex: 1,
  },
  inputGroup: {
    marginBottom: hp(5),
  },
  label: {
    fontSize: fs(14),
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: wp(2),
    padding: spacing.md,
    fontSize: fs(14),
    minHeight: hp(6),
  },
  passwordGuide: {
    fontSize: fs(12),
    color: '#666',
    marginTop: spacing.xs,
  },
  errorText: {
    color: 'red',
    fontSize: fs(12),
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: '#000',
    padding: spacing.md,
    borderRadius: wp(2),
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fs(16),
    fontWeight: '600',
  },
  matchMessage: {
    fontSize: fs(12),
    marginTop: spacing.xs,
    opacity: 0.8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emailInput: {
    flex: 1,
  },
  verificationButton: {
    backgroundColor: '#2B96ED',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(2),
    width: wp(20),
  },
  verifiedButton: {
    backgroundColor: '#27AE60',
  },
  verificationButtonText: {
    color: '#FFFFFF',
    fontSize: fs(12),
    fontWeight: '600',
  },
  verificationCodeContainer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verifyCodeInput: {
    flex: 1,
    width: '70%',
  },
  verifyCodeButton: {
    backgroundColor: '#2B96ED',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: wp(2),
    width: wp(18),
  },
  verifyingButton: {
    backgroundColor: '#95A5A6',
  },
  verifyCodeButtonText: {
    color: '#FFFFFF',
    fontSize: fs(12),
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#95A5A6',
    opacity: 0.7,
  },
  timerText: {
    color: '#FF6B6B',
    fontSize: fs(12),
    marginLeft: spacing.sm,
  },
});

export default SignUp;
