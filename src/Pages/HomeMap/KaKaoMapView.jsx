import React, { useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { StyleSheet, Image, View, SafeAreaView } from 'react-native';
import { KAKAO_API_KEY } from '@env';
import useDiaryStore from '../../store/diaryStore';
import { useNavigation } from '@react-navigation/native';

const KaKaoMapView = () => {
  const webViewRef = useRef();
  const navigation = useNavigation();
  const { diaries, fetchDiaries } = useDiaryStore();
  
  // 마커 이미지 URI 가져오기
  const goodMarkerUri = Image.resolveAssetSource(require('../../assets/icon/pin_01.png')).uri;
  const sosoMarkerUri = Image.resolveAssetSource(require('../../assets/icon/pin_02.png')).uri;
  const badMarkerUri = Image.resolveAssetSource(require('../../assets/icon/pin_03.png')).uri;
  const starMarkerUri = Image.resolveAssetSource(require('../../assets/icon/pin_04.png')).uri;

  // 아이콘 이미지 URI 가져오기
  const closeIconUri = Image.resolveAssetSource(require('../../assets/icon/closeicon.png')).uri;
  const menuIconUri = Image.resolveAssetSource(require('../../assets/icon/menuicon.png')).uri;

  useEffect(() => {
    fetchDiaries();
  }, []);

  const simpleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
        <style>
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
                position: fixed;
                top: 0;
                left: 0;
                width: 80%;
                height: 100vh;
                background: white;
                border-top-right-radius: 12px;
                border-bottom-right-radius: 12px;
                box-shadow: 2px 0 6px rgba(0,0,0,0.1);
                z-index: 9999;
                transform: translateX(-100%);
                transition: transform 0.3s ease-out;
                display: flex;
                flex-direction: column;
            }

            #diary-list.show {
                transform: translateX(0);
            }

            .list-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .list-content {
                flex: 1;
                overflow-y: auto;
                padding-bottom: 60px;
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

            /* 목록 헤더 스타일 */
            .list-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .list-title {
                font-size: 18px;
                font-weight: bold;
            }

            .close-button {
                width: 24px;
                height: 24px;
                border: none;
                background: none;
                cursor: pointer;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-button img {
                width: 100%;
                height: 100%;
            }

            /* 목록 내용 컨테이너 */
            .list-content {
                flex: 1;
                overflow-y: auto;
                padding-bottom: 60px;
                -webkit-overflow-scrolling: touch;
            }

            #diary-list.show {
                transform: translateX(0);
            }
            
            .diary-item {
                padding: 15px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
            }
            
            .diary-item:last-child {
                border-bottom: none;
            }
            
            .diary-item:hover {
                background: #f8f8f8;
            }
            
            .diary-title {
                font-weight: bold;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .diary-info {
                color: #666;
                font-size: 12px;
            }

            /* 현재 위치 버튼 스타일 */
            #current-location {
                position: absolute;
                bottom: 60px; /* 40px 아래로 조정 */
                right: 10px;
                width: 40px;
                height: 40px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1000;
            }
            
            #current-location img {
                width: 24px;
                height: 24px;
            }

            /* 기존 모달 스타일 */
            #modal {
                position: fixed;
                bottom: 100px;
                left: 0;
                right: 0;
                background: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                margin: 0 10px;
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
                font-size: 18px;
                font-weight: bold;
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
            }

            /* 목록 컨테이너 스타일 수정 */
            #diary-list {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 50%; /* 버튼과 같은 너비로 시작 */
                background: white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                overflow: hidden; /* 초기에는 내용 숨김 */
                z-index: 1000;
                transition: all 0.3s ease-out;
                visibility: hidden;
                opacity: 0;
            }

            #diary-list.show {
                width: 50%; /* 펼쳐졌을 때 너비 */
                visibility: visible;
                opacity: 1;
                overflow-y: auto; /* 펼쳐졌을 때 스크롤 가능 */
            }

            .diary-item {
                padding: 12px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                text-align: left;
                white-space: nowrap; /* 텍스트 줄바꿈 방지 */
            }
            
            /* 목록 토글 버튼 스타일 수정 */
            #list-toggle {
                position: absolute;
                bottom: 110px;
                right: 10px;
                width: 40px;
                height: 40px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1000;
            }

            #list-toggle img {
                width: 24px;
                height: 24px;
            }

            /* 메뉴 아이콘 스타일 추가 */
            .list-icon {
                width: 24px;
                height: 24px;
                stroke: #666;
            }

            .list-icon path {
                stroke: currentColor;
            }

            /* 현재 위치 버튼 */
            #current-location {
                position: absolute;
                bottom: 60px;
                right: 10px;
                width: 40px;
                height: 40px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 1000;
            }
            
            #current-location img {
                width: 24px;
                height: 24px;
            }

            /* 기존 모달 스타일 */
            #modal {
                position: fixed;
                bottom: 40px;
                left: 0;
                right: 0;
                background: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                margin: 0 10px;
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
                font-size: 18px;
                font-weight: bold;
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
            }

            /* 목록 내용이 하단 네비게이션 바 뒤로 가려지지 않도록 패딩 추가 */
            .list-content {
                flex: 1;
                padding-bottom: 60px; /* 하단 네비게이션 바 높이만큼 패딩 추가 */
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
        <div id="list-toggle">
            <img src="${menuIconUri}" alt="메뉴" />
        </div>
        <div id="current-location">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDhjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDQgNC0xLjc5IDQtNC0xLjc5LTQtNC00em04Ljk0IDNjLS40Ni00LjE3LTMuNzctNy40OC03Ljk0LTcuOTRWMWgtMnYyLjA2QzYuODMgMy41MiAzLjUyIDYuODMgMy4wNiAxMUgxdjJoMi4wNmMuNDYgNC4xNyAzLjc3IDcuNDggNy45NCA3Ljk0VjIzaDJ2LTIuMDZjNC4xNy0uNDYgNy40OC0zLjc3IDcuOTQtNy45NEgyM3YtMmgtMi4wNnpNMTIgMTljLTMuODcgMC03LTMuMTMtNy03czMuMTMtNyA3LTcgNyAzLjEzIDcgNy0zLjEzIDctNyA3eiIvPjwvc3ZnPg==" alt="현재 위치"/>
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
            // 디버깅용 console.log 대체 함수
            function log(message) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'log',
                    message: message
                }));
            }

            var map;
            var markers = [];
            var selectedDiary = null;
            var isListVisible = false;

            function getMarkerImage(markerNumber) {
                var imageSize;
                var markerUri;
                
                switch(markerNumber) {
                    case 1: 
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = '${goodMarkerUri}'; 
                        break;
                    case 2: 
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = '${sosoMarkerUri}'; 
                        break;
                    case 3: 
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = '${badMarkerUri}'; 
                        break;
                    case 4: 
                        imageSize = new kakao.maps.Size(26, 26); // star 마커만 크기 다르게 설정
                        markerUri = '${starMarkerUri}'; 
                        break;
                    default: 
                        imageSize = new kakao.maps.Size(34, 34);
                        markerUri = '${sosoMarkerUri}';
                }
                
                return new kakao.maps.MarkerImage(markerUri, imageSize);
            }

            function showModal(diary) {
                log('showModal called with diary: ' + JSON.stringify(diary));
                selectedDiary = diary;
                const modal = document.getElementById('modal');
                const title = modal.querySelector('.modal-title');
                const info = modal.querySelector('.modal-info');
                const imageContainer = modal.querySelector('.modal-image-container');

                title.textContent = diary.title;
                info.innerHTML = diary.placeName + '<br/>' + new Date(diary.visitDate).toLocaleDateString();

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
                log('Modal should be visible now');
            }

            function openDetail() {
                if (selectedDiary) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'openDetail',
                        diary: selectedDiary
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
                
                console.log('List visibility:', !isListVisible);
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
                        <div class="diary-info">\${new Date(diary.visitDate).toLocaleDateString()}</div>
                    \`;
                    item.onclick = function() {
                        map.setCenter(new kakao.maps.LatLng(diary.latitude, diary.longitude));
                        map.setLevel(3);
                        toggleList();
                    };
                    listContent.appendChild(item);
                });
            }

            // 현재 위치로 이동
            function moveToCurrentLocation() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        const currentPos = new kakao.maps.LatLng(lat, lng);
                        map.setCenter(currentPos);
                        map.setLevel(7);
                    });
                }
            }

            function initMap() {
                log('initMap called');
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(37.5665, 126.9780),
                    level: 5
                };
                map = new kakao.maps.Map(container, options);

                if (${JSON.stringify(diaries?.length)} > 0) {
                    log('Creating markers for diaries: ' + ${JSON.stringify(diaries)});
                    ${JSON.stringify(diaries)}.forEach(function(diary) {
                        var markerImage = getMarkerImage(diary.markerNumber);
                        var marker = new kakao.maps.Marker({
                            map: map,
                            position: new kakao.maps.LatLng(diary.latitude, diary.longitude),
                            image: markerImage
                        });

                        kakao.maps.event.addListener(marker, 'click', function() {
                            log('Marker clicked for diary: ' + JSON.stringify(diary));
                            showModal(diary);
                        });

                        markers.push(marker);
                    });

                    var firstDiary = ${JSON.stringify(diaries[0])};
                    map.setCenter(new kakao.maps.LatLng(firstDiary.latitude, firstDiary.longitude));
                    map.setLevel(7);
                }

                // 현재 위치 버튼 이벤트
                document.getElementById('current-location').onclick = moveToCurrentLocation;

                // 다이어리 목록 렌더링
                renderDiaryList();

                // 지도 클릭 시 목록 닫기
                kakao.maps.event.addListener(map, 'click', function() {
                    if (isListVisible) {
                        toggleList();
                    }
                    document.getElementById('modal').classList.remove('show');
                });
            }

            // 초기화 시 이벤트 리스너 한 번만 등록
            window.onload = function() {
                initMap();
                
                // 토글 버튼 이벤트 리스너
                const toggleButton = document.getElementById('list-toggle');
                toggleButton.addEventListener('click', toggleList);

                // 닫기 버튼 이벤트 리스너
                const closeButton = document.querySelector('.close-button');
                closeButton.addEventListener('click', toggleList);
            };
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'openDetail') {
      // MainTab 내에서 다이어리 탭으로 이동하고 DiaryDetail 스크린으로 이동
      navigation.navigate('MainTab', {
        screen: '다이어리',
        params: {
          screen: 'DiaryDetail',
          params: { diary: data.diary }
        }
      });
    } else if (data.type === 'log') {
      console.log('WebView:', data.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: simpleHtml }}
          style={styles.webview}
          onMessage={handleMessage}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default KaKaoMapView;
