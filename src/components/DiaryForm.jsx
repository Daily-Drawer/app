import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { searchPlace } from '../apis/diary';
import PermissionUtil from '../utils/PermissionUtil';

const MarkerSelection = ({ formData, handleMarkerSelect }) => {
  const getMarkerImage = (number) => {
    switch (number) {
      case 1:
        return require('../assets/icon/pin_01.png');
      case 2:
        return require('../assets/icon/pin_02.png');
      case 3:
        return require('../assets/icon/pin_03.png');
      case 4:
        return require('../assets/icon/pin_04.png');
      default:
        return require('../assets/icon/pin_01.png');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.label}>마커 선택</Text>
      <Text style={styles.subLabel}>이 장소를 방문했을 때의 기분을 선택해주세요.</Text>
      <View style={styles.markerContainer}>
        {[1, 2, 3, 4].map((number) => (
          <TouchableOpacity
            key={number}
            style={[
              styles.markerButton,
              formData.markerNumber === number && styles.markerButtonSelected,
            ]}
            onPress={() => handleMarkerSelect(number)}
          >
            <Image
              source={getMarkerImage(number)}
              style={[
                styles.markerImage,
                formData.markerNumber === number && styles.markerImageSelected,
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const DiaryForm = ({
  formData,
  searchKeyword,
  onSearchKeywordChange,
  onFormDataChange,
  onSubmit,
  isEditing,
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(formData.visitDate));

  const handleImagePick = async () => {
    try {
      // 앨범 권한 확인
      const hasPermission = await PermissionUtil.checkPermission('photo');

      if (!hasPermission) {
        const granted = await PermissionUtil.requestPermission('photo');

        if (!granted) {
          Alert.alert(
            '앨범 접근 권한',
            '다이어리에 사진을 첨부하기 위해서는 앨범 접근 권한이 필요합니다.',
            [
              { text: '설정으로 이동', onPress: PermissionUtil.openSettings },
              { text: '취소', style: 'cancel' },
            ]
          );
          return;
        }
      }

      // 권한이 있는 경우 이미지 선택 로직 실행
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5,
        maxWidth: 1024,
        maxHeight: 1024,
        selectionLimit: 5,
      });

      if (result.assets) {
        const newImages = result.assets.map(asset => asset.uri);

        if (isEditing) {
          // 수정 모드일 때
          const existingImages = formData.existingImgList || [];
          const newImgList = formData.newImgList || [];

          if (existingImages.length + newImgList.length + newImages.length > 5) {
            Alert.alert('알림', '사진은 최대 5개까지 업로드 가능합니다.');
            return;
          }

          onFormDataChange({
            ...formData,
            newImgList: [...newImgList, ...newImages],
          });
        } else {
          // 생성 모드일 때
          const uploadImgList = formData.uploadImgList || [];

          if (uploadImgList.length + newImages.length > 5) {
            Alert.alert('알림', '사진은 최대 5개까지 업로드 가능합니다.');
            return;
          }

          onFormDataChange({
            ...formData,
            uploadImgList: uploadImgList.concat(newImages),
          });
        }
      }
    } catch (error) {
      console.error('권한 요청 또는 이미지 선택 중 에러:', error);
      Alert.alert('오류', '이미지 선택 중 문제가 발생했습니다.');
    }
  };

  const handlePlaceSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    try {
      const places = await searchPlace(searchKeyword);
      if (places && places.length > 0) {
        setSearchResults(places);
        setIsModalVisible(true);
      } else {
        Alert.alert('알림', '검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('장소 검색 에러:', error);
      Alert.alert('오류', '장소 검색에 실패했습니다.');
    }
  };

  const handlePlaceSelect = (place) => {
    if (!place || !place.y || !place.x) {
      Alert.alert('알림', '올바른 장소를 선택해주세요.');
      return;
    }

    const newFormData = {
      ...formData,
      placeName: place.place_name,
      addressName: place.address_name,
      latitude: Number(place.y),
      longitude: Number(place.x),
    };
    
    onFormDataChange(newFormData);
    setIsModalVisible(false);
    onSearchKeywordChange(place.place_name);
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isEditing) {
      // 수정 모드일 때
      if (isExisting) {
        const newExistingList = [...formData.existingImgList];
        newExistingList.splice(index, 1);
        onFormDataChange({ ...formData, existingImgList: newExistingList });
      } else {
        const newImgList = [...formData.newImgList];
        newImgList.splice(index, 1);
        onFormDataChange({ ...formData, newImgList: newImgList });
      }
    } else {
      // 생성 모드일 때
      const uploadImgList = [...formData.uploadImgList];
      uploadImgList.splice(index, 1);
      onFormDataChange({ ...formData, uploadImgList });
    }
  };

  const showDatePicker = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작으로 설정

    if (Platform.OS === 'android') {
      try {
        const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
        DateTimePickerAndroid.open({
          value: new Date(formData.visitDate),
          mode: 'date',
          maximumDate: today, // 최대 선택 가능 날짜를 오늘로 제한
          onChange: (event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              const formattedDate = selectedDate.toISOString().split('T')[0];
              onFormDataChange({ ...formData, visitDate: formattedDate });
            }
          },
        });
      } catch (error) {
        console.error('DatePicker error:', error);
      }
    } else {
      setTempDate(new Date(formData.visitDate));
      setDatePickerVisible(true);
    }
  };

  const renderIOSDatePicker = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // 최근 10년치 년도만 선택 가능하도록 설정
    const years = Array.from(
      { length: 10 }, 
      (_, i) => currentYear - i
    );
    
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // 선택된 년도와 월에 따른 일자 계산
    const maxDays = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: maxDays }, (_, i) => i + 1);

    // 오늘 이후의 날짜는 선택 불가능하도록 처리
    const isDateSelectable = (year, month, day) => {
      const selectedDate = new Date(year, month - 1, day);
      return selectedDate <= today;
    };

    return (
      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.datePickerCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const selectedDate = new Date(tempDate);
                  if (selectedDate <= today) {
                    onFormDataChange({
                      ...formData,
                      visitDate: tempDate.toISOString().split('T')[0],
                    });
                    setDatePickerVisible(false);
                  } else {
                    Alert.alert('알림', '미래 날짜는 선택할 수 없습니다.');
                  }
                }}
              >
                <Text style={styles.datePickerDoneText}>완료</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      tempDate.getFullYear() === year && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(year);
                      if (newDate <= today) {
                        setTempDate(newDate);
                      }
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      tempDate.getFullYear() === year && styles.pickerItemTextSelected,
                    ]}>{year}년</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {months.map(month => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.pickerItem,
                      tempDate.getMonth() + 1 === month && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(month - 1);
                      if (newDate <= today) {
                        setTempDate(newDate);
                      }
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      tempDate.getMonth() + 1 === month && styles.pickerItemTextSelected,
                    ]}>{month}월</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {days.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerItem,
                      tempDate.getDate() === day && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setDate(day);
                      if (newDate <= today) {
                        setTempDate(newDate);
                      }
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      tempDate.getDate() === day && styles.pickerItemTextSelected,
                    ]}>{day}일</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleRateSelect = (rate) => {
    onFormDataChange({
      ...formData,
      rate: Number(rate),
    });
  };

  const handleMarkerSelect = (number) => {
    onFormDataChange({
      ...formData,
      markerNumber: Number(number),
    });
  };

  // 이미지 렌더링 함수
  const renderImages = () => {
    if (isEditing) {
      return (
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollContainer}
        >
          <View style={styles.imageRow}>
            {formData.existingImgList?.map((uri, index) => (
              <View key={`existing-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index, true)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {formData.newImgList?.map((uri, index) => (
              <View key={`new-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index, false)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView 
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollContainer}
        >
          <View style={styles.imageRow}>
            {formData.uploadImgList?.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 제목 입력 */}
      <View style={styles.section}>
        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => onFormDataChange({ ...formData, title: text })}
          placeholder="제목을 입력해주세요"
          accessible={true}
          accessibilityLabel="다이어리 제목 입력"
          accessibilityHint="다이어리의 제목을 입력해주세요"
        />
      </View>

      {/* 장소 검색 */}
      <View style={styles.section}>
        <Text style={styles.label}>장소</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchKeyword}
            onChangeText={onSearchKeywordChange}
            placeholder="장소를 검색해주세요"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handlePlaceSearch}
          >
            <Text style={styles.searchButtonText}>검색</Text>
          </TouchableOpacity>
        </View>
        {formData.placeName && (
          <Text style={styles.selectedPlace}>
            주소 : {formData.addressName}
          </Text>
        )}
      </View>

      {/* 장소 검색 결과 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>검색 결과</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handlePlaceSelect(item)}
                >
                  <Text style={styles.placeName}>{item.place_name}</Text>
                  <Text style={styles.addressName}>{item.road_address_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* 이미지 섹션 */}
      <View style={styles.section}>
        <Text style={styles.label}>사진</Text>
        <Text style={styles.subLabel}>최대 5장까지 업로드 가능합니다.</Text>
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={handleImagePick}
        >
          <Text style={styles.imagePickerButtonText}>선택하기</Text>
        </TouchableOpacity>
        {renderImages()}
      </View>

      {/* 방문 날짜 선택 섹션 */}
      <View style={styles.section}>
        <Text style={styles.label}>방문 날짜</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={showDatePicker}
        >
          <Text style={styles.datePickerButtonText}>
            {formData.visitDate || '날짜 선택'}
          </Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' && renderIOSDatePicker()}

      {/* 내용 입력 */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>내용</Text>
          <Text style={styles.characterCount}>
            {formData.content.length}/500자
          </Text>
        </View>
        <TextInput
          style={styles.contentInput}
          value={formData.content}
          onChangeText={(text) => onFormDataChange({ ...formData, content: text })}
          placeholder="내용을 입력해주세요"
          multiline
          maxLength={500}
          numberOfLines={4}
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
                formData.rate === rate && styles.rateButtonSelected,
              ]}
              onPress={() => handleRateSelect(rate)}
            >
              <Text style={[
                styles.rateButtonText,
                formData.rate === rate && styles.rateButtonTextSelected,
              ]}>
                {rate}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <MarkerSelection
        formData={formData}
        handleMarkerSelect={(number) => onFormDataChange({
          ...formData,
          markerNumber: number,
        })}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={onSubmit}
      >
        <Text style={styles.submitButtonText}>
          {isEditing ? '수정하기' : '등록하기'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginBottom: Platform.OS === 'android' ? 60 : 0,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  subLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    fontFamily: 'Pretendard-Regular',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '300',
    fontFamily: 'BMJUA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#6C5CE7',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#6C5CE7',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPlace: {
    marginTop: 8,
    color: '#666666',
  },
  imagePickerButton: {
    backgroundColor: '#00B894',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00B894',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  imageScrollContainer: {
    marginTop: 10,
  },
  imageRow: {
    flexDirection: 'row',
    paddingRight: 10, // 마지막 이미지 여백
    paddingTop: 5,
  },
  imageWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 250,
    textAlignVertical: 'top',
    fontWeight: '300',
    fontFamily: 'BMJUA',
  },
  rateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  rateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rateButtonSelected: {
    backgroundColor: '#74B9FF',
    shadowColor: '#74B9FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  rateButtonTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FF7675',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 60,
    shadowColor: '#FF7675',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  markerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
  },
  markerButton: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  markerButtonSelected: {
    backgroundColor: '#F3F3F3',
  },
  markerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  markerImageSelected: {
    opacity: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 14,
    color: '#666666',
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  datePickerCancelText: {
    fontSize: 16,
    color: '#666666',
  },
  datePickerDoneText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 200,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333333',
  },
  pickerItemTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Pretendard-Regular',
  },
});

export default DiaryForm;