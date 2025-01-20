import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Image} from 'react-native';

const BasicHeader = ({title}) => {
  const navigiation = useNavigation();
  return (
    <View style={styles.headerWrapper}>
      <TouchableOpacity
        onPress={() => navigiation.goBack()}>
        <Image style={styles.backbuttonimg} source={backbutton} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.backbuttonimg} />
    </View>
  );
};

const backbutton = require('../assets/icon/leftbackicon.png');

const styles = StyleSheet.create({
  headerWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backbuttonimg: {
    width: 24,
    height: 24,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shareicons: {
    width: 44,
    height: 44,
  },
});

export default BasicHeader;
