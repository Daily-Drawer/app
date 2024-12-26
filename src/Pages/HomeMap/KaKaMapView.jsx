import React from 'react';
import WebView from 'react-native-webview';
import {StyleSheet } from 'react-native';
import { KAKAO_API_KEY } from '@env';

const KakaoMapView = () => {
  if (!KAKAO_API_KEY) {
    console.error('KAKAO_API_KEY is not defined');
    return null;
  }

  const simpleHtml = `
    <!DOCTYPE html>
<html style="height: 100%;">
<head>
	<meta charset="utf-8"/>
	<title>Kakao 지도 시작하기</title>
	<style>
		#map {
			width: 100%;
			height: 100%;
		}
		#zoomControl {
			position: absolute;
			bottom: 220px;
			left: 48px;
			z-index: 10;
			background-color: white;
			padding: 6px;
			border-radius: 8px;
			box-shadow: 0 2px 5px rgba(0,0,0,0.2);
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.zoom-btn {
			width: 80px;
			height: 80px;
			margin: 0;
			border: none;
			border-radius: 4px;
			background-color: white;
			font-size: 48px;
			font-weight: bold;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			line-height: 1;
		}
		.zoom-btn:first-child {
			border-bottom: 1px solid #e0e0e0;
			padding: 4px 0;
		}
		.zoom-btn:last-child {
			padding: 4px 0;
		}
	</style>
</head>
<body style="height: 100%; margin: 0;">
	<div id="map"></div>
	<div id="zoomControl">
		<button class="zoom-btn" onclick="zoomIn()">+</button>
		<button class="zoom-btn" onclick="zoomOut()">-</button>
	</div>
	<script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}"></script>
	<script>
		var container = document.getElementById('map');
		var options = {
			center: new kakao.maps.LatLng(33.450701, 126.570667),
			level: 2
		};

		var map = new kakao.maps.Map(container, options);

		function zoomIn() {
			map.setLevel(map.getLevel() - 1);
		}

		function zoomOut() {
			map.setLevel(map.getLevel() + 1);
		}
	</script>
</body>
</html>
  `;

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error:', {
      description: nativeEvent.description,
      code: nativeEvent.code,
      url: nativeEvent.url,
    });
  };

  return (
    <WebView
      source={{ html: simpleHtml }}
      style={styles.map}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onError={handleError}
      originWhitelist={['*']}
      onHttpError={(syntheticEvent) => {
        console.warn('WebView HTTP error:', syntheticEvent.nativeEvent);
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

export default KakaoMapView;
