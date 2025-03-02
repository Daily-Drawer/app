import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import appleAuth, {
} from '@invertase/react-native-apple-authentication';
import api from '../apis/axios';
import { handleAppleLoginSuccess } from '../utils/auth';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

const AppleLogin = () => {
  const navigation = useNavigation();

  const handleAppleLogin = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [
          appleAuth.Scope.FULL_NAME,
          appleAuth.Scope.EMAIL,
        ],
      });

      console.log('Apple Auth Response:', appleAuthRequestResponse);

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      if (credentialState === appleAuth.State.AUTHORIZED) {
        try {
          const response = await api.post('/api/v1/auth/login/apple', null, {
            params: {
              authorizationCode: appleAuthRequestResponse.authorizationCode,
            },
          });

          // 신규 회원이든 기존 회원이든 모두 handleAppleLoginSuccess로 처리
          const loginResult = await handleAppleLoginSuccess(response, navigation);
          if (!loginResult) {
            return;
          }

        } catch (error) {
          console.error('서버 통신 에러:', error);
          Alert.alert('로그인 실패', '서버 통신 중 문제가 발생했습니다.');
        }
      }
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in');
        return;
      }
      console.error('Apple 로그인 에러:', error);
      Alert.alert('오류', 'Apple 로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleAppleLogin}>
      <Image source={appleLogo} style={styles.logo} />
    </TouchableOpacity>
  );
};

const appleLogo = require('../assets/loginicon/appleidbutton.png');

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
  },
});

export default AppleLogin;