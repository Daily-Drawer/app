import React from 'react';
import { Button, View} from 'react-native';
import { login,isLogined } from '@react-native-kakao/user';


const KaKaoLogin = () => {
  return (
    <View>
      <Button title="카카오 로그인" onPress={handleLogin} />
      <Button title="로그인 확인" onPress={() => console.log(isLogined())} />
    </View>
  );
};
const handleLogin = async () => {
  try {
    const result = await login();
    console.log('Login Success', JSON.stringify(result));
    // 로그인 성공 후 사용자 프로필 가져오기 등 추가 작업 가능
  } catch (error) {
    if (error.code === 'E_CANCELLED_OPERATION') {
      console.log('Login Cancelled', error.message);
    } else {
      console.log(`Login Failed (code: ${error.code})`, error.message);
    }
  }
};



export default KaKaoLogin;
