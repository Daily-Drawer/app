import React from 'react';
import { Button, View } from 'react-native';
import { login } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';

const KaKaoLogin = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const result = await login();
      console.log('Login Success', result);
      navigation.navigate('Main');
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    <View>
      <Button title="카카오 로그인" onPress={handleLogin} />
    </View>
  );
};

export default KaKaoLogin;
