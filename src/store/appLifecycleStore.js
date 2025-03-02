import { create } from 'zustand';

const useAppLifecycleStore = create((set, get) => ({
  isActive: true,
  lastActiveTime: Date.now(),

  setAppActive: (isActive) => {
    set({
      isActive,
      lastActiveTime: isActive ? Date.now() : get().lastActiveTime
    });
  },

  handleAppStateChange: (nextAppState) => {
    const isActive = nextAppState === 'active';
    get().setAppActive(isActive);

    if (isActive) {
      // 앱이 활성화될 때 수행할 작업
      get().handleAppActivation();
    } else {
      // 앱이 비활성화될 때 수행할 작업
      get().handleAppDeactivation();
    }
  },

  handleAppActivation: () => {
    // 앱이 포그라운드로 돌아올 때 수행할 작업
    // 예: 데이터 새로고침, 알림 초기화 등
  },

  handleAppDeactivation: () => {
    // 앱이 백그라운드로 갈 때 수행할 작업
    // 예: 리소스 정리, 상태 저장 등
  }
}));

export default useAppLifecycleStore; 