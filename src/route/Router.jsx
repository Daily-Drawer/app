import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import CustomBottomTab from '../components/CustomBttomTab';
import HomeMap from '../Pages/HomeMap/HomeMap';
import RandomFood from '../Pages/RandomFood/RandomFood';
import Group from '../Pages/Group/Group';
import MyPage from '../Pages/MyPage/MyPage';
import LoginScreen from '../Pages/login/LoginScreen';


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
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerMode: false,
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTab" component={MainTab} />
    </Stack.Navigator>
  );
};

export default Router;
