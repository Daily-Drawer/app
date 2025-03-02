import { Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';

export const APP_PERMISSIONS = {
  location: {
    type: 'required',
    title: '위치',
    description: '현재 위치 기반의 지도 서비스 및 주변 지역 정보 제공을 위해 \n필요한 권한입니다',
    permissions: Platform.select({
      ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
      android: [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
    })
  },
  photo: {
    type: 'optional',
    title: '앨범',
    description: '다이어리에 기록할 때 사진을 첨부하기 위해 필요한 권한입니다',
    permissions: Platform.select({
      ios: [PERMISSIONS.IOS.PHOTO_LIBRARY],
      android: Platform.Version >= 33 
        ? [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES]
        : [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]
    })
  }
}; 