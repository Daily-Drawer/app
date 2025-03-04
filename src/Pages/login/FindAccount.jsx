import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FindAccount = () => {
  return (
    <View style={styles.container}>
      <Text>FindAccount</Text>
    </View>
  );
};

export default FindAccount;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});