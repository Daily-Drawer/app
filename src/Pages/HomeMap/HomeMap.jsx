import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import KakaoMapView from './KaKaMapView';

const HomeMap = () => {
  

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
