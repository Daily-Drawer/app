import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import KaKaoLogin from './KaKaoLogin';

const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.SafeView}>
    <View style={styles.container}>
      <View style={styles.titleView}>
        <Text style={styles.titleText}>title</Text>
        <Text> 무작위 음식점 추천앱</Text>
      </View>
      <View style={styles.logoView}>
        <Text>logo</Text>
      </View>
      <View style={styles.loginView}>
        <KaKaoLogin />
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
    flex: 1,  // 각 구역을 균등하게 분할
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoView: {
    flex: 1,  // 각 구역을 균등하게 분할
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginView: {
    flex: 1,  // 각 구역을 균등하게 분할
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 54,
  },
});


export default LoginScreen;
