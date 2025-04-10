import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getLinbanDetail } from '../../api/linban';

const LinbanDetail = ({ route }) => {
  const { id } = route.params;
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await getLinbanDetail(id);
      if (res.code === 0) {
        setDetail(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!detail) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>基本信息</Text>
          <Text style={[styles.status, { color: detail.isRelated ? '#52c41a' : '#f5222d' }]}>
            {detail.isRelated ? '正常' : '异常'}
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>林班号：</Text>
          <Text style={styles.value}>{detail.no}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>林班面积：</Text>
          <Text style={styles.value}>{detail.linbanArea}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>优势树种：</Text>
          <Text style={styles.value}>{detail.dominantTreeSpecies}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>林龄：</Text>
          <Text style={styles.value}>{detail.treeAge}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>郁闭度：</Text>
          <Text style={styles.value}>{detail.canopyDensity}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>地理位置：</Text>
          <Text style={styles.value}>{detail.address}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>经度：</Text>
          <Text style={styles.value}>{detail.longitude}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.label}>纬度：</Text>
          <Text style={styles.value}>{detail.latitude}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    width: 80,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#333',
  },
});

export default LinbanDetail; 