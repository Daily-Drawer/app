import { wp } from './responsive';

export const ICON_SIZES = {
  xs: wp(4),    // 16dp
  sm: wp(5),    // 20dp
  md: wp(6),    // 24dp (Material Design 기본 크기)
  lg: wp(8),    // 32dp
  xl: wp(10),   // 40dp
};

// 아이콘 컨테이너 크기 (배경이 있는 동그란 버튼 등에 사용)
export const ICON_CONTAINER_SIZES = {
  sm: wp(8),    // 32dp
  md: wp(10),   // 40dp
  lg: wp(12),   // 48dp
};

// 아이콘 히트슬롭 영역 (터치 영역)
export const ICON_HITSLOP = {
  top: 5,
  bottom: 5,
  left: 5,
  right: 5,
}; 