import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Diary from '../Pages/Diary/Diary';
import DiaryDetail from '../Pages/Diary/DiaryDetail';
import DiaryCreate from '../Pages/Diary/DiaryCreate';

const Stack = createNativeStackNavigator();

const DiaryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DiaryMain" component={Diary} />
      <Stack.Screen name="DiaryDetail"component={DiaryDetail} />
      <Stack.Screen name="DiaryCreate" component={DiaryCreate} />
    </Stack.Navigator>
  );
};

export default DiaryStack;
