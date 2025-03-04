import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BasicHeader from '../../components/BasicHeader';
import DiaryForm from '../../components/DiaryForm';
import useDiaryStore from '../../store/diaryStore';

const DiaryEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const diary = route.params?.diary;
  const { diaries, updateDiary, fetchDiaries } = useDiaryStore();
  
  // store에서 최신 데이터 가져오기
  const currentDiary = diaries.find(d => d.diaryId === diary.diaryId);

  const [formData, setFormData] = useState({
    title: currentDiary?.title || '',
    content: currentDiary?.content || '',
    placeName: currentDiary?.placeName || '',
    addressName: currentDiary?.addressName || '',
    visitDate: currentDiary?.visitDate || new Date().toISOString().split('T')[0],
    latitude: currentDiary?.latitude,
    longitude: currentDiary?.longitude,
    rate: currentDiary?.rate || 1,
    markerNumber: Number(currentDiary?.markerNumber) || 1,
    existingImgList: currentDiary?.uploadImgList || [],
    newImgList: []
  });

  const [searchKeyword, setSearchKeyword] = useState(currentDiary?.placeName || '');
  const [isPlaceChanged, setIsPlaceChanged] = useState(false);

  const handleFormDataChange = (newData) => {
    setFormData(newData);
  };

  const handlePlaceChange = (newPlace) => {
    if (newPlace && newPlace.placeName) {
      setIsPlaceChanged(true);
      setFormData(prev => ({
        ...prev,
        placeName: newPlace.placeName,
        addressName: newPlace.addressName,
        latitude: Number(newPlace.latitude),
        longitude: Number(newPlace.longitude),
      }));
    }
  };

  const handleSubmit = async () => {
    Alert.alert(
      '다이어리 수정',
      '다이어리를 수정하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              const updateData = {
                ...formData,
                uploadImgList: [...(formData.existingImgList || []), ...(formData.newImgList || [])],
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
              };

              await updateDiary(currentDiary.diaryId, updateData);
              
              await fetchDiaries();
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'DiaryHome' }],
              });
            } catch (error) {
              console.error('다이어리 수정 실패:', error);
              Alert.alert('오류', '다이어리 수정에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <BasicHeader title="피드 수정" />
      <DiaryForm
        formData={formData}
        searchKeyword={searchKeyword}
        onSearchKeywordChange={setSearchKeyword}
        onFormDataChange={handleFormDataChange}
        onPlaceChange={handlePlaceChange}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </SafeAreaView>
  );
};


export default DiaryEdit;
