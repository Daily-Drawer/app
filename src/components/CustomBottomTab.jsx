import React, {useRef} from 'react';
import {View, TouchableOpacity, StyleSheet, Animated, Text, SafeAreaView} from 'react-native';

const CustomBottomTab = ({state, navigation, insets, descriptors}) => {
  const tab1Value = useRef(new Animated.Value(0)).current;
  const tab2Value = useRef(new Animated.Value(0)).current;
  const tab3Value = useRef(new Animated.Value(0)).current;
  const tab4Value = useRef(new Animated.Value(0)).current;

  const scaleAnimated = (value, andimatedValue) =>
    Animated.timing(andimatedValue, {
      useNativeDriver: true,
      toValue: value,
      duration: 150,
    });

  const andimatedValues = {
    0: tab1Value,
    1: tab2Value,
    2: tab3Value,
    3: tab4Value,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bottomTabBarContainer}>
        {state.routes.map((route, index) => {
          const label = route.name;
          const isFocused = state.index === index;
          const animatedOf = andimatedValues[index];

          const iconFlag = bool => {
            switch (label) {
              case '근처 맛집':
                return bool ? map_on : map_off;
              case '음식 추천':
                return bool ? randomfood_on : randomfood_off;
              case '그룹':
                return bool ? users_on : users_off;
              case '내정보':
                return bool ? user_on : user_off;
              default:
                return some;
            }
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
            scaleAnimated(1, animatedOf).start(({finished}) => {
              if (finished) {
                scaleAnimated(0, animatedOf).start();
              }
            });
          };

          return (
            <TouchableOpacity
              style={styles.bottomTabBarWrapper}
              key={index}
              activeOpacity={0.7}
              onPress={onPress}>
              <Animated.Image
                source={iconFlag(isFocused)}
                resizeMode={'contain'}
                style={[styles.AnimatedImage, {
                  transform: [
                    {
                      scale: animatedOf.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.9],
                      }),
                    },
                  ],
                }]}
              />
              <View style={styles.iconTextContainer}>
                <Text style={styles.iconText}>{route.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const map_on = require('../assets/bottomtaps/map_on.png');
const map_off = require('../assets/bottomtaps/map.png');
const randomfood_on = require('../assets/bottomtaps/randomfood_on.png');
const randomfood_off = require('../assets/bottomtaps/randomfood_off.png');
const users_on = require('../assets/bottomtaps/users_on.png');
const users_off = require('../assets/bottomtaps/users.png');
const user_on = require('../assets/bottomtaps/user_on.png');
const user_off = require('../assets/bottomtaps/user.png');
const some = require('../assets/bottomtaps/some.png');

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFF',
  },
  bottomTabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    borderStyle: 'solid',
    borderTopWidth: 0.5,
    borderColor: '#C3C3C3',
    backgroundColor: '#FFF',
    paddingTop: 8,
    height: 80,  // 고정 높이 설정
  },
  bottomTabBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  AnimatedImage: {
    width: 28,
    height: 28,
  },
  iconTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  iconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CustomBottomTab;
