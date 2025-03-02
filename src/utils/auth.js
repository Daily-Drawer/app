import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../apis/axios';
import { Alert } from 'react-native';
import useAuthStore from '../store/authStore';
import { navigationRef } from './navigationRef';
import { CommonActions } from '@react-navigation/native';
// 토큰 저장 함수
export const saveTokens = async (tokens) => {
  try {
    if(tokens.accessToken && tokens.refreshToken){

      const accessToken = tokens.accessToken.replace('Bearer ', '');
      const refreshToken = tokens.refreshToken.replace('Bearer ', '');

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      console.log('토큰 저장 완료:', tokens);
    }
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
};

// 카카오 로그인 성공 처리 함수
export const handleKakaoLoginSuccess = async (response, navigation) => {
  try {
    console.log('카카오 로그인 응답:', response.data); // 서버 응답 확인
    const setIsLoggedIn = useAuthStore.getState().setIsLoggedIn;
    // 1. 이미 다른 방식으로 가입된 계정 체크
    if (response.status === 409 || response.data.code === '409') {
      console.log('중복 계정 데이터:', response.data.data); // 중복 계정 정보 확인
      Alert.alert(
        '로그인 안내',
        '이미 다른 방식으로 가입된 계정입니다.',
        [{ text: '확인' }]
      );
      return false;
    }

    // 2. 신규 회원 체크
    if (response.data.code === '307') {
      navigation.navigate('SignUp', {
        email: response.data.data.email,
        loginType: 'kakao',
        kakaoAccessToken: response.config.params.kakaoAccessToken,
      });
      return false;
    }

    // 3. 정상 로그인
    if (response.status === 200 && response.data.data?.tokens) {
      const tokens = {
        accessToken: response.data.data.tokens.accessToken,
        refreshToken: response.data.data.tokens.refreshToken,
      };
      
      await saveTokens(tokens);
      await AsyncStorage.setItem('loginType', 'kakao');
      setIsLoggedIn(true);

      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTab' }],
        })
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('카카오 로그인 처리 실패:', error);
    throw error;
  }
};

// 애플 로그인 성공 처리 함수
export const handleAppleLoginSuccess = async (response, navigation) => {
  try {
    const setIsLoggedIn = useAuthStore.getState().setIsLoggedIn;

    // 1. 이미 다른 방식으로 가입된 계정 체크
    if (response.status === 409 || response.data.code === '409') {
      const provider = response.data.data?.provider || '다른';
      Alert.alert(
        '로그인 안내',
        `이미 ${provider} 계정으로 가입된 이메일입니다.`,
        [{ text: '확인' }]
      );
      return false;
    }
    // 3. 정상 로그인
    if (response.data.data?.tokens) {
      const tokens = {
        accessToken: response.data.data.tokens.accessToken,
        refreshToken: response.data.data.tokens.refreshToken,
      };
      
      await saveTokens(tokens);
      await AsyncStorage.setItem('loginType', 'apple');
      setIsLoggedIn(true);

      Alert.alert(
        '환영합니다!',
        '로그인이 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTab' }],
              });
            }
          }
        ],
        { cancelable: false }
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('애플 로그인 처리 실패:', error);
    throw error;
  }
};

// 회원가입 성공 처리 함수
export const handleSignUpSuccess = async (signUpResponse, loginResponse, navigation, userName) => {
  try {
    const setIsLoggedIn = useAuthStore.getState().setIsLoggedIn;

    if (signUpResponse.status === 201 && loginResponse.status === 200) {
      const tokens = loginResponse.data.data.tokens;
      await saveTokens(tokens);
      await AsyncStorage.setItem('loginType', 'email');

      // Zustand 상태 업데이트
      setIsLoggedIn(true);

      Alert.alert(
        '환영합니다!',
        `${userName}님, 회원가입이 완료되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTab' }],
              });
            }
          }
        ],
        { cancelable: false }
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error('회원가입 처리 실패:', error);
    throw error;
  }
};

// 사용자 정보 조회
export const userData = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await api.get('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('유저 데이터 조회 실패:', error);
    throw error;
  }
};

// 사용자 이름 수정
export const updateUserName = async (newName) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await api.put('/api/v1/auth/me/nickname', {
      nickName: newName
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });
    return response.data;
  } catch (error) {
    console.error('이름 수정 실패:', error);
    throw error;
  }
};

// 사용자 이메일 수정
export const updateUserEmail = async (newEmail) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await api.put('/api/v1/auth/me/email', {
      email: newEmail
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('이메일 수정 실패:', error);
    throw error;
  }
};

// 사용자 비밀번호 수정
export const updateUserPassword = async (password) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await api.put('/api/v1/auth/me/password', {
      password: password
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('비밀번호 수정 실패:', error);
    throw error;
  }
};

// 로컬 로그인 성공 처리 함수
export const handleLoginSuccess = async (response, navigation, loginType) => {
  try {
    const setIsLoggedIn = useAuthStore.getState().setIsLoggedIn;

    // 1. 이미 다른 방식으로 가입된 계정 체크
    if (response.status === 409 || response.data.code === '409') {
      const provider = response.data.data?.provider || '다른';
      Alert.alert(
        '로그인 안내',
        `이미 ${provider} 계정으로 가입된 이메일입니다.`,
        [{ text: '확인' }]
      );
      return false;
    }

    // 2. 정상 로그인
    if (response.data.data?.tokens) {
      const tokens = {
        accessToken: response.data.data.tokens.accessToken,
        refreshToken: response.data.data.tokens.refreshToken,
      };
      
      await saveTokens(tokens);
      await AsyncStorage.setItem('loginType', loginType);
      setIsLoggedIn(true);

      // Stack Overflow 답변 기반으로 수정된 네비게이션 리셋
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'MainTab' }
          ],
        })
      );
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('로그인 처리 실패:', error);
    throw error;
  }
};