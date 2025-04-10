import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { getLinbanList } from '../../api/linban';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LinbanList = () => {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const navigation = useNavigation();

  const fetchData = async (pageNum = 1, search = '') => {
    try {
      setLoading(true);
      const res = await getLinbanList({ page: pageNum, pageSize: 10, no: search });
      if (res.code === 0) {
        if (pageNum === 1) {
          setList(res.data.list);
        } else {
          setList([...list, ...res.data.list]);
        }
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, keyword);
  };

  const renderItem = ({ item }) => {
    const statusText = item.isRelated ? '已关联' : '待权验';
    const statusColor = item.isRelated ? '#52c41a' : '#faad14';
    const statusBgColor = item.isRelated ? '#f6ffed' : '#fffbe6';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('LinbanDetail', { id: item.id })}
      >
        <Image 
          source={{ uri: item.coverImage || 'https://via.placeholder.com/200x150' }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>林班号：{item.no}</Text>
            <View style={[styles.statusTag, { backgroundColor: statusBgColor }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{item.createTime} 上传</Text>
          <Text style={styles.sizeText}>{item.size}MB</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-horiz" size={24} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const onEndReached = () => {
    if (!loading && list.length < total) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, keyword);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索林班号、标签"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {keyword ? (
            <TouchableOpacity onPress={() => {
              setKeyword('');
              fetchData(1, '');
            }}>
              <Icon name="close" size={20} color="#888" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>暂无数据</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardImage: {
    width: 120,
    height: 90,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  sizeText: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 12,
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

export default LinbanList; 