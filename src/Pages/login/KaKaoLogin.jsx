import React from 'react';
import { Button, View } from 'react-native';
import { login, isLogined } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';

const KaKaoLogin = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const result = await login();
      console.log('Login Success', JSON.stringify(result));
      
      // 로그인 성공 시 MainTab으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      });
      
    } catch (error) {
      if (error.code === 'E_CANCELLED_OPERATION') {
        console.log('Login Cancelled', error.message);
      } else {
        console.log(`Login Failed (code: ${error.code})`, error.message);
      }
    }
  };

  return (
    <View>
      <Button title="카카오 로그인" onPress={handleLogin} />
      <Button title="로그인 확인" onPress={() => console.log(isLogined)} />
    </View>
  );
};

export default KaKaoLogin;
