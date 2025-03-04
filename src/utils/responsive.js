import { Dimensions, Platform, StatusBar } from 'react-native';

// 현재 디바이스 크기
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const isIOS = Platform.OS === 'ios';

// Status Bar 높이 계산 (노치, 다이나믹 아일랜드 대응)
const getStatusBarHeight = () => {
  if (isIOS) {
    return screenHeight > 800 ? 47 : 20; // iPhone X 이상 vs 이하
  }
  return StatusBar.currentHeight || 0;
};

// 하단 여백 계산 (홈 인디케이터 대응)
const getBottomSpace = () => {
  if (isIOS && screenHeight > 800) {
    return 34; // iPhone X 이상
  }
  return 0;
};

// 반응형 너비 계산 (percentage 기반)
export const wp = (percentage) => {
  const value = (percentage * screenWidth) / 100;
  return Math.round(value);
};

// 반응형 높이 계산 (percentage 기반)
export const hp = (percentage) => {
  const value = (percentage * screenHeight) / 100;
  return Math.round(value);
};

// 반응형 폰트 사이즈
export const fs = (size) => {
  const standardWidth = 390; // iPhone 12, 13, 14 기준
  const scale = screenWidth / standardWidth;
  const newSize = size * scale;
  return Math.round(Math.min(Math.max(newSize, 12), 24)); // 최소 12, 최대 24
};

// 공통 간격
export const spacing = {
  xs: wp(2),  // 매우 좁은 간격
  sm: wp(3),  // 좁은 간격
  md: wp(4),  // 중간 간격
  lg: wp(6),  // 넓은 간격
  xl: wp(8),  // 매우 넓은 간격
};

// 디바이스 정보
export const metrics = {
  screenWidth,
  screenHeight,
  statusBarHeight: getStatusBarHeight(),
  bottomSpace: getBottomSpace(),
  isIOS,
};
