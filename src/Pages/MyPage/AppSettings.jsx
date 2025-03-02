import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Platform, Switch } from 'react-native';
import PermissionUtil from '../../utils/PermissionUtil';
import { APP_PERMISSIONS } from '../../constants/permissions';
import BasicHeader from '../../components/BasicHeader';
import { useNavigation } from '@react-navigation/native';

const AppSettings = () => {
  const navigation = useNavigation();
  const [permissions, setPermissions] = useState({
    location: false,
    photo: false,
  });
  const APP_VERSION = '1.0.0'; // 앱 버전

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
    // 설정으로 이동
    PermissionUtil.openSettings();
  };

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title="APP 설정" />
      <View style={styles.section}>
        {Object.entries(APP_PERMISSIONS).map(([key, config]) => (
          <View key={key} style={styles.settingItem}>
            <View style={styles.textContainer}>
              <Text style={styles.settingText}>
                {config.title}
                {config.type === 'required' && <Text style={styles.requiredText}> (필수)</Text>}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {config.description}
              </Text>
            </View>
            <View style={styles.toggleContainer}>
              <Text style={[
                styles.toggleText,
                { color: permissions[key] ? '#34C759' : '#FF3B30' },
              ]}>
                {permissions[key] ? 'ON' : 'OFF'}
              </Text>
              <Switch
                value={permissions[key]}
                onValueChange={() => handlePermissionToggle(key)}
                trackColor={{ 
                  false: Platform.select({ ios: '#D1D1D6', android: '#D1D1D6' }), 
                  true: Platform.select({ ios: '#34C759', android: '#00C853' }) 
                }}
                thumbColor={Platform.select({
                  ios: '#FFFFFF',
                  android: permissions[key] ? '#FFFFFF' : '#FFFFFF'
                })}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('LicensePage')}>
          <Text style={styles.settingText}>오픈소스 라이선스</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>현재 앱 버전</Text>
          <Text style={styles.versionText}>{APP_VERSION}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 16,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  toggleText: {
    fontSize: 14,
    marginRight: 8,
  },
  requiredText: {
    color: '#FF3B30',
    fontSize: 12,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default AppSettings; 