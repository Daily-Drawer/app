import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomBottomTab from '../components/CustomBottomTab';
import useAuthStore from '../store/authStore';
import { StatusBar, Platform } from 'react-native';
import PermissionRequest from '../Pages/Permission/PermissionRequest';
import PermissionUtil from '../utils/PermissionUtil';

// Screens
import SplashScreen from '../Pages/Splash/SplashScreen';
import LoginScreen from '../Pages/login/LoginScreen';
import HomeMap from '../Pages/HomeMap/HomeMap';
import SignUp from '../Pages/SignUp/SignUp';
import DiaryStack from './DiaryStack';
import MyPageStack from './MyPageStack';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const renderTabBar = props => <CustomBottomTab {...props} />;

const MainTab = () => {


  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const locationPermission = await PermissionUtil.checkPermission('location');
    if (!locationPermission) {
      setShowPermissionModal(true);
    }
  };

  if (showPermissionModal) {
    return <PermissionRequest
      onComplete={() => setShowPermissionModal(false)}
    />;
  }

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
          contentStyle: Platform.OS === 'android' ? {
            paddingTop: StatusBar.currentHeight
          } : undefined,
        }}
        screenListeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const currentRoute = e.target.split('-')[0];
            navigation.navigate(currentRoute, {
              screen: getInitialRouteName(currentRoute)
            });
          },
        })}
        backBehavior="history">
        <Tab.Screen
          name="지도"
          component={HomeMap}
          options={{
            headerShown: false,
            contentStyle: {
              marginTop: -StatusBar.currentHeight || 0,
            },
          }}
        />
        <Tab.Screen
          name="다이어리"
          component={DiaryStack}
          options={{
            tabBarLabel: '다이어리',
          }}
        />
        <Tab.Screen
          name="내정보"
          component={MyPageStack}
          screenOptions={{
            headerShown: false,
            contentStyle: Platform.OS === 'android' ? {
              paddingTop: StatusBar.currentHeight
            } : undefined,
          }}
        />
      </Tab.Navigator>
    </>
  );
};

// 각 탭의 초기 라우트 이름 반환
const getInitialRouteName = (routeName) => {
  switch (routeName) {
    case '지도':
      return 'HomeMap';
    case '다이어리':
      return 'DiaryHome';
    case '내정보':
      return 'MyPageHome';
    default:
      return routeName;
  }
};

const Router = () => {
  const { isLoggedIn, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {isLoggedIn ? (
        <Stack.Screen name="MainTab" component={MainTab} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              contentStyle: Platform.OS === 'android' ? {
                paddingTop: StatusBar.currentHeight,
              } : undefined,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Router;
