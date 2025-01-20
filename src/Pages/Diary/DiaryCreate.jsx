import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
  Platform,
  PermissionsAndroid,
  Modal
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import * as diaryAPI from '../../apis/diary';
import { useNavigation } from '@react-navigation/native';
import BasicHeader from '../../components/BasicHeader';

const DiaryCreate = () => {
  const navigation = useNavigation();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    placeName: '',
    visitDate: new Date().toISOString().split('T')[0],
    latitude: '',
    longitude: '',
    rate: 1,
    markerNumber: 1,
    uploadImgList: [],
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: '앨범 접근 권한',
            message: '사진 업로드를 위해 앨범 접근 권한이 필요합니다.',
            buttonNeutral: '나중에 묻기',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;  // iOS는 이미지 피커에서 자체적으로 권한 처리
  };

  const handleImagePick = async () => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert('권한 오류', '앨범 접근 권한이 필요합니다.');
      return;
    }

    const options = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.7,
      selectionLimit: 0,
    };

    try {
      const result = await launchImageLibrary(options);
      
      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
        return;
      }

      if (result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setFormData(prev => ({
          ...prev,
          uploadImgList: [...prev.uploadImgList, ...newImages]
        }));
      }
    } catch (error) {
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const handlePlaceSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    try {
      const places = await diaryAPI.searchPlace(searchKeyword);
      console.log('검색 결과:', places);

      if (places && places.length > 0) {
        setSearchResults(places);
        setIsModalVisible(true);  // 검색 결과가 있으면 모달 표시
      } else {
        Alert.alert('알림', '검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('장소 검색 에러:', error);
      Alert.alert('오류', '장소 검색에 실패했습니다.');
    }
  };

  const handleSelectPlace = (selectedPlace) => {
    setFormData({
      ...formData,
      placeName: selectedPlace.place_name,
      latitude: selectedPlace.y,
      longitude: selectedPlace.x,
    });
    
    setSearchKeyword(selectedPlace.road_address_name || selectedPlace.address_name);  // 도로명 주소가 없을 경우 지번 주소 사용
    
    setIsModalVisible(false);
  };

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

    try {
      const diaryData = {
        title: formData.title,
        content: formData.content,
        placeName: formData.placeName,
        visitDate: formData.visitDate,
        latitude: formData.latitude,
        longitude: formData.longitude,
        rate: formData.rate || 1,  // 평점 (1-5)
        markerNumber: formData.markerNumber || 1,  // 마커 번호 (1-4)
        uploadImgList: formData.uploadImgList,
      };

      console.log('Sending diaryData:', diaryData);  // 전송 데이터 확인

      await diaryAPI.createDiary(diaryData);
      Alert.alert('성공', '다이어리가 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('다이어리 등록 에러:', error);
      if (error.response?.data?.errorMessage) {
        Alert.alert('오류', error.response.data.errorMessage);
      } else {
        Alert.alert('오류', '다이어리 등록에 실패했습니다.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BasicHeader title="피드 작성" />
      <ScrollView style={styles.container}>
        {/* 장소 검색 */}
        <View style={styles.section}>
          <Text style={styles.label}>장소</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder="장소를 검색해주세요"
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handlePlaceSearch}
            >
              <Text style={styles.searchButtonText}>검색</Text>
            </TouchableOpacity>
          </View>
          {formData.placeName ? (
            <Text style={styles.selectedPlace}>
              선택된 장소: {formData.placeName}
            </Text>
          ) : null}
        </View>

        {/* 제목 입력 */}
        <View style={styles.section}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            placeholder="제목을 입력해주세요"
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.section}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            value={formData.content}
            onChangeText={(text) => setFormData({...formData, content: text})}
            placeholder="내용을 입력해주세요"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* 평점 선택 */}
        <View style={styles.section}>
          <Text style={styles.label}>평점</Text>
          <View style={styles.rateContainer}>
            {[1, 2, 3, 4, 5].map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.rateButton,
                  formData.rate === rate && styles.rateButtonActive
                ]}
                onPress={() => setFormData({...formData, rate: rate})}
              >
                <Text style={[
                  styles.rateButtonText,
                  formData.rate === rate && styles.rateButtonTextActive
                ]}>
                  {rate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 마커 번호 선택 */}
        <View style={styles.section}>
          <Text style={styles.label}>마커 선택</Text>
          <View style={styles.markerContainer}>
            {[1, 2, 3, 4].map((number) => (
              <TouchableOpacity
                key={number}
                style={[
                  styles.markerButton,
                  formData.markerNumber === number && styles.markerButtonActive
                ]}
                onPress={() => setFormData({...formData, markerNumber: number})}
              >
                <Text style={[
                  styles.markerButtonText,
                  formData.markerNumber === number && styles.markerButtonTextActive
                ]}>
                  {number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 사진 추가 영역 */}
        <View style={styles.section}>
          <Text style={styles.label}>사진</Text>
          <ScrollView horizontal style={styles.imageScrollView} showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={styles.photoButton}
              onPress={handleImagePick}
            >
              <Text style={styles.photoButtonText}>+ 사진 추가하기</Text>
            </TouchableOpacity>
            {formData.uploadImgList.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image 
                  source={{ uri }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      uploadImgList: prev.uploadImgList.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 등록하기 버튼 */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>등록하기</Text>
        </TouchableOpacity>

        {/* 검색 결과 모달 추가 */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>검색 결과</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {searchResults.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.placeItem}
                    onPress={() => handleSelectPlace(place)}
                  >
                    <Text style={styles.placeName}>{place.place_name}</Text>
                    <Text style={styles.placeAddress}>{place.address_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 48,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  contentInput: {
    height: 120,
  },
  placeButton: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
  },
  placeButtonText: {
    color: '#666666',
    fontSize: 15,
  },
  rateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  rateButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  rateButtonTextActive: {
    color: '#FFFFFF',
  },
  photoButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,  // 이미지 프리뷰를 위한 고정 높이
  },
  photoButtonText: {
    color: '#666666',
    fontSize: 15,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedPlace: {
    marginTop: 8,
    color: '#666666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 20,
    color: '#666666',
    padding: 8,
  },
  placeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#666666',
  },
  markerContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  markerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  markerButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  markerButtonTextActive: {
    color: '#FFFFFF',
  },
  imageScrollView: {
    flexDirection: 'row',
    gap: 8,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginHorizontal: 3,
    overflow: 'hidden',
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DiaryCreate;