import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useDiaryStore from '../../store/diaryStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

const Diary = () => {
  const navigation = useNavigation();
  const { diaries, isLoading, fetchDiaries, deleteDiaries } = useDiaryStore();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedDiaries, setSelectedDiaries] = useState(new Set());

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        if (isDeleteMode) {
          toggleDiarySelection(item.diaryId);
        } else {
          // diaryId만 전달하도록 수정
          navigation.navigate('DiaryDetail', {
            diaryId: item.diaryId,
          });
        }
      }}
    >
      {isDeleteMode && (
        <Image
        source={
          selectedDiaries.has(item.diaryId)
            ? require('../../assets/icon/Checkbox.png')
            : require('../../assets/icon/Checkboxoutline.png')
        }
        style={styles.checkbox}
      />
      )}
      {item.uploadImgList && item.uploadImgList.length > 0 ? (
        <Image
          source={{ uri: item.uploadImgList[0] }}
          style={[
            styles.itemImage,
            isDeleteMode && styles.itemImageWithCheckbox,
          ]}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>등록된 사진이 없습니다</Text>
        </View>
      )}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.itemRate}>★ {item.rate}</Text>
        </View>
        <Text style={styles.itemPlace} numberOfLines={1}>{item.placeName}</Text>
        <Text style={styles.itemDate}>{item.visitDate}</Text>
      </View>
    </TouchableOpacity>
  );

  const toggleDiarySelection = (diaryId) => {
    setSelectedDiaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(diaryId)) {
        newSet.delete(diaryId);
      } else {
        newSet.add(diaryId);
      }
      return newSet;
    });
  };

  const handleDeletePress = () => {
    if (isDeleteMode) {
      if (selectedDiaries.size > 0) {
        Alert.alert(
          '다이어리 삭제',
          `선택한 ${selectedDiaries.size}개의 다이어리를 삭제하시겠습니까?`,
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '삭제',
              style: 'destructive',
              onPress: async () => {
                try {
                  const diaryIds = Array.from(selectedDiaries);
                  await deleteDiaries(diaryIds);

                  // 성공 알림 표시
                  Alert.alert('삭제 완료', '선택한 다이어리가 삭제되었습니다.');

                  // 상태 초기화
                  setIsDeleteMode(false);
                  setSelectedDiaries(new Set());

                  // 목록 새로고침
                  await fetchDiaries();
                } catch (error) {
                  console.error('Delete error:', error);
                  Alert.alert('오류', '다이어리 삭제 중 오류가 발생했습니다.');
                }
              },
            },
          ]
        );
      } else {
        setIsDeleteMode(false);
      }
    } else {
      setIsDeleteMode(true);
    }
  };

  // 빈 상태 컴포넌트
  const EmptyDiaryList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>아직 작성된 다이어리가 없어요</Text>
      <Text style={styles.emptyDescription}>
        새로운 다이어리를 작성하고{'\n'}
        특별한 순간을 기록해보세요!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('DiaryCreate')}
      >
        <Text style={styles.createButtonText}>다이어리 작성하기</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={diaries}
        renderItem={renderItem}
        keyExtractor={item => String(item?.diaryId || '')}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchDiaries}
        refreshing={isLoading}
        ListEmptyComponent={EmptyDiaryList}
      />
      {diaries.length > 0 && (
        <>
          <TouchableOpacity
            style={[styles.delButton, isDeleteMode && selectedDiaries.size > 0 && styles.deleteActiveButton]}
            onPress={handleDeletePress}
          >
            {isDeleteMode ? (
              selectedDiaries.size > 0 ? (
                <Text style={styles.deleteButtonText}>삭제</Text>
              ) : (
                <Text style={styles.deleteButtonText}>취소</Text>
              )
            ) : (
              <Image
                source={require('../../assets/icon/Delete.png')}
                style={styles.deleteIcon}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('DiaryCreate')}
          >
            <Image source={require('../../assets/icon/Create.png')} style={styles.createIcon} />
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 52,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: COLUMN_WIDTH,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: COLUMN_WIDTH,  // 정사각형 이미지
    backgroundColor: '#E5E5E5',
  },
  itemContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'BMJUA',
    flex: 1,
    marginRight: 4,
  },
  itemRate: {
    fontSize: 14,
    color: '#FFB800',
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  itemPlace: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  itemDate: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    ...Platform.select({
      ios: {
        bottom: '8%',
      },
      android: {
        bottom: '10%',
      },
    }),
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: '#6C5CE7', // 보라색 계열
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  delButton: {
    position: 'absolute',
    right: 20,
    ...Platform.select({
      ios: {
        bottom: '15%',
      },
      android: {
        bottom: '16%',
      },
    }),
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: '#00B894', // 민트 계열
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#74B9FF', // 하늘색 계열
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#74B9FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noImageContainer: {
    width: '100%',
    height: COLUMN_WIDTH,  // 이미지와 동일한 높이
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  checkbox: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    borderColor: '#000',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  itemImageWithCheckbox: {
    opacity: 0.7,
  },
  deleteActiveButton: {
    backgroundColor: '#FF7675', // 코랄 핑크 계열
    shadowColor: '#FF7675',
    width: 48,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF', // 아이콘 색상을 흰색으로
  },
  createIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF', // 아이콘 색상을 흰색으로
  },
});

export default Diary;
