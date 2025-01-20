import { logout } from '@react-native-kakao/user';
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

      // Bearer 접두어가 있다면 제거
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

// 로그인 성공 처리 함수
export const handleLoginSuccess = async (response, navigation, loginType = 'kakao') => {
  try {
    const setIsLoggedIn = useAuthStore.getState().setIsLoggedIn;

    // 307 상태 코드 체크 (카카오 로그인의 경우)
    if (response.status === 200 && response.data.code === '307' ) {
      navigation.navigate('SignUp', {
        email: response.data.data,
        loginType: 'kakao',
        kakaoAccessToken: response.config.params.kakaoAccessToken,
      });
      return false;
    }

    // 409 상태 코드 체크 (이메일 로그인 시도시 카카오 계정인 경우)
    if (response.status === 409) {
      Alert.alert(
        '로그인 안내',
        '해당 이메일은 카카오 계정으로 가입되어 있습니다.\n카카오 로그인을 이용해주세요.',
        [{ text: '확인' }]
      );
      return false;
    }

    if (response.status === 200 && response.data.data?.accessToken && response.data.data?.refreshToken) {
      const tokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
      
      await saveTokens(tokens);
      await AsyncStorage.setItem('loginType', loginType);
      setIsLoggedIn(true);

      setTimeout(() => {
        if (navigationRef.current) {
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTab' }],
            })
          );
        }
      }, 0);

      return true;
    }
    return false;
  } catch (error) {
    console.error('로그인 처리 실패:', error);
    throw error;
  }
};

// 회원가입 성공 처리 함수
export const handleSignUpSuccess = async (signUpResponse, loginResponse, navigation, userName) => {
  try {
    const setIsLoggedIn = useAuthStore.getState().setIsLoggedIn;

    if (signUpResponse.status === 201 && loginResponse.status === 200) {
      const tokens = loginResponse.data.data;
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
              // navigationRef를 사용하여 MainTab으로 이동
              if (navigationRef.current) {
                navigationRef.current.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MainTab' }],
                  })
                );
              }
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

export const applogout = async (storedLoginType) => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    // 1. 서버에 로그아웃 요청 보내기 (이메일 로그인 타입일 경우)
    if (storedLoginType === 'email' && accessToken) {
      try {
        await api.post('/api/v1/auth/logout', null, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.error('서버 로그아웃 요청 실패:', error);
      }
    }

    // 2. 카카오 로그인 타입일 경우 카카오 SDK 로그아웃
    if (storedLoginType === 'kakao') {
      try {
        await logout();
      } catch (error) {
        console.error('카카오 로그아웃 실패:', error);
      }
    }

    // 3. 로컬 데이터 삭제
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'loginType'
    ]);

    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};
