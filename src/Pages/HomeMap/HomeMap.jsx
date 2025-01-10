import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Platform, View, Alert } from 'react-native';
import KakaoMapView from './KaKaoMapView';
// import * as Permissions from 'react-native-permissions';
// import Geolocation from '@react-native-community/geolocation';

const HomeMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // useEffect(() => {
  //   const requestLocationPermission = async () => {
  //     try {
  //       const locationPermission = Platform.select({
  //         ios: Permissions.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  //         android: Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  //       });

  //       const result = await Permissions.request(locationPermission);
        
  //       if (result === Permissions.RESULTS.GRANTED) {
  //         console.log('위치 권한이 허용되었습니다.');
  //         setLocationPermission(true);
  //         getCurrentLocation();
  //       } else {
  //         console.log('위치 권한이 거부되었습니다:', result);
  //         Alert.alert(
  //           '위치 권한 필요',
  //           '주변 맛집을 찾기 위해 위치 권한이 필요합니다.',
  //           [{ text: '확인' }]
  //         );
  //       }
  //     } catch (error) {
  //       console.error('위치 권한 요청 중 오류가 발생했습니다:', error);
  //     }
  //   };

  //   const getCurrentLocation = () => {
  //     Geolocation.getCurrentPosition(
  //       position => {
  //         const { latitude, longitude } = position.coords;
  //         setUserLocation({ latitude, longitude });
  //       },
  //       error => {
  //         console.error('위치 가져오기 실패:', error);
  //         Alert.alert(
  //           '위치 확인 실패',
  //           '현재 위치를 가져올 수 없습니다. 기본 위치로 설정됩니다.',
  //           [{ text: '확인' }]
  //         );
  //       },
  //       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //     );
  //   };

  //   requestLocationPermission();
  // }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <KakaoMapView userLocation={userLocation} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    marginBottom: 40,
  },
});

export default HomeMap;
