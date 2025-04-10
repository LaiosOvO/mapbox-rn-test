import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAliveByJobGroup } from '../api/linban';

const CommandCenter = ({ onClose }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAliveByJobGroup();
        console.log("****************")
        console.log("res \n", res)
        console.log("****************")
        if (res.code === 0) {
          setData(res.data);
        }
      } catch (error) {
        console.error('获取在线数据失败:', error);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  if (!data) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>指挥中心</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        在线人数: {data.aliveUser}/{data.allUser}
      </Text>

      <ScrollView style={styles.content}>
        {Object.entries(data.jobGroup).map(([groupName, info]) => (
          <View key={groupName} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupName}>{groupName}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {info.aliveUser}/{info.allUser}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(info.aliveUser / info.allUser) * 100}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 60,
    width: '80%',
    backgroundColor: '#fff',
    zIndex: 9999,
    elevation: 9999,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  content: {
    flex: 1,
  },
  groupCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#1890ff',
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e8e8e8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#52c41a',
    borderRadius: 2,
  },
});

export default CommandCenter; 