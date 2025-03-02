import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import BasicHeader from '../../components/BasicHeader';
import api from '../../apis/axios';
import useAuthStore from '../../store/authStore';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Withdrawal = () => {
  const { logout, userInfo, updateUserInfo } = useAuthStore();
  const navigation = useNavigation();

  // 컴포넌트 마운트 시 사용자 정보 업데이트
  useEffect(() => {
    updateUserInfo();
  }, []);

  const clearStorageAndLogout = async () => {
    try {
      // AsyncStorage 완전 초기화
      await AsyncStorage.clear();
      // Zustand 스토어 초기화
      await logout();
      
      // 네비게이션 스택을 초기화하고 로그인 화면으로 이동
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
    }
  };

  const handleWithdrawal = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말 탈퇴하시겠습니까?\n\n' +
      '⚠️ 주의사항\n' +
      '• 모든 다이어리 기록이 즉시 삭제됩니다.\n' +
      '• 삭제된 데이터는 복구할 수 없습니다.\n' +
      '• 탈퇴 후 동일 계정으로 재가입이 가능합니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            // 한번 더 확인
            Alert.alert(
              '최종 확인',
              '모든 데이터가 즉시 삭제되며 \n 복구할 수 없습니다.\n계속하시겠습니까?',
              [
                {
                  text: '취소',
                  style: 'cancel',
                },
                {
                  text: '탈퇴',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (!userInfo.email) {
                        throw new Error('사용자 정보를 찾을 수 없습니다.');
                      }
                      const accessToken = await AsyncStorage.getItem('accessToken');
                      const response = await api.delete('/api/v1/auth', {
                        headers: {
                          'Authorization': `Bearer ${accessToken}`,
                        },
                        data: {
                          userName: userInfo.email,  // authStore에서 가져온 이메일 사용
                        }
                      });
                      
                      if (response.status === 200) {
                        Alert.alert(
                          '회원 탈퇴 완료',
                          '정상적으로 탈퇴되었습니다.',
                          [
                            {
                              text: '확인',
                              onPress: clearStorageAndLogout
                            }
                          ],
                          { cancelable: false }
                        );
                      } else {
                        throw new Error('탈퇴 처리에 실패했습니다.');
                      }
                    } catch (error) {
                      console.error('회원 탈퇴 실패:', error);
                      Alert.alert(
                        '오류', 
                        error.message === '사용자 정보를 찾을 수 없습니다.' 
                          ? error.message 
                          : error.response?.status === 403 
                            ? '권한이 없습니다. 다시 로그인 후 시도해주세요.'
                            : '회원 탈퇴에 실패했습니다. 다시 시도해주세요.'
                      );
                    }
                  },
                }
              ]
            );
          },
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title="회원 탈퇴" />
      <View style={styles.content}>
        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>회원 탈퇴 전 꼭 확인해주세요!</Text>
          <View style={styles.warningList}>
            <Text style={styles.warningText}>• 현재 계정의 모든 게시물과 개인정보가 삭제됩니다.</Text>
            <Text style={styles.warningText}>• 삭제된 데이터는 복구할 수 없습니다.</Text>
            <Text style={styles.warningText}>• 탈퇴 후 동일한 계정으로 재가입이 가능합니다.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.withdrawalButton}
          onPress={handleWithdrawal}
        >
          <Text style={styles.withdrawalButtonText}>회원 탈퇴</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  warningSection: {
    marginBottom: 40,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  warningList: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  withdrawalButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Withdrawal;
