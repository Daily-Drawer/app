import React, { useRef, useEffect, useState, useCallback } from 'react';
import WebView from 'react-native-webview';
import { StyleSheet, Image, View, Platform, TouchableOpacity, FlatList, Text, Animated, Alert } from 'react-native';
import { KAKAO_API_KEY } from '@env';
import useDiaryStore from '../../store/diaryStore';
import { useNavigation } from '@react-navigation/native';
import { wp, hp, fs, spacing, metrics } from '../../utils/responsive';
import { ICON_CONTAINER_SIZES } from '../../utils/iconSize';
import PermissionUtil from '../../utils/PermissionUtil';
import Geolocation from '@react-native-community/geolocation';

const KaKaoMapView = () => {
  const webViewRef = useRef(null);
  const watchIdRef = useRef(null);
  const navigation = useNavigation();
  const { diaries, fetchDiaries } = useDiaryStore();
  const isIos = Platform.OS === 'ios';
  const [isListVisible, setIsListVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  // 마커 이미지 URI 가져오기
  const getMarkerImageUri = (imagePath) => {
    const resolvedImage = Image.resolveAssetSource(imagePath);
    if (Platform.OS === 'ios') {
      return resolvedImage.uri.replace('file://', '');
    }
    return resolvedImage.uri;
  };

  // 마커 이미지 URI 설정
  const goodMarkerUri = getMarkerImageUri(require('../../assets/icon/pin_01.png'));
  const sosoMarkerUri = getMarkerImageUri(require('../../assets/icon/pin_02.png'));
  const badMarkerUri = getMarkerImageUri(require('../../assets/icon/pin_03.png'));
  const starMarkerUri = getMarkerImageUri(require('../../assets/icon/pin_04.png'));
  const closeIconUri = Image.resolveAssetSource(require('../../assets/icon/closeicon.png')).uri;

  // 초기 로드 시 데이터 가져오기
  useEffect(() => {
    fetchDiaries();
    startLocationTracking();
    return () => stopLocationTracking();
  }, []);

  const startLocationTracking = () => {
    watchIdRef.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateCurrentLocation(latitude, longitude);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const updateCurrentLocation = (latitude, longitude) => {
    const script = `
      (function() {
        if (typeof map !== 'undefined') {
          const imageSrc = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-12 -12 24 24'%3E%3Cstyle%3E.pulse%7Banimation:pulse 2s cubic-bezier(.37,0,.63,1) infinite%7D@keyframes pulse%7B0%25%7Btransform:scale(.95);opacity:.5%7D50%25%7Btransform:scale(1.3);opacity:0%7D100%25%7Btransform:scale(.95);opacity:0%7D%7D%3C/style%3E%3Ccircle class='pulse' cx='0' cy='0' r='8' fill='%234285F4' opacity='.5'/%3E%3Ccircle cx='0' cy='0' r='6' fill='%234285F4'/%3E%3Ccircle cx='0' cy='0' r='3' fill='white'/%3E%3C/svg%3E";
          const imageSize = new kakao.maps.Size(48, 48);
          const imageOption = { offset: new kakao.maps.Point(24, 24) };
          
          const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
          
          if (window.currentLocationMarker) {
            window.currentLocationMarker.setMap(null);
          }
          
          window.currentLocationMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(${latitude}, ${longitude}),
            map: map,
            image: markerImage,
            zIndex: 100
          });

          if (window.accuracyCircle) {
            window.accuracyCircle.setMap(null);
          }
          
          window.accuracyCircle = new kakao.maps.Circle({
            map: map,
            center: new kakao.maps.LatLng(${latitude}, ${longitude}),
            radius: 50,
            strokeWeight: 1,
            strokeColor: '#4285F4',
            strokeOpacity: 0.1,
            strokeStyle: 'solid',
            fillColor: '#4285F4',
            fillOpacity: 0.05
          });
        }
        return true;
      })();
    `;

    webViewRef.current?.injectJavaScript(script);
  };

  // 지도 초기화 (새로 추가)
  useEffect(() => {
    if (webViewRef.current && !isMapInitialized) {
      const initScript = `
        (function() {
          if (typeof map === 'undefined') {
            initMap();
            ${JSON.stringify(diaries)}.forEach(function(diary) {
              var markerImage = getMarkerImage(diary.markerNumber);
              var marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(diary.latitude, diary.longitude),
                image: markerImage
              });

              kakao.maps.event.addListener(marker, 'click', function() {
                showModal(diary);
              });

              markers.push(marker);
            });
            renderDiaryList();
          }
          return true;
        })();
      `;
      webViewRef.current.injectJavaScript(initScript);
      setIsMapInitialized(true);
    }
  }, [webViewRef.current, isMapInitialized]);

  // 다이어리 업데이트 처리 (기존 코드 수정)
  useEffect(() => {
    if (webViewRef.current && isMapInitialized && diaries.length > 0) {
      const updateMapScript = `
        if (typeof map !== 'undefined') {
          markers.forEach(marker => marker.setMap(null));
          markers = [];

          ${JSON.stringify(diaries)}.forEach(function(diary) {
            var markerImage = getMarkerImage(diary.markerNumber);
            var marker = new kakao.maps.Marker({
              map: map,
              position: new kakao.maps.LatLng(diary.latitude, diary.longitude),
              image: markerImage
            });

            kakao.maps.event.addListener(marker, 'click', function() {
              showModal(diary);
            });

            markers.push(marker);
          });

          renderDiaryList();
        }
      `;
      webViewRef.current.injectJavaScript(updateMapScript);
    }
  }, [diaries, isMapInitialized]);

  const simpleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <script>
            const goodMarkerUri = '${goodMarkerUri}';
            const sosoMarkerUri = '${sosoMarkerUri}';
            const badMarkerUri = '${badMarkerUri}';
            const starMarkerUri = '${starMarkerUri}';
        </script>
        <style>
        @font-face {
          font-family: 'BMJUA';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/BMJUA.woff') format('woff');
          font-weight: normal;
          font-style: normal;
        }
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            html, body {
                width: 100%;
                height: 100%;
                overflow: hidden;
                background-color: transparent;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }

            #map {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
            }

            #diary-list {
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                height: 100vh;
                background: white;
                border-top-right-radius: 12px;
                border-bottom-right-radius: 12px;
                box-shadow: 2px 0 6px rgba(0,0,0,0.1);
                z-index: 9999;
                transform: translateX(-100%);
                transition: all 0.3s ease-out;
                display: flex;
                flex-direction: column;
                visibility: hidden;
                opacity: 0;
            }

            #diary-list.show {
                transform: translateX(0);
                visibility: visible;
                opacity: 1;
                overflow-y: auto;
            }

            .list-header {
                padding: 20px;
                margin-top: ${isIos ? '20%' : '20%'};
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .list-title {
                font-family: 'BMJUA';
                font-size: 18px;
            }

            .list-content {
                flex: 1;
                overflow-y: auto;
                padding-bottom: 10%;
                -webkit-overflow-scrolling: touch;
            }

            .empty-list {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #666;
                font-size: 16px;
                padding: 20px;
            }

            .diary-item {
                padding: 15px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                text-align: left;
                white-space: nowrap;
            }
            
            .diary-title {
                font-family: 'BMJUA';
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .diary-info {
                color: #666;
                font-size: 12px;
            }

            #modal {
                position: fixed;
                bottom: ${isIos ? '5%' : '9%'};
                left: 3%;
                right: 3%;
                background: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                transform: translateY(200%);
                transition: transform 0.3s ease-out;
                display: flex;
                gap: 20px;
                z-index: 1000;
            }

            #modal.show {
                transform: translateY(0);
            }

            .modal-content {
                flex: 1;
            }

            .modal-title {
                font-family: 'BMJUA';
                font-size: 18px;
                margin-bottom: 8px;
            }

            .modal-info {
                color: #666;
                font-size: 14px;
                margin-bottom: 5px;
            }

            .modal-image {
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
            }

            .no-image {
                width: 120px;
                height: 120px;
                background: #f0f0f0;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 12px;
                text-align: center;
            }

            .detail-button {
                background: #007AFF;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                margin-top: 10px;
                cursor: pointer;
                font-family: 'BMJUA';
            }

            /* 웹뷰 내부 버튼 스타일 제거 */
            #list-toggle, #current-location {
              display: none;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div id="diary-list">
            <div class="list-header">
                <div></div>
                <div class="list-title">목록</div>
                <button class="close-button">
                    <img src="${closeIconUri}" alt="닫기" />
                </button>
            </div>
            <div class="list-content">
                <!-- 여기에 다이어리 목록이 렌더링됨 -->
            </div>
        </div>
        <div id="modal">
            <div class="modal-content">
                <div class="modal-title"></div>
                <div class="modal-info"></div>
                <button class="detail-button" onclick="openDetail()">상세보기</button>
            </div>
            <div class="modal-image-container"></div>
        </div>
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}"></script>
        <script>
            var map;
            var markers = [];
            var selectedDiary = null;
            var isListVisible = false;

            function log(message) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'log',
                    message: message
                }));
            }

            // diaries가 변경될 때마다 지도 업데이트하는 함수
            function updateMarkers(diaries) {
                // 기존 마커들 제거
                if (markers && markers.length > 0) {
                    markers.forEach(marker => marker.setMap(null));
                    markers = [];
                }

                // 새로운 마커 생성 다이어리 마커
                diaries.forEach(function(diary) {
                    var markerImage = getMarkerImage(diary.markerNumber);
                    var marker = new kakao.maps.Marker({
                        map: map,
                        position: new kakao.maps.LatLng(diary.latitude, diary.longitude),
                        image: markerImage
                    });

                    kakao.maps.event.addListener(marker, 'click', function() {
                        showModal(diary);
                    });

                    markers.push(marker);
                });

                // 목록 다시 렌더링
                renderDiaryList();
            }

            function getMarkerImage(markerNumber) {
                var imageSize;
                var markerUri;
                
                switch(markerNumber) {
                    case 1: 
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = goodMarkerUri;
                        break;
                    case 2: 
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = sosoMarkerUri;
                        break;
                    case 3: 
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = badMarkerUri;
                        break;
                    case 4: 
                        imageSize = new kakao.maps.Size(26, 26);
                        markerUri = starMarkerUri;
                        break;
                    default:
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = sosoMarkerUri;
                }
                
                return new kakao.maps.MarkerImage(markerUri, imageSize);
            }

            function showModal(diary) {
                log('showModal called with diary: ' + JSON.stringify(diary));
                selectedDiary = {
                    ...diary,
                    diaryId: diary.diaryId || diary.diary_id 
                };
                const modal = document.getElementById('modal');
                const title = modal.querySelector('.modal-title');
                const info = modal.querySelector('.modal-info');
                const diaryId = modal.querySelector('.modal-diaryId');
                const imageContainer = modal.querySelector('.modal-image-container');

                title.textContent = diary.title;
                info.innerHTML = diary.placeName + '<br/>' + new Date(diary.visitDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                imageContainer.innerHTML = '';
                
                if (diary.uploadImgList && diary.uploadImgList.length > 0) {
                    const img = document.createElement('img');
                    img.src = diary.uploadImgList[0];
                    img.className = 'modal-image';
                    imageContainer.appendChild(img);
                } else {
                    const noImage = document.createElement('div');
                    noImage.className = 'no-image';
                    noImage.textContent = '등록된 사진이 없습니다';
                    imageContainer.appendChild(noImage);
                }

                modal.classList.add('show');
            }

            function openDetail() {
                if (selectedDiary) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'openDetail',
                        diary: {
                            diaryId: selectedDiary.diaryId || selectedDiary.diary_id
                        }
                    }));
                }
            }

            function toggleList(e) {
                e.stopPropagation();  // 이벤트 전파 중지
                const listContainer = document.getElementById('diary-list');
                const isListVisible = listContainer.classList.contains('show');
                
                if (!isListVisible) {
                    listContainer.classList.add('show');
                } else {
                    listContainer.classList.remove('show');
                }
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'log',
                    message: 'List toggled: ' + !isListVisible
                }));
            }

            // 다이어리 목록 렌더링
            function renderDiaryList() {
                const listContent = document.querySelector('.list-content');
                listContent.innerHTML = '';

                if (!${JSON.stringify(diaries)} || ${JSON.stringify(diaries)}.length === 0) {
                    listContent.innerHTML = \`
                        <div class="empty-list">
                            등록된 다이어리가 없습니다.
                        </div>
                    \`;
                    return;
                }

                ${JSON.stringify(diaries)}.forEach(function(diary) {
                    const item = document.createElement('div');
                    item.className = 'diary-item';
                    item.innerHTML = \`
                        <div class="diary-title">\${diary.title}</div>
                        <div class="diary-info">\${diary.placeName}</div>
                        <div class="diary-info">\${new Date(diary.visitDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
                    \`;
                    item.onclick = function() {
                        map.setCenter(new kakao.maps.LatLng(diary.latitude, diary.longitude));
                        map.setLevel(3);
                        toggleList();
                    };
                    listContent.appendChild(item);
                });
            }

            function initMap() {
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(37.5665, 126.9780),
                    level: 5
                };
                map = new kakao.maps.Map(container, options);

                if (${JSON.stringify(diaries?.length)} > 0) {
                    ${JSON.stringify(diaries)}.forEach(function(diary) {
                        var markerImage = getMarkerImage(diary.markerNumber);
                        var marker = new kakao.maps.Marker({
                            map: map,
                            position: new kakao.maps.LatLng(diary.latitude, diary.longitude),
                            image: markerImage
                        });

                        kakao.maps.event.addListener(marker, 'click', function() {
                            showModal(diary);
                        });

                        markers.push(marker);
                    });

                    var firstDiary = ${JSON.stringify(diaries[0])};
                    map.setCenter(new kakao.maps.LatLng(firstDiary.latitude, firstDiary.longitude));
                    map.setLevel(7);
                }

                // 지도 클릭 시 모달 닫기 이벤트 추가
                kakao.maps.event.addListener(map, 'click', function() {
                    const modal = document.getElementById('modal');
                    if (modal) {
                        modal.classList.remove('show');
                    }
                });
            }

            // 초기화 시 이벤트 리스너 한 번만 등록
            window.addEventListener('load', function() {
                initMap();
                updateMarkers(${JSON.stringify(diaries)});
                
                // 토글 버튼 이벤트 리스너
                const toggleButton = document.querySelector('.close-button');
                toggleButton.addEventListener('click', toggleList);
            });
        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'location') {
        // 위치 관련 메시지 처리에서 마커 생성 로직이 있다면 제거
        const { latitude, longitude } = data;
        updateCurrentLocation(latitude, longitude);
      }
      if (data.type === 'openDetail') {
        if (data.diary && data.diary.diaryId) {
          // 중첩된 네비게이터를 통한 네비게이션
          navigation.navigate('다이어리', {
            screen: 'DiaryDetail',
            params: {
              diaryId: data.diary.diaryId,
            },
          });
        } else {
          console.error('Invalid diary data:', data);
        }
      }
    } catch (error) {
      console.error('WebView message parsing error:', error);
    }
  }, [navigation]);

  const handleListToggle = () => {
    setIsListVisible(!isListVisible);
    Animated.timing(slideAnim, {
      toValue: isListVisible ? -300 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  const handleCurrentLocation = async () => {
    
    const locationGranted = await PermissionUtil.checkPermission('location');
    
    if (locationGranted) {
      if (isTrackingLocation) {
        // 위치 추적 중지
        const script = `
          (function() {
            if (window.currentLocationMarker) {
              window.currentLocationMarker.setMap(null);
              window.currentLocationMarker = null;
            }
            if (window.accuracyCircle) {
              window.accuracyCircle.setMap(null);
              window.accuracyCircle = null;
            }
            return true;
          })();
        `;
        webViewRef.current?.injectJavaScript(script);
        setIsTrackingLocation(false);
      } else {
        try {
          const position = await getCurrentPosition();
          const { latitude, longitude } = position.coords;

          const script = `
            (function() {
              const currentPos = new kakao.maps.LatLng(${latitude}, ${longitude});
              map.setCenter(currentPos);
              map.setLevel(3);
              return true;
            })();
          `;
          
          webViewRef.current?.injectJavaScript(script);
          
          // 펄스 효과 마커 업데이트
          setTimeout(() => {
            updateCurrentLocation(latitude, longitude);
          }, 100);

          setIsTrackingLocation(true);
        } catch (error) {
          console.error('위치 정보 가져오기 실패:', error);
          Alert.alert(
            '위치 확인 실패',
            '현재 위치를 가져오는데 실패했습니다. 잠시 후 다시 시도해주세요.',
            [{ text: '확인', style: 'default' }]
          );
        }
      }
    } else {
      const granted = await PermissionUtil.requestPermission('location');
      if (!granted) {
        Alert.alert(
          '위치 권한 필요',
          '현재 위치를 확인하기 위해서는 위치 권한이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: PermissionUtil.openSettings },
          ]
        );
      } else {
        handleCurrentLocation();
      }
    }
  };

  const handleDiaryItemPress = (diary) => {
    // 지도 이동 및 목록 닫기
    webViewRef.current?.injectJavaScript(`
      if (typeof map !== 'undefined') {
        const position = new kakao.maps.LatLng(${diary.latitude}, ${diary.longitude});
        map.panTo(position);
        map.setLevel(3);
      }
      true;
    `);
    handleListToggle(); // 목록 닫기
  };

  const renderDiaryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.diaryItem}
      onPress={() => handleDiaryItemPress(item)}
    >
      <View style={styles.diaryContent}>
        <Text style={styles.diaryTitle}>{item.title}</Text>
        <Text style={styles.diaryPlace}>{item.placeName}</Text>
        <Text style={styles.diaryDate}>
          {new Date(item.visitDate).toLocaleDateString()}
        </Text>
      </View>
      {item.uploadImgList?.[0] && (
        <Image
          source={{ uri: item.uploadImgList[0] }}
          style={styles.diaryImage}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: simpleHtml }}
        onMessage={handleWebViewMessage}
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView={true}
        textInteractionEnabled={false}
        style={styles.webview}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        geolocationEnabled={true}
        javaScriptEnabled={true}
        allowsBackForwardNavigationGestures={false}
        scrollEnabled={false}
        bounces={false}
        contentMode="mobile"
        cacheEnabled={true}
        androidLayerType={Platform.select({
          android: 'hardware',
          default: undefined,
        })}
      />

      <Animated.View
        style={[
          styles.listContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.listHeader}>
          <View />
            <Text style={styles.listTitle}>다이어리 목록</Text>
          <TouchableOpacity onPress={handleListToggle}>
            <Image
              source={require('../../assets/icon/closeicon.png')}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={diaries?.filter(diary => diary?.diaryId)}
          renderItem={renderDiaryItem}
          keyExtractor={item => item.diaryId.toString()}
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>

      <View style={styles.mapControlContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleListToggle}
        >
          <Image
            source={require('../../assets/icon/menuicon.png')}
            style={styles.menuIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCurrentLocation}
        >
          <Image
            source={
              isTrackingLocation
                ? require('../../assets/icon/location_on.png')
                : require('../../assets/icon/location_off.png')
            }
            style={styles.locationIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: wp(60),
    backgroundColor: 'white',
    borderTopRightRadius: wp(5),
    borderBottomRightRadius: wp(5),
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: Platform.OS === 'ios' ? metrics.statusBarHeight + hp(2) : metrics.statusBarHeight,
  },
  listTitle: {
    fontSize: fs(18),
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  closeIcon: {
    width: wp(4),
    height: wp(4),
  },
  listContent: {
    padding: spacing.sm,
  },
  diaryItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  diaryContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  diaryTitle: {
    fontSize: fs(16),
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  diaryPlace: {
    fontSize: fs(14),
    color: '#666',
    marginBottom: spacing.xs,
  },
  diaryDate: {
    fontSize: fs(12),
    color: '#999',
  },
  diaryImage: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(2),
  },
  mapControlContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? hp(10) : hp(12),
    right: wp(3),
    gap: spacing.sm,
  },
  controlButton: {
    width: ICON_CONTAINER_SIZES.md,
    height: ICON_CONTAINER_SIZES.md,
    backgroundColor: 'white',
    borderRadius: ICON_CONTAINER_SIZES.md / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    width: 28,
    height: 28,
  },
  menuIcon: {
    width: 24,
    height: 18,
  },
});

export default KaKaoMapView;
