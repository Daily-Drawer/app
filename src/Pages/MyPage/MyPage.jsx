import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { applogout } from '../../utils/auth';

const MyPage = () => {
  const navigation = useNavigation();
  const [loginType, setLoginType] = useState(null);

  useEffect(() => {
    // 로그인 타입 가져오기
    const getLoginType = async () => {
      const type = await AsyncStorage.getItem('loginType');
      setLoginType(type);
    };
    getLoginType();
  }, []);

  const handleLogout = async () => {
    try {
      await applogout(loginType);
      // 로그인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      Alert.alert('로그아웃 실패', '다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      <View style={styles.container}>
        <Text>내정보</Text>
        <TouchableOpacity style={{borderWidth: 1}} onPress={handleLogout}>
          <Text>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default MyPage;
