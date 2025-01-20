import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomBottomTab from '../components/CustomBottomTab';
import useAuthStore from '../store/authStore';

// Screens
import SplashScreen from '../Pages/Splash/SplashScreen';
import LoginScreen from '../Pages/login/LoginScreen';
import HomeMap from '../Pages/HomeMap/HomeMap';
import Group from '../Pages/Group/Group';
import MyPage from '../Pages/MyPage/MyPage';
import SignUp from '../Pages/SignUp/SignUp';
import DiaryStack from './DiaryStack';
import PasswordLogin from '../components/PasswordLogin';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const renderTabBar = props => <CustomBottomTab {...props} />;

const MainTab = () => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
      }}
      backBehavior="history">
      <Tab.Screen name="지도" component={HomeMap} />
      <Tab.Screen name="다이어리" component={DiaryStack}
        options={{
          tabBarLabel: '다이어리',
        }}
      />
      <Tab.Screen name="그룹" component={Group} />
      <Tab.Screen name="내정보" component={MyPage} />
    </Tab.Navigator>
  );
};

const Router = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, checkAuth } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      setIsLoading(false);
    };

    initialize();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="MainTab" component={MainTab} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="PasswordLogin" component={PasswordLogin} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Router;
