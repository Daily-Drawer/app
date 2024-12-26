import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MyPage = () => {
  return (
    <View style={styles.container}>
      <Text>내정보</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MyPage;
