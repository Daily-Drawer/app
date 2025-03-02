import { Platform } from 'react-native';
import { 
  check, 
  request, 
  RESULTS, 
  PERMISSIONS,
  openSettings,
} from 'react-native-permissions';

const PermissionUtil = {
  checkPermission: async (permissionKey) => {
    try {
      let permission;
      
      if (permissionKey === 'location') {
        permission = Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }
      else if (permissionKey === 'photo') {
        if (Platform.OS === 'ios') {
          permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
        } else {
          if (Platform.Version >= 33) {
            permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
          } else {
            permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
          }
        }
      }

      if (!permission) return false;

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  },

  requestPermission: async (permissionKey) => {
    try {
      let permission;
      
      if (permissionKey === 'location') {
        permission = Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }
      else if (permissionKey === 'photo') {
        if (Platform.OS === 'ios') {
          permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
        } else {
          if (Platform.Version >= 33) {
            permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
          } else {
            permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
          }
        }
      }

      if (!permission) return false;

      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  },

  openSettings,

  isRequired: (permissionKey) => {
    const requiredPermissions = {
      location: true,
      photo: false
    };
    return requiredPermissions[permissionKey] || false;
  }
};

export default PermissionUtil; 