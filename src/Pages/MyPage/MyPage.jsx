import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert, Image } from 'react-native';
import useAuthStore from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

const MyPage = () => {
  const { userInfo, updateUserInfo } = useAuthStore();
  const logout = useAuthStore(state => state.logout);
  const navigation = useNavigation();

  useEffect(() => {
    updateUserInfo().catch(error => {
      console.error('사용자 정보 조회 실패:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    });
  }, []);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>하루서랍</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.username}>{userInfo.username}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <View style={styles.menuRow}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserSetting', { userInfo })}>
            <Text style={styles.menuText}>프로필 설정</Text>
            <Image source={settingIcon} style={styles.settingIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => navigation.navigate('ServiceCenter')}
        >
          <Text style={styles.settingText}>고객센터</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => navigation.navigate('AppSettings')}
        >
          <Text style={styles.settingText}>APP 설정</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Text style={styles.settingText}>로그아웃</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const settingIcon = require('../../assets/icon/settingicon.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'establishRetrosans',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRow: {
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    padding: 8,
    borderRadius: 10,
    borderColor: '#eee',
  },
  menuText: {
    fontSize: 16,
  },
  settingsSection: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginVertical: 10,
  },
  settingText: {
    fontSize: 16,
  },
  settingIcon: {
    width: 20,
    height: 20,
    opacity: 0.7,
  },
  arrow: {
    fontSize: 16,
    color: '#666',
  },
});

export default MyPage;
