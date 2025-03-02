import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import BasicHeader from '../../components/BasicHeader';
import { updateUserName, updateUserEmail, updateUserPassword } from '../../utils/auth';
import useAuthStore from '../../store/authStore';
import api from '../../apis/axios';


const UserSetting = () => {
  const { userInfo, updateUserInfo } = useAuthStore();
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    password: false,
  });
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [passwordInputs, setPasswordInputs] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordCheck: '',
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerId, setTimerId] = useState(null);

  const handleEmailEdit = () => {
    setTempEmail(userInfo.email);
    setEditMode(prev => ({ ...prev, email: true }));
    setIsEmailVerified(false);
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

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerId]);

  // 시간 형식 변환 함수
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 타이머 초기화 함수
  const resetTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
    setTimeLeft(0);
  };

  const handleRequestVerification = async () => {
    try {
      // 타이머 초기화 후 시작
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
      setTimeLeft(600);  // 타이머 시간 초기화

      setShowVerificationCode(true);
      await api.post(`/api/v1/auth/send-verification?userEmail=${tempEmail}`);
      Alert.alert('알림', '인증 코드가 이메일로 전송되었습니다.');

      // 새로운 타이머 시작
      startTimer();
    } catch (error) {
      console.error('이메일 인증 요청 에러:', error);
      Alert.alert('오류', '이메일 인증 요청에 실패했습니다.');
      setShowVerificationCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('알림', '인증 코드를 입력해주세요.');
      return;
    }

    try {
      const response = await api.post('/api/v1/auth/verification-code', {
        userEmail: tempEmail,
        code: verificationCode,
      });

      if (response.status === 200) {
        setIsEmailVerified(true);
        setShowVerificationCode(false);
        setVerificationCode('');
        resetTimer(); // 인증 성공 시 타이머 초기화
        Alert.alert('알림', '이메일 인증이 완료되었습니다.');
        handleSave('email');
      }
    } catch (error) {
      console.error('인증 코드 확인 에러:', error);
      if (error.response?.status === 401) {
        Alert.alert('오류', '인증 코드가 만료되었습니다. 다시 요청해주세요.');
        setShowVerificationCode(false);
        resetTimer(); // 인증 코드 만료 시 타이머 초기화
      } else if (error.response?.status === 404) {
        Alert.alert('오류', '잘못된 인증 코드입니다.');
      } else {
        Alert.alert('오류', '인증에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleSave = async (field) => {
    try {
      let response;

      switch (field) {
        case 'name':
          response = await updateUserName(userInfo.username);
          break;

        case 'email':
          if (!isEmailVerified) {
            Alert.alert(
              '알림',
              '이메일 변경을 위해서는 인증이 필요합니다.',
              [
                {
                  text: '취소',
                  style: 'cancel',
                  onPress: () => {
                    setTempEmail(userInfo.email);
                    setEditMode(prev => ({ ...prev, email: false }));
                  }
                },
                {
                  text: '확인',
                  onPress: handleRequestVerification
                }
              ]
            );
            return;
          }
          response = await updateUserEmail(tempEmail);
          break;

        case 'password':
          try {
            // 1. 먼저 현재 비밀번호 검증
            const verifyResponse = await api.put('/api/v1/auth/me/password', {
              currentPassword: passwordInputs.currentPassword,
              newPassword: passwordInputs.newPassword,
              newPasswordCheck: passwordInputs.newPasswordCheck,
            });

            // 2. 검증 성공하면 새 비밀번호로 업데이트
            if (verifyResponse.status === 200) {
              const updateResponse = await api.put('/api/v1/auth/me/password', {
                password: passwordInputs.newPassword,
              });

              if (updateResponse.status === 200) {
                Alert.alert('성공', '비밀번호가 변경되었습니다.');
              }
            }
          } catch (error) {
            if (error.response?.status === 401) {
              Alert.alert('오류', '현재 비밀번호가 일치하지 않습니다.');
            } else {
              Alert.alert('오류', '비밀번호 변경에 실패했습니다.');
            }
            throw error;
          }
          break;
      }

      Alert.alert('성공', `${field === 'name' ? '이름' : field === 'email' ? '이메일' : '비밀번호'}가 변경되었습니다.`);
      setEditMode(prev => ({ ...prev, [field]: false }));
      await updateUserInfo();
    } catch (error) {
      console.error('정보 수정 실패:', error);
      const errorMessage = error.response?.data?.message || '정보 수정에 실패했습니다.';
      Alert.alert('오류', errorMessage);
    }
  };

  const handleKakaoInfoPress = () => {
    Alert.alert(
      '알림',
      '카카오 아이디로 로그인 한 경우, 비밀번호, 이메일은 카카오에서만 변경하실 수 있습니다.',
      [{ text: '확인', style: 'default' }]
    );
  };

  // 타이머가 0이 되면 인증 코드 입력 필드 초기화
  useEffect(() => {
    if (timeLeft === 0 && showVerificationCode) {
      setShowVerificationCode(false);
      setVerificationCode('');
      Alert.alert('알림', '인증 시간이 만료되었습니다. 다시 시도해주세요.');
    }
  }, [timeLeft]);

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title="프로필 설정" />
      <View style={styles.content}>
        {/* 이름 수정 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이름</Text>
            {!editMode.name ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditMode(prev => ({ ...prev, name: true }))}
              >
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={() => handleSave('name')}
              >
                <Text style={[styles.editButtonText, styles.saveButtonText]}>저장</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.input, !editMode.name && styles.inputDisabled]}
            value={userInfo.username}
            onChangeText={(text) => useAuthStore.setState(state => ({
              userInfo: { ...state.userInfo, username: text }
            }))}
            editable={editMode.name}
            placeholder="이름을 입력하세요"
          />
        </View>

        {/* 이메일 수정 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>이메일</Text>
            {userInfo.loginType !== 'KAKAO' && !editMode.email && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEmailEdit}
              >
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
            )}
          </View>

          {!editMode.email ? (
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.emailText}>{userInfo.email}</Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="새 이메일을 입력하세요"
                keyboardType="email-address"
              />
              {showVerificationCode && (
                <View style={styles.verificationContainer}>
                  <TextInput
                    style={[styles.input, styles.verificationInput]}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="인증 코드를 입력하세요"
                    keyboardType="number-pad"
                  />
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
              )}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => {
                    setTempEmail(userInfo.email);
                    setEditMode(prev => ({ ...prev, email: false }));
                    setShowVerificationCode(false);
                    setVerificationCode('');
                    setIsEmailVerified(false);
                    resetTimer(); // 취소 시 타이머 초기화
                  }}
                >
                  <Text style={[styles.editButtonText, styles.cancelButtonText]}>취소</Text>
                </TouchableOpacity>
                {showVerificationCode ? (
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton]}
                    onPress={handleVerifyCode}
                  >
                    <Text style={[styles.editButtonText, styles.saveButtonText]}>인증 확인</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton]}
                    onPress={() => handleSave('email')}
                  >
                    <Text style={[styles.editButtonText, styles.saveButtonText]}>변경</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        {/* 비밀번호 변경 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>비밀번호</Text>
            {userInfo.loginType !== 'KAKAO' && !editMode.password && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditMode(prev => ({ ...prev, password: true }))}
              >
                <Text style={styles.editButtonText}>변경</Text>
              </TouchableOpacity>
            )}
          </View>
          {userInfo.loginType === 'KAKAO' ? (
            <TouchableOpacity
              style={styles.socialLoginInfo}
              onPress={handleKakaoInfoPress}
            >
              <Image source={kakaologo} style={styles.kakaoLogo} />
              <Text style={styles.socialLoginText}>카카오 로그인 사용중</Text>
            </TouchableOpacity>
          ) : editMode.password ? (
            <>
              <TextInput
                style={styles.input}
                value={passwordInputs.currentPassword}
                onChangeText={(text) => setPasswordInputs(prev => ({
                  ...prev,
                  currentPassword: text
                }))}
                placeholder="현재 비밀번호"
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={passwordInputs.newPassword}
                onChangeText={(text) => setPasswordInputs(prev => ({
                  ...prev,
                  newPassword: text
                }))}
                placeholder="새 비밀번호"
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={passwordInputs.newPasswordCheck}
                onChangeText={(text) => setPasswordInputs(prev => ({
                  ...prev,
                  newPasswordCheck: text
                }))}
                placeholder="새 비밀번호 확인"
                secureTextEntry
              />
              <Text style={styles.passwordGuide}>
                영문 대문자, 숫자, 특수문자를 3가지 이상으로 조합해 8자 이상 16자 이하로 입력해주세요
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => {
                    setEditMode(prev => ({ ...prev, password: false }));
                    setPasswordInputs({
                      currentPassword: '',
                      newPassword: '',
                      newPasswordCheck: '',
                    });
                  }}
                >
                  <Text style={[styles.editButtonText, styles.cancelButtonText]}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => handleSave('password')}
                >
                  <Text style={[styles.editButtonText, styles.saveButtonText]}>완료</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.passwordText}>••••••••</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const kakaologo = require('../../assets/icon/kakaoLogoIcon.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    justifyContent: 'center',
  },
  inputDisabled: {
    backgroundColor: '#F8F8F8',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6C5CE7',
  },
  editButtonText: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  socialLoginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
    opacity: 1,
  },
  socialLoginText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '500',
  },
  kakaoLogo:{
    width: 20,
    height: 18,
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6C5CE7',
  },
  cancelButtonText: {
    color: '#6C5CE7',
  },
  emailText: {
    fontSize: 15,
    color: '#666666',
  },
  passwordText: {
    fontSize: 15,
    color: '#666666',
  },
  verificationContainer: {
    position: 'relative',
    width: '100%',  // 컨테이너 전체 너비 사용
  },
  verificationInput: {
    width: '100%',  // 입력 필드 전체 너비 사용
    paddingRight: 60,  // 타이머 텍스트 공간 확보
    marginRight: 0,  // 기존 마진 제거
  },
  timerText: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -8 }],
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '600',
  },
  passwordGuide: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emailGuide: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default UserSetting;