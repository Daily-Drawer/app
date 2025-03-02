import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomTextTitle = ({ children, style }) => {
  return (
    <Text style={[styles.title, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: '500',
    fontFamily: 'BMJUA',
    fontSize: 24,
    color: '#000000',
  },
});

export default CustomTextTitle;
