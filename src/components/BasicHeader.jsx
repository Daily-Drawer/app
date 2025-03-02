import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { ICON_SIZES, ICON_CONTAINER_SIZES } from '../utils/iconSize';

const BasicHeader = ({title, rediary, onRightPress}) => {
  const navigation = useNavigation();
  return (
    <View style={styles.headerWrapper}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}>
        <Image style={styles.backbuttonimg} source={backbutton} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {rediary ? (
        <TouchableOpacity 
          style={styles.headerRediary}
          onPress={onRightPress}
        >
          <Image source={editicon} style={styles.editicon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backbuttonimg} />
      )}
    </View>
  );
};

const backbutton = require('../assets/icon/leftbackicon.png');
const editicon = require('../assets/icon/editicon.png');

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
    width: ICON_SIZES.md,
    height: ICON_SIZES.md,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRediary: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  RediaryText: {
    fontSize: 16,
    color: 'blue',
    fontWeight: '500',
  },
  shareicons: {
    width: ICON_CONTAINER_SIZES.md,
    height: ICON_CONTAINER_SIZES.md,
  },
  editicon: {
    width: ICON_SIZES.md,
    height: ICON_SIZES.md,
    opacity: 0.9,
  },
});

export default BasicHeader;
