import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomBottomTab from '../components/CustomBottomTab';

// Screens
import SplashScreen from '../Pages/Splash/SplashScreen';
import LoginScreen from '../Pages/login/LoginScreen';
import HomeMap from '../Pages/HomeMap/HomeMap';
import RandomFood from '../Pages/RandomFood/RandomFood';
import Group from '../Pages/Group/Group';
import MyPage from '../Pages/MyPage/MyPage';
import SignUp from '../Pages/SignUp/SignUp';

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
      <Tab.Screen name="근처 맛집" component={HomeMap} />
      <Tab.Screen name="음식 추천" component={RandomFood} />
      <Tab.Screen name="그룹" component={Group} />
      <Tab.Screen name="내정보" component={MyPage} />
    </Tab.Navigator>
  );
};

const Router = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const [accessToken] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);

      if (accessToken) {
        console.log('저장된 액세스 토큰:', accessToken);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoading ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : (
        <>
          {!isLoggedIn ? (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  animationTypeForReplace: !isLoggedIn ? 'pop' : 'push',
                }}
              />
              <Stack.Screen name="SignUp" component={SignUp} />
            </>
          ) : null}
          <Stack.Screen name="MainTab" component={MainTab} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Router;
