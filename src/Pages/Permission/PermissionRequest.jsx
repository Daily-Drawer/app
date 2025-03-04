import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import PermissionUtil from '../../utils/PermissionUtil';
import { APP_PERMISSIONS } from '../../constants/permissions';

const PermissionRequest = ({ onComplete }) => {
  const [permissions, setPermissions] = useState({
    location: false,
    photo: false,
  });

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    const permissionStatus = {};
    for (const key of Object.keys(APP_PERMISSIONS)) {
      permissionStatus[key] = await PermissionUtil.checkPermission(key);
    }
    setPermissions(permissionStatus);
  };

  const handlePermissionToggle = async (key) => {
    const granted = await PermissionUtil.requestPermission(key);
    if (!granted && PermissionUtil.isRequired(key)) {
      Alert.alert(
        '필수 권한 알림',
        `${APP_PERMISSIONS[key].title} 권한은 필수 권한입니다. 설정에서 권한을 허용해주세요.`,
        [
          { text: '설정으로 이동', onPress: PermissionUtil.openSettings },
          { text: '취소', style: 'cancel' },
        ]
      );
    }
    checkAllPermissions();
  };

  const handleContinue = async () => {
    const locationGranted = await PermissionUtil.checkPermission('location');
    
    if (!locationGranted) {
      Alert.alert(
        '필수 권한 필요',
        '위치 권한은 지도 서비스 이용을 위해 꼭 필요한 권한입니다.',
        [{ text: '확인', style: 'default' }]
      );
      return;
    }

    if (onComplete) {
      onComplete();
    }
  };

  // 위치 권한이 허용되었는지 확인
  const isLocationPermissionGranted = permissions.location;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>권한 설정</Text>
        <Text style={styles.subtitle}>
          원활한 서비스 이용을 위해{'\n'}
          다음 권한의 허용이 필요합니다
        </Text>
      </View>

      <View style={styles.permissionList}>
        {Object.entries(APP_PERMISSIONS).map(([key, config]) => (
          <TouchableOpacity 
            key={key} 
            style={styles.permissionItem}
            onPress={() => handlePermissionToggle(key)}
          >
            <View>
              <Text style={styles.permissionTitle}>
                {config.title}
                {config.type === 'required' && 
                  <Text style={styles.requiredText}> (필수)</Text>
                }
              </Text>
              <Text numberOfLines={2} style={styles.description}>{config.description}</Text>
            </View>
            <View style={styles.toggleContainer}>
              <Text style={[
                styles.toggleText,
                { color: permissions[key] ? '#34C759' : '#FF3B30' }
              ]}>
                {permissions[key] ? '허용됨' : '허용안됨'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[
          styles.continueButton,
          !isLocationPermissionGranted && styles.continueButtonDisabled
        ]} 
        onPress={handleContinue}
        disabled={!isLocationPermissionGranted}
      >
        <Text style={[
          styles.continueText,
          !isLocationPermissionGranted && styles.continueTextDisabled
        ]}>
          시작하기
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  permissionList: {
    flex: 1,
    padding: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  requiredText: {
    color: '#FF3B30',
    fontSize: 12,
  },
  toggleContainer: {
    alignItems: 'flex-end',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    margin: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueTextDisabled: {
    color: '#888',
  },
});

export default PermissionRequest; 