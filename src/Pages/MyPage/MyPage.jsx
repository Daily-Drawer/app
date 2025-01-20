import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import useAuthStore from '../../store/authStore';

const MyPage = () => {
  const logout = useAuthStore(state => state.logout);
  
  const handleLogout = () => {
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
              await logout();
            } catch (error) {
              console.error('로그아웃 실패:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.viewContainer}>
      <View style={styles.container}>
        <Text>내정보</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
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
