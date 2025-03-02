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
        const formattedDiaries = response.data.map(diary => ({
          ...diary,
          placeName: diary.place_name || diary.placeName,
          visitDate: diary.visit_date || diary.visitDate,
          markerNumber: diary.marker_number || diary.markerNumber,
          uploadImgList: diary.upload_img_list || diary.uploadImgList || [],
          latitude: Number(diary.latitude || diary.lat),
          longitude: Number(diary.longitude || diary.lng),
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
      // API 요청 데이터 준비
      const apiData = {
        title: diaryData.title?.trim(),
        content: diaryData.content?.trim(),
        placeName: diaryData.placeName?.trim(),
        visitDate: diaryData.visitDate,
        latitude: diaryData.latitude,  // 이미 숫자 타입
        longitude: diaryData.longitude, // 이미 숫자 타입
        rate: diaryData.rate,          // 이미 숫자 타입
        markerNumber: diaryData.markerNumber, // 이미 숫자 타입
        uploadImgList: Array.isArray(diaryData.uploadImgList) ? diaryData.uploadImgList : []
      };

      const response = await diaryAPI.createDiary(apiData);
      if (response.data) {
        const formattedDiary = {
          ...response.data,
          placeName: response.data.placeName,
          visitDate: response.data.visitDate,
          latitude: Number(response.data.latitude),    // 숫자로 변환
          longitude: Number(response.data.longitude),  // 숫자로 변환
          rate: Number(response.data.rate),           // 숫자로 변환
          markerNumber: Number(response.data.markerNumber), // 숫자로 변환
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

  // 다이어리 다중 삭제
  deleteDiaries: async (diaryIds) => {
    set({ isLoading: true, error: null });
    try {
      const response = await diaryAPI.deleteDiary(diaryIds);
      if (response?.status === 200) {
        set((state) => ({
          diaries: state.diaries.filter(diary => !diaryIds.includes(diary.diaryId))
        }));
        return response;
      }
      throw new Error('다이어리 삭제에 실패했습니다.');
    } catch (error) {
      console.error('다이어리 삭제 실패:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 다이어리 수정
  updateDiary: async (diaryId, diaryData) => {
    if (!diaryId) throw new Error('다이어리 ID가 필요합니다.');
    
    set({ isLoading: true, error: null });
    try {
      // API 요청 데이터 준비
      const apiData = {
        ...diaryData,
        latitude: Number(diaryData.latitude),    // 명시적으로 숫자 변환
        longitude: Number(diaryData.longitude),  // 명시적으로 숫자 변환
        rate: Number(diaryData.rate),
        markerNumber: Number(diaryData.markerNumber)
      };

      const response = await diaryAPI.updateDiary(diaryId, apiData);
      
      if (response?.status === 200) {
        set((state) => ({
          diaries: state.diaries.map(diary => 
            diary.diaryId === diaryId 
              ? {
                  ...diary,
                  ...diaryData,
                  latitude: Number(diaryData.latitude),    // 명시적으로 숫자 변환
                  longitude: Number(diaryData.longitude),  // 명시적으로 숫자 변환
                  rate: Number(diaryData.rate),
                  markerNumber: Number(diaryData.markerNumber)
                }
              : diary
          )
        }));
        return response;
      }
      throw new Error('다이어리 수정에 실패했습니다.');
    } catch (error) {
      console.error('다이어리 수정 실패:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

}));

export default useDiaryStore;
