import React from 'react';
import { StyleSheet, View } from 'react-native';
import KakaoMapView from './KaKaoMapView';

const HomeMap = () => {
  return (
    <View style={styles.container}>
      <KakaoMapView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default HomeMap;
