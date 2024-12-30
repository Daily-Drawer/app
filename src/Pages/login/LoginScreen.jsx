import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Button } from 'react-native';
import KaKaoLogin from './KaKaoLogin';
import { isLogined } from '@react-native-kakao/user';
import { useNavigation } from '@react-navigation/native';
import { PERMISSIONS_TYPE, checkPermission } from '../../utils/permissions';

const LoginScreen = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    checkPermission(PERMISSIONS_TYPE.NOTIFICATION);
  }, []);

  //로그인 테스트
  const logincheck = () => {
    if (isLogined){
      navigation.navigate('MainTab');
    }
  }

  return (
    <SafeAreaView style={styles.SafeView}>
      <View style={styles.container}>
        <View style={styles.titleView}>
          <Text style={styles.titleText}>title</Text>
          <Text>무작위 음식점 추천앱</Text>
        </View>
        <View style={styles.logoView}>
          <Text>logo</Text>
        </View>
        <View style={styles.loginView}>
          <KaKaoLogin />
          <Button title="로그인 확인" onPress={() => logincheck()} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  titleView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 54,
  },
});

export default LoginScreen;
