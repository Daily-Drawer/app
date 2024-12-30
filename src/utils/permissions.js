import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const PERMISSIONS_TYPE = {
  LOCATION: 'LOCATION',
  NOTIFICATION: 'NOTIFICATION',
  PHOTO: 'PHOTO',
};

export const PERMISSION_MAP = {
  [PERMISSIONS_TYPE.LOCATION]: Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }),
  [PERMISSIONS_TYPE.NOTIFICATION]: Platform.select({
    ios: PERMISSIONS.IOS.NOTIFICATIONS,
    android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
  }),
  [PERMISSIONS_TYPE.PHOTO]: Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  }),
};

export const checkPermission = async (type) => {
  const permission = PERMISSION_MAP[type];

  try {
    if (!permission) {return false;}

    const result = await check(permission);
    console.log(`${type} permission status:`, result);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('This feature is not available on this device');
        return false;
      case RESULTS.DENIED:
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      case RESULTS.GRANTED:
        return true;
      case RESULTS.BLOCKED:
        console.log('The permission is denied and not requestable anymore');
        return false;
    }
  } catch (error) {
    console.error(`${type} permission check failed:`, error);
    return false;
  }
};