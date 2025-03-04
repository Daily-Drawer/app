import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Diary from '../Pages/Diary/Diary';
import DiaryDetail from '../Pages/Diary/DiaryDetail';
import DiaryCreate from '../Pages/Diary/DiaryCreate';
import DiaryEdit from '../Pages/Diary/DiaryEdit';
import { StatusBar, Platform } from 'react-native';

const Stack = createNativeStackNavigator();

const DiaryStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="DiaryHome"
      screenOptions={{
        headerShown: false,
        contentStyle: Platform.OS === 'android' ? {
          paddingTop: StatusBar.currentHeight
        } : undefined,
      }}
    >
      <Stack.Screen name="DiaryHome" component={Diary} />
      <Stack.Screen name="DiaryDetail" component={DiaryDetail} />
      <Stack.Screen name="DiaryCreate" component={DiaryCreate} />
      <Stack.Screen name="DiaryEdit" component={DiaryEdit} />
    </Stack.Navigator>
  );
};

export default DiaryStack;
