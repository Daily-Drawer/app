import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView } from 'react-native';
import BasicHeader from '../../components/BasicHeader';
import { useNavigation } from '@react-navigation/native';

const FAQ_DATA = [
  {
    id: 1,
    title: '하루서랍 앱은 어떤 서비스인가요?',
    content: '하루서랍은 여러분의 소중한 일상을 기록하고 공유할 수 있는 다이어리 서비스입니다. 장소와 감정을 기반으로 하루의 순간들을 저장하고, 지도에서 한눈에 볼 수 있습니다.',
  },
  {
    id: 2,
    title: '이름을 변경하는 방법은 무엇인가요?',
    content: '하루서랍 앱 내 정보 탭 > 프로필 설정 버튼을 눌러 이름 변경을 진행할 수 있습니다.',
  },
  {
    id: 3,
    title: '이메일을 변경하는 방법은 무엇인가요?',
    content: '하루서랍 앱 내 정보 탭 > 프로필 설정 버튼을 눌러 이메일 변경을 진행할 수 있습니다.',
  },
  {
    id: 4,
    title: '비밀번호를 변경하는 방법은 무엇인가요?',
    content: '하루서랍 앱 내 정보 탭 > 프로필 설정 버튼을 눌러 비밀번호 변경을 진행할 수 있습니다.',
  },
  {
    id: 5,
    title: '회원 탈퇴를 하고 싶어요.',
    content: '회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.',
    isButton: true,
    buttonText: '회원 탈퇴하기',
    onPress: (navigation) => navigation.navigate('Withdrawal')
  },
];

const AccordionItem = ({ title, content, isButton, buttonText, onPress }) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setExpanded(!expanded);
  };

  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Text style={styles.expandIcon}>{expanded ? '-' : '+'}</Text>
      </TouchableOpacity>
      
      <Animated.View style={[styles.accordionContent, { height: contentHeight }]}>
        <Text style={styles.contentText}>{content}</Text>
        {isButton && (
          <TouchableOpacity
            style={styles.withdrawalButton}
            onPress={() => onPress(navigation)}
          >
            <Text style={styles.withdrawalButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const Notice = () => {
  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title="고객센터" />
      <ScrollView
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          {FAQ_DATA.map((item) => (
            <AccordionItem
              key={item.id}
              title={item.title}
              content={item.content}
              isButton={item.isButton}
              buttonText={item.buttonText}
              onPress={item.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 20,
  },
  accordionItem: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  accordionTitle: {
    fontSize: 16,
    flex: 1,
  },
  expandIcon: {
    fontSize: 20,
    color: '#666',
  },
  accordionContent: {
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  contentText: {
    padding: 15,
    lineHeight: 20,
    color: '#666',
  },
  withdrawalButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  withdrawalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Notice; 