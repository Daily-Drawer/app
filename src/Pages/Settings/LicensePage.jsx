import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Linking, StyleSheet, SafeAreaView } from 'react-native';

const LicensePage = () => {
  const licenses = [
    {
      name: 'Material Design Icons',
      copyright: 'Copyright (c) 2014-2024 Google LLC',
      license: 'Apache License 2.0',
      url: 'https://github.com/google/material-design-icons',
      licenseText: `Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`
    },
    {
      name: 'React Native',
      copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
      license: 'MIT License',
      url: 'https://github.com/facebook/react-native',
      licenseText: 'MIT License'
    },
    {
      name: 'React',
      copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
      license: 'MIT License',
      url: 'https://github.com/facebook/react',
      licenseText: 'MIT License'
    },
    {
      name: 'React Navigation',
      copyright: 'Copyright (c) React Navigation contributors',
      license: 'MIT License',
      url: 'https://github.com/react-navigation/react-navigation',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Async Storage',
      copyright: 'Copyright (c) React Native Community',
      license: 'MIT License',
      url: 'https://github.com/react-native-async-storage/async-storage',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Community Geolocation',
      copyright: 'Copyright (c) React Native Community',
      license: 'MIT License',
      url: 'https://github.com/Agontuk/react-native-geolocation-service',
      licenseText: 'MIT License'
    },
    {
      name: 'Kakao SDK',
      copyright: 'Copyright (c) Kakao Corp.',
      license: 'Apache License 2.0',
      url: 'https://github.com/kakao/kakao-sdk-android-reference',
      licenseText: 'Apache License 2.0'
    },
    {
      name: 'Axios',
      copyright: 'Copyright (c) 2014-present Matt Zabriskie & Axios Contributors',
      license: 'MIT License',
      url: 'https://github.com/axios/axios',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Config',
      copyright: 'Copyright (c) 2015 Lugg',
      license: 'MIT License',
      url: 'https://github.com/luggit/react-native-config',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Image Picker',
      copyright: 'Copyright (c) 2015-present React Native Community',
      license: 'MIT License',
      url: 'https://github.com/react-native-image-picker/react-native-image-picker',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Permissions',
      copyright: 'Copyright (c) 2019 Mathieu Acthernoene',
      license: 'MIT License',
      url: 'https://github.com/zoontek/react-native-permissions',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Safe Area Context',
      copyright: 'Copyright (c) 2019 Th3rd Wave',
      license: 'MIT License',
      url: 'https://github.com/th3rdwave/react-native-safe-area-context',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Screens',
      copyright: 'Copyright (c) 2018 Software Mansion',
      license: 'MIT License',
      url: 'https://github.com/software-mansion/react-native-screens',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native WebView',
      copyright: 'Copyright (c) React Native Community',
      license: 'MIT License',
      url: 'https://github.com/react-native-webview/react-native-webview',
      licenseText: 'MIT License'
    },
    {
      name: 'Zustand',
      copyright: 'Copyright (c) 2019 Paul Henschel',
      license: 'MIT License',
      url: 'https://github.com/pmndrs/zustand',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Apple Authentication',
      copyright: 'Copyright (c) 2016-present Invertase Limited',
      license: 'MIT License',
      url: 'https://github.com/invertase/react-native-apple-authentication',
      licenseText: 'MIT License'
    },
    {
      name: 'React Native Splash Screen',
      copyright: 'Copyright (c) 2020-present Evan Bacon',
      license: 'MIT License',
      url: 'https://github.com/crazycodeboy/react-native-splash-screen',
      licenseText: 'MIT License',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {licenses.map((item, index) => (
          <View key={index} style={styles.licenseItem}>
            <Text style={styles.libraryName}>{item.name}</Text>
            <Text style={styles.copyright}>{item.copyright}</Text>
            <Text style={styles.licenseType}>{item.license}</Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL(item.url)}
            >
              <Text style={styles.url}>{item.url}</Text>
            </TouchableOpacity>
            <Text style={styles.licenseText}>{item.licenseText}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  licenseItem: {
    marginBottom: 20,
  },
  libraryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 14,
    marginBottom: 4,
  },
  licenseType: {
    fontSize: 14,
    marginBottom: 4,
  },
  url: {
    fontSize: 14,
    color: 'blue',
    marginBottom: 4,
  },
  licenseText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  }
});

export default LicensePage;
