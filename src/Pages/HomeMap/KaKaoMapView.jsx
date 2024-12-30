import React from 'react';
import WebView from 'react-native-webview';
import {StyleSheet} from 'react-native';
import {KAKAO_API_KEY, KAKAO_REST_API_KEY} from '@env';

const KaKaoMapView = () => {
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
          top: 10px;
          left: 10px;
          z-index: 10;
          background-color: white;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="searchButton" onclick="searchRestaurants()">음식점 검색</div>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services"></script>
      <script>
        let map;
        let markers = [];
        let infowindows = [];
        let currentPosition;

        function initMap() {
          const container = document.getElementById('map');
          const options = {
            center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
            level: 3
          };
          
          map = new kakao.maps.Map(container, options);

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                currentPosition = { lat, lng };
                const locPosition = new kakao.maps.LatLng(lat, lng);
                
                map.setCenter(locPosition);
                
                const marker = new kakao.maps.Marker({
                  position: locPosition,
                  map: map
                });
              },
              function(error) {
                console.error('Geolocation error:', error);
              }
            );
          }
        }

        function searchRestaurants() {
          if (!currentPosition) {
            alert('현재 위치를 확인할 수 없습니다.');
            return;
          }

          const { lat, lng } = currentPosition;
          const xhr = new XMLHttpRequest();
          xhr.open('GET', \`https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&y=\${lat}&x=\${lng}&radius=1000&sort=distance\`, true);
          xhr.setRequestHeader('Authorization', 'KakaoAK ${KAKAO_REST_API_KEY}');
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              data.documents.forEach(function(place) {
                addMarker(place);
              });
            }
          };
          xhr.send();
        }

        function addMarker(place) {
          const marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(place.y, place.x)
          });
          
          markers.push(marker);
          
          const infowindow = new kakao.maps.InfoWindow({
            content: \`
              <div style="padding:10px;width:200px;">
                <strong>\${place.place_name || ''}</strong><br>
                <span>\${place.category_name || ''}</span><br>
                <span>\${place.phone || '전화번호 없음'}</span><br>
                <span>\${place.road_address_name || place.address_name || ''}</span><br>
                <span>거리: \${place.distance || 0}m</span><br>
                \${typeof place.place_url === 'string' && place.place_url.length > 0 ? 
                  \`<a href="\${place.place_url}" target="_blank">상세보기</a>\` : 
                  ''
                }
              </div>
            \`
          });
          
          kakao.maps.event.addListener(marker, 'click', function() {
            infowindows.forEach(function(iw) { iw.close(); });
            infowindow.open(map, marker);
          });
          
          infowindows.push(infowindow);
        }

        window.onload = initMap;
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{html: simpleHtml}}
      style={styles.map}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={['*']}
      onError={(syntheticEvent) => {
        console.warn('WebView error:', syntheticEvent.nativeEvent);
      }}
      onLoadEnd={() => {
        console.log('WebView loaded successfully');
      }}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default KaKaoMapView;
