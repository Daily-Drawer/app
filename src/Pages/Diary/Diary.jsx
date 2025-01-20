import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ReadDiary } from '../../apis/diary';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 양쪽 패딩 16 * 2, 아이템 사이 간격 16

const Diary = () => {
  const navigation = useNavigation();
  const [diaries, setDiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      const response = await ReadDiary();
      if (response.data) {
        setDiaries(response.data);
      }
    } catch (error) {
      console.error('다이어리 목록 조회 실패:', error);
      Alert.alert('오류', '다이어리 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('DiaryDetail', { diary: item })}
    >
      {item.uploadImgList && item.uploadImgList.length > 0 && (
        <Image
          source={{ uri: item.uploadImgList[0] }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text>★ {item.markerNumber}</Text>
        </View>
        <Text style={styles.itemPlace} numberOfLines={1}>{item.placeName}</Text>
        <Text style={styles.itemDate}>{item.visitDate}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={diaries}
        renderItem={renderItem}
        keyExtractor={item => item.diaryId.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchDiaries}
        refreshing={isLoading}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('DiaryCreate')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
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
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  itemRate: {
    fontSize: 14,
    color: '#FFB800',
    fontWeight: '500',
  },
  itemPlace: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#888888',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 68,  // 탭바 위에 위치하도록 조정
    width: 48,
    height: 48,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Diary;
