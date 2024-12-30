import { useEffect } from 'react';
import { PERMISSIONS_TYPE, checkPermission } from '../utils/permissions';

export const usePermission = (type) => {
  useEffect(() => {
    checkPermission(type);
  }, [type]);
};
