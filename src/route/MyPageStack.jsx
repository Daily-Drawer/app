import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPage from '../Pages/MyPage/MyPage';
import AppSettings from '../Pages/MyPage/AppSettings';
import ServiceCenter from '../Pages/MyPage/ServiceCenter';
import UserSetting from '../Pages/MyPage/UserSetting';
import { Platform, StatusBar } from 'react-native';
import Withdrawal from '../Pages/MyPage/Withdrawal';
import LicensePage from '../Pages/Settings/LicensePage';
const Stack = createNativeStackNavigator();

const MyPageStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: Platform.OS === 'android' ? {
          paddingTop: StatusBar.currentHeight,
        } : undefined,
      }}
    >
      <Stack.Screen
        name="MyPage"
        component={MyPage}
      />
      <Stack.Screen
        name="ServiceCenter"
        component={ServiceCenter}
        options={{ title: '고객센터' }}
      />
      <Stack.Screen
        name="AppSettings"
        component={AppSettings}
        options={{ title: 'APP 설정' }}
      />
      <Stack.Screen
        name="UserSetting"
        component={UserSetting}
        options={{ title: '프로필 설정' }}
      />
      <Stack.Screen
        name="LicensePage"
        component={LicensePage}
        options={{ title: '라이선스' }}
      />
      <Stack.Screen
        name="Withdrawal"
        component={Withdrawal}
        options={{ title: '회원탈퇴' }}
      />
    </Stack.Navigator>
  );
};

export default MyPageStack;