import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import KakaoMapView from './KaKaoMapView';
import { PERMISSIONS_TYPE, checkPermission } from '../../utils/permissions';

const HomeMap = () => {
  useEffect(() => {
    checkPermission(PERMISSIONS_TYPE.LOCATION);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KakaoMapView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});

export default HomeMap;
