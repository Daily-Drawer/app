import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

const HomeMap = () => {
  return (
    <SafeAreaView style={styles.SafeView}>
      <View>
        <Text>홈</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeView: {
    flex: 1,
  },
});

export default HomeMap;
