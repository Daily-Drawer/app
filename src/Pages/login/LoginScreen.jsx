import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import KaKaoLogin from '../../components/KaKaoLogin';
import CustomLogin from '../../components/CustomLogin';

const LoginScreen = () => {

  return (
    <SafeAreaView style={styles.SafeView}>
      <View style={styles.container}>
        <View style={styles.titleView}>
          <Text style={styles.titleText}>What2Eat</Text>
          <Text>이 앱은 음식점 추천 앱인가 모임 앱인가</Text>
        </View>
        <View style={styles.loginView}>
          <CustomLogin />
          <KaKaoLogin />
        </View>
        <View style={styles.accountOptionsContainer}>
          <TouchableOpacity>
            <Text style={styles.accountOptionText}>계정 찾기</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity>
            <Text style={styles.accountOptionText}>비밀번호 재설정</Text>
          </TouchableOpacity>
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
  loginView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  titleText: {
    fontSize: 54,
  },
  accountOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  accountOptionText: {
    color: '#666666',
    fontSize: 14,
  },
  divider: {
    borderWidth: 1,
    height: '80%',
    borderColor: '#CCCCCC',
  },
});

export default LoginScreen;
