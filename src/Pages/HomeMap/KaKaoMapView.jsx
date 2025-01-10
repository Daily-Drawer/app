import React, { useState, useRef, useEffect } from 'react';
import WebView from 'react-native-webview';
import { StyleSheet } from 'react-native';
import { KAKAO_API_KEY } from '@env';
import kakaoInstance from '../../apis/kakaoInstance';

const KaKaoMapView = ({ userLocation }) => {
    /* TODO: 실제 디바이스 테스트 시 구현 필요
   * 1. 위치 관련 state 추가
   *    - currentLocation
   *    - lastSearchLocation
   *
   * 2. 현재 위치 기반 검색 기능 구현
   *    - 지도 중심 좌표 가져오기
   *    - 해당 위치 기준으로 주변 맛집 검색
   *
   * 3. 위치 기반 캐시 처리
   *    - 이전 검색 위치와 현재 위치 비교
   *    - 일정 거리 이내일 경우 캐시 사용
   *    - 거리가 멀 경우 새로 검색
   *
   * 4. 에러 처리
   *    - 위치 정보 획득 실패
   *    - API 호출 실패
   */
  const [restaurants, setRestaurants] = useState([]);
  const [lastSearchTime, setLastSearchTime] = useState(null);
  const webViewRef = useRef();
  const CACHE_DURATION = 30 * 60 * 1000; // 30분

  useEffect(() => {
    if (userLocation && webViewRef.current) {
      // 사용자 위치로 지도 이동
      webViewRef.current.injectJavaScript(`
        if (map) {
          const userPosition = new kakao.maps.LatLng(${userLocation.latitude}, ${userLocation.longitude});
          map.setCenter(userPosition);
        }
        true;
      `);
    }
  }, [userLocation]);

  const searchRestaurants = async () => {
    try {
      const now = new Date().getTime();

      // 캐시된 결과가 있고 30분이 지나지 않았다면 재사용
      if (restaurants.length > 0 && lastSearchTime && (now - lastSearchTime < CACHE_DURATION)) {
        const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
        webViewRef.current.injectJavaScript(`
          updateMap(${JSON.stringify(randomRestaurant)});
          updateRestaurantList(${JSON.stringify(restaurants)});
          true;
        `);
        return;
      }

      // 새로운 API 호출
      const response = await kakaoInstance.get('/v2/local/search/category.json', {
        params: {
          category_group_code: 'FD6',
          x: '126.8099698',
          y: '37.3342046',
          radius: 5000,
          size: 15
        }
      });

      // 검색 결과에 이미지 URL 추가
      const placesWithImages = await Promise.all(
        response.data.documents.map(async (place) => {
          try {
            // 장소 상세 검색 API로 이미지 URL 가져오기
            const detailResponse = await kakaoInstance.get('/v2/local/search/keyword.json', {
              params: {
                query: place.place_name,
                x: place.x,
                y: place.y,
                radius: 1
              }
            });

            // 카카오 Place API가 제공하는 기본 이미지가 없어서
            // 임시로 기본 이미지 사용
            return {
              ...place,
              image_url: 'https://via.placeholder.com/150' // 기본 이미지
            };
          } catch (error) {
            console.error('이미지 검색 실패:', error);
            return place;
          }
        })
      );

      setRestaurants(placesWithImages);
      setLastSearchTime(now);

      const randomRestaurant = placesWithImages[Math.floor(Math.random() * placesWithImages.length)];
      webViewRef.current.injectJavaScript(`
        updateMap(${JSON.stringify(randomRestaurant)});
        updateRestaurantList(${JSON.stringify(placesWithImages)});
        true;
      `);
    } catch (error) {
      console.error('음식점 검색 실패:', error);
    }
  };

  const simpleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kakao 지도</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
        #searchButton {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          background-color: white;
          padding: 12px 20px;
          border-radius: 25px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          cursor: pointer;
          /* TODO: 이미지 추가
          background-image: url('path_to_random_icon.png');
          background-repeat: no-repeat;
          background-position: 10px center;
          background-size: 20px 20px;
          padding-left: 40px; // 이미지 공간 확보
          */
        }
        #listToggle {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 11;
          background-color: white;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          cursor: pointer;
          /* TODO: 이미지 추가
          background-image: url('path_to_list_icon.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 24px 24px;
          width: 44px;
          height: 44px;
          */
        }
        #restaurantList {
          position: absolute;
          top: 60px;
          left: 10px;
          z-index: 10;
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          max-height: 70vh;
          width: 300px;
          overflow-y: auto;
          display: none;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.3);
          display: none;
          z-index: 9;
        }
        #restaurantInfo {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: none;
          width: 90%;
          max-width: 400px;
        }
        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .close-button {
          cursor: pointer;
          padding: 5px 10px;
        }
        .restaurant-item {
          padding: 12px 8px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
        }
        .restaurant-item:hover {
          background-color: #f5f5f5;
        }
        .restaurant-name {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .restaurant-address {
          font-size: 0.9em;
          color: #666;
        }
        .restaurant-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 12px;
        }
        .category-tag {
          display: inline-block;
          background-color: #f3f3f3;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        .category-tag.small {
          font-size: 12px;
          padding: 2px 6px;
          margin: 4px 0;
        }
        .restaurant-info-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      </style>
    </head>
    <body>
      <div id="map" onclick="handleMapClick()"></div>
      <div id="listToggle" onclick="toggleList()">목록 보기</div>
      <div id="searchButton" onclick="window.ReactNativeWebView.postMessage('search')">맛집 추천 받기</div>
      <div id="restaurantList" onclick="event.stopPropagation()"></div>
      <div class="modal-overlay" onclick="closeInfo()"></div>
      <div id="restaurantInfo" onclick="event.stopPropagation()"></div>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}"></script>
      <script>
        let map;
        let marker;
        let infowindow;
        let restaurants = [];
        let isListVisible = true;

        function initMap() {
          const container = document.getElementById('map');
          const options = {
            center: new kakao.maps.LatLng(37.3342046, 126.8099698),
            level: 3
          };
          map = new kakao.maps.Map(container, options);
        }

        function handleMapClick() {
          // 목록이 열려있다면 닫기
          if (isListVisible) {
            const listDiv = document.getElementById('restaurantList');
            const toggleBtn = document.getElementById('listToggle');
            isListVisible = false;
            listDiv.style.display = 'none';
            toggleBtn.innerHTML = '목록 보기';
          }
        }

        function toggleList() {
          const listDiv = document.getElementById('restaurantList');
          const toggleBtn = document.getElementById('listToggle');
          const infoDiv = document.getElementById('restaurantInfo');
          
          isListVisible = !isListVisible;
          
          // 목록 토글 시 정보창 닫기
          if (isListVisible) {
            infoDiv.style.display = 'none';
            document.querySelector('.modal-overlay').style.display = 'none';
          }
          
          listDiv.style.display = isListVisible ? 'block' : 'none';
          toggleBtn.innerHTML = isListVisible ? '목록 닫기' : '목록 보기';
        }

        function showRestaurantInfo(restaurant) {
          const infoDiv = document.getElementById('restaurantInfo');
          const overlay = document.querySelector('.modal-overlay');
          const category = restaurant.category_name
            .split(' > ')
            .filter(cat => cat !== '음식점')
            .join(' > ');

          infoDiv.innerHTML = \`
            <div class="info-header">
              <h3>\${restaurant.place_name}</h3>
              <span class="close-button" onclick="closeInfo()">X</span>
            </div>
            <img 
              src="\${restaurant.image_url}" 
              alt="\${restaurant.place_name}"
              class="restaurant-image"
              onerror="this.src='https://via.placeholder.com/150'"
            />
            <div class="category-tag">\${category}</div>
            <p style="margin-bottom: 8px">\${restaurant.address_name}</p>
            <p>\${restaurant.phone || '전화번호 없음'}</p>
          \`;
          infoDiv.style.display = 'block';
          overlay.style.display = 'block';
          
          // 정보창이 열릴 때 목록 닫기
          const listDiv = document.getElementById('restaurantList');
          const toggleBtn = document.getElementById('listToggle');
          isListVisible = false;
          listDiv.style.display = 'none';
          toggleBtn.innerHTML = '목록 보기';
        }

        function closeInfo() {
          document.getElementById('restaurantInfo').style.display = 'none';
          document.querySelector('.modal-overlay').style.display = 'none';
        }

        function updateMap(restaurant) {
          if (marker) marker.setMap(null);

          const position = new kakao.maps.LatLng(restaurant.y, restaurant.x);
          marker = new kakao.maps.Marker({
            position: position,
            map: map
          });

          // 마커 클릭 이벤트
          kakao.maps.event.addListener(marker, 'click', function() {
            showRestaurantInfo(restaurant);
          });

          map.setCenter(position);
          // 자동으로 정보창 표시하지 않음
          
          // 목록 토글 버튼 표시
          document.getElementById('listToggle').style.display = 'block';
        }

        function updateRestaurantList(restaurants) {
          const listDiv = document.getElementById('restaurantList');
          listDiv.innerHTML = '<h3 style="margin-bottom: 12px; text-align: center;">주변 맛집 목록</h3>';
          
          if (!restaurants || restaurants.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            emptyMessage.style.color = '#666';
            emptyMessage.innerHTML = '추천 목록이 비어있습니다';
            listDiv.appendChild(emptyMessage);
            return;
          }
          
          restaurants.forEach((rest) => {
            const div = document.createElement('div');
            div.className = 'restaurant-item';
            div.innerHTML = \`
              <div class="restaurant-name">\${rest.place_name}</div>
              <div class="restaurant-address">\${rest.address_name}</div>
            \`;
            div.onclick = () => {
              updateMap(rest);
              // 목록 닫기
              isListVisible = false;
              listDiv.style.display = 'none';
              document.getElementById('listToggle').innerHTML = '목록 보기';
            };
            listDiv.appendChild(div);
          });
        }

        // 초기 목록 상태 설정
        updateRestaurantList([]);

        initMap();
      </script>
    </body>
    </html>
  `;

  const onMessage = (event) => {
    if (event.nativeEvent.data === 'search') {
      searchRestaurants();
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{html: simpleHtml}}
      style={styles.map}
      javaScriptEnabled={true}
      onMessage={onMessage}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default KaKaoMapView;
