import { create } from 'zustand';
import * as diaryAPI from '../apis/diary';

const useDiaryStore = create((set) => ({
  diaries: [],
  isLoading: false,
  error: null,

  // 다이어리 목록 조회
  fetchDiaries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await diaryAPI.ReadDiary();
      if (response.data) {
        // 데이터 구조 통일
        const formattedDiaries = response.data.map(diary => ({
          ...diary,
          placeName: diary.place_name || diary.placeName,
          visitDate: diary.visit_date || diary.visitDate,
          markerNumber: diary.marker_number || diary.markerNumber,
          uploadImgList: diary.upload_img_list || diary.uploadImgList || [],
        }));
        set({ diaries: formattedDiaries });
      }
    } catch (error) {
      console.error('다이어리 목록 조회 실패:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // 다이어리 추가
  addDiary: async (diaryData) => {
    set({ isLoading: true, error: null });
    try {
      // API 요청 형식에 맞게 데이터 변환
      const apiData = {
        title: diaryData.title,
        content: diaryData.content,
        placeName: diaryData.placeName,
        visitDate: diaryData.visitDate,
        latitude: diaryData.latitude,
        longitude: diaryData.longitude,
        rate: diaryData.rate,
        markerNumber: diaryData.markerNumber,
        uploadImgList: diaryData.uploadImgList,
      };

      const response = await diaryAPI.createDiary(apiData);
      if (response.data) {
        // 저장된 데이터를 상태에 추가할 때는 일관된 형식으로 변환
        const formattedDiary = {
          ...response.data,
          placeName: response.data.placeName,
          visitDate: response.data.visitDate,
          markerNumber: response.data.markerNumber,
          uploadImgList: response.data.uploadImgList || [],
        };

        set((state) => ({
          diaries: [...state.diaries, formattedDiary],
        }));
      }
      return response;
    } catch (error) {
      console.error('다이어리 생성 실패:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useDiaryStore;
