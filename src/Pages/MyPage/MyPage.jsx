import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../../apis/axios';
import { navigationRef } from '../../utils/navigationRef';
import { CommonActions } from '@react-navigation/native';
import { Alert } from 'react-native';

const MyPage = () => {
  const navigation = useNavigation();
  const [loginType, setLoginType] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // 로그인 정보 가져오기
    const getLoginInfo = async () => {
      try {
        const [type, token] = await Promise.all([
          AsyncStorage.getItem('loginType'),
          AsyncStorage.getItem('accessToken'),
        ]);
        setLoginType(type);
        setAccessToken(token);
        // 토큰 확인용 (개발 중에만 사용)
        console.log('현재 액세스 토큰:', token);
      } catch (error) {
        console.error('로그인 정보 가져오기 실패:', error);
      }
    };
    getLoginInfo();
  }, []);

  const handleLogout = async () => {
    try {
      Alert.alert(
        '로그아웃',
        '로그아웃을 하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel'
          },
          {
            text: '확인',
            onPress: async () => {
              try {
                // 1. 서버에 로그아웃 요청 (현재 state의 accessToken 사용)
                await api.post('/api/v1/auth/logout', null, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                });

                // 2. accessToken만 초기화
                await AsyncStorage.removeItem('accessToken');

                // 3. 루트 네비게이터를 통해 로그인 화면으로 이동
                navigationRef.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }]
                  })
                );
              } catch (error) {
                console.error('로그아웃 실패:', error);
                Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      <View style={styles.container}>
        <Text>내정보</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
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
    padding: 20,
  },
  logoutButton: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
  }
});

export default MyPage;
