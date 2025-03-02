import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BasicHeader from '../../components/BasicHeader';
import ImageViewer from '../../components/ImageViewer';
import { useRoute, useNavigation } from '@react-navigation/native';
import useDiaryStore from '../../store/diaryStore';
import CustomTextTitle from '../../components/CustomTextTitle';

const { width } = Dimensions.get('window');

const DiaryDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const diaryId = route.params?.diaryId;
  const { diaries } = useDiaryStore();
  const [diary, setDiary] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // store에서 해당 다이어리 찾기
    const foundDiary = diaries.find(d => d.diaryId === diaryId);
    if (foundDiary) {
      setDiary(foundDiary);
    } else {
      Alert.alert('오류', '다이어리를 찾을 수 없습니다.');
    }
    setIsLoading(false);
  }, [diaryId, diaries]);

  const handleEdit = () => {
    if (diary) {
      navigation.navigate('DiaryEdit', {
        diary: {
          diaryId: diary.diaryId,
          title: diary.title,
          content: diary.content,
          placeName: diary.placeName,
          visitDate: diary.visitDate,
          latitude: diary.latitude,
          longitude: diary.longitude,
          rate: diary.rate,
          markerNumber: diary.markerNumber,
          existingImgList: diary.uploadImgList || [],
          newImgList: []
        }
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (!diary) {
    return (
      <View style={styles.errorContainer}>
        <Text>다이어리를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const images = diary.uploadImgList || [];

  const renderImage = ({ item }) => (
    <TouchableOpacity
      onPress={() => setImageViewerVisible(true)}
      activeOpacity={0.9}
      style={styles.imageWrapper}
    >
      <Image
        source={{ uri: item }}
        style={styles.image}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setActiveIndex(roundIndex);
  };

  return (
    <SafeAreaView style={styles.AreaView}>
      <View>
        <BasicHeader
          rediary="수정"
          onRightPress={handleEdit}
        />
      </View>
      <ScrollView style={styles.container} alwaysBounceVertical={false}>
        {/* 이미지 슬라이더 */}
        <View style={styles.imageContainer}>
          <View style={styles.titleView}>
            <CustomTextTitle>{diary?.title}</CustomTextTitle>
          </View>
          <View>
          {images.length > 0 ? (
            <>
              <FlatList
                data={images}
                renderItem={renderImage}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                style={styles.imageSlider}
              />
              {/* 페이지 인디케이터 */}
              {images.length > 1 && (
                <View style={styles.pagination}>
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === activeIndex && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>등록된 이미지가 없습니다</Text>
            </View>
          )}
          </View>
        </View>

        {/* 콘텐츠 영역 */}
        <View style={styles.contentContainer}>
          {/* 제목 */}
          <View>
          <Text style={styles.visitDate}>{diary?.visitDate}</Text>
          </View>

          {/* 장소와 평점 */}
          <View style={styles.infoRow}>
            <Text style={styles.place}>{diary?.placeName}</Text>
            <View style={styles.rateContainer}>
              <Text style={styles.rateText}>★ {diary?.rate}</Text>
            </View>
          </View>

          {/* 내용 */}
          <Text style={styles.content}>{diary?.content}</Text>

          {/* 방문 날짜 */}
        </View>
      </ScrollView>

      {/* 이미지 뷰어 모달 */}
      <ImageViewer
        visible={imageViewerVisible}
        images={images}
        initialIndex={activeIndex}
        onClose={() => setImageViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  AreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
    paddingBottom: 0,
  },
  titleView: {
    padding: 16,
  },
  imageSlider: {
    width: width,
    height: width * 0.95,
  },
  imageWrapper: {
    width: width,
    height: width * 0.95,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: width,
    height: width * 0.95,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '500',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
    marginBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  place: {
    fontSize: 16,
    color: '#666666',
      fontWeight: '500',
      fontFamily: 'BMJUA',
  },
  rateContainer: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    fontSize: 16,
    fontWeight: '300',
    fontFamily: 'BMJUA',
    color: '#333333',
    lineHeight: 24,
  },
  visitDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DiaryDetail;
