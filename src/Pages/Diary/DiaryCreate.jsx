import React, { useState } from 'react';
import { SafeAreaView, Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BasicHeader from '../../components/BasicHeader';
import DiaryForm from '../../components/DiaryForm';
import useDiaryStore from '../../store/diaryStore';

const INITIAL_FORM_DATA = {
  title: '',
  content: '',
  placeName: '',
  visitDate: new Date().toISOString().split('T')[0],
  latitude: 0,
  longitude: 0,
  rate: 3,
  markerNumber: 4,
  uploadImgList: [],
};

const DiaryCreate = () => {
  const navigation = useNavigation();
  const { addDiary, fetchDiaries } = useDiaryStore();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSubmit = async () => {
    // 필수 입력 검증
    if (!formData.title?.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!formData.placeName?.trim()) {
      Alert.alert('알림', '장소를 선택해주세요.');
      return;
    }
    if (!formData.content?.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('알림', '장소를 다시 선택해주세요.');
      return;
    }

    // 데이터 정제
    const submitData = {
      ...formData,
      latitude: Number(formData.latitude) || 0,
      longitude: Number(formData.longitude) || 0,
      rate: Number(formData.rate) || 1,
      markerNumber: Number(formData.markerNumber) || 1,
      uploadImgList: formData.uploadImgList || [],
    };

    try {
      const response = await addDiary(submitData);
      if (response) {
        await fetchDiaries();
        Alert.alert('성공', '다이어리가 생성되었습니다.', [
          { 
            text: '확인', 
            onPress: () => {
              navigation.goBack();
            }
          }
        ]);
      }
    } catch (error) {
      console.error('다이어리 생성 에러:', error);
      Alert.alert('오류', '다이어리 생성에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <BasicHeader title="피드 작성" />
        <DiaryForm
          formData={formData}
        searchKeyword={searchKeyword}
        onSearchKeywordChange={setSearchKeyword}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        isEditing={false}
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default DiaryCreate;