import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, Platform } from 'react-native';
import KaKaoLogin from '../../components/KaKaoLogin';
import CustomLogin from '../../components/CustomLogin';
import AppleLogin from '../../components/AppleLogin';
import { useNavigation } from '@react-navigation/native';
import { wp, hp, fs, spacing, metrics } from '../../utils/responsive';

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.SafeView}>
      <View style={styles.container}>
        <View style={styles.titleView}>
          <Image source={logoIcon} style={styles.logoImage} />
          <Text style={styles.titleText}>하루서랍</Text>
        </View>

        <View style={styles.loginView}>
          <CustomLogin />
          <View style={styles.accountOptionsContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('FindAccount')}>
              <Text style={styles.accountOptionText}>아이디 찾기</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
              <Text style={styles.accountOptionText}>비밀번호 찾기</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => navigation.navigate('SignUp', { loginType: 'email' })}>
              <Text style={styles.accountOptionText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.snsLoginView}>
          <View style={styles.snsLoginTextContainer}>
            <View style={styles.snsLoginTextLine} />
            <Text style={styles.snsLoginText}>SNS로 간편하게 로그인</Text>
            <View style={styles.snsLoginTextLine} />
          </View>

          <View style={styles.snsLoginContainer}>
            <KaKaoLogin />
            {Platform.OS === 'ios' && <AppleLogin />}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const logoIcon = require('../../assets/loginicon/logo.png');

const styles = StyleSheet.create({
  SafeView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: metrics.statusBarHeight,
    paddingBottom: metrics.bottomSpace,
  },
  titleView: {
    gap: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        marginTop: hp(6),
      },
      android: {
        marginTop: hp(6),
      },
    }),
  },
  logoImage: {
    width: wp(35), // 로고 이미지 크기 조정
    height: wp(35), // 정사각형 유지
    resizeMode: 'contain',
  },
  loginView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(5),
    gap: spacing.sm,
  },
  titleText: {
    fontSize: fs(42), // 반응형 폰트 사이즈
    fontFamily: 'establishRetrosans',
  },
  accountOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  accountOptionText: {
    color: '#666666',
    fontSize: fs(14),
  },
  divider: {
    borderWidth: 1,
    height: '80%',
    borderColor: '#CCCCCC',
  },
  snsLoginView: {
    marginTop: hp(7),
  },
  snsLoginTextContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  snsLoginText: {
    color: '#666666',
    fontSize: fs(14),
  },
  snsLoginTextLine: {
    width: wp(25), // 화면 너비의 25%
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  snsLoginContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
