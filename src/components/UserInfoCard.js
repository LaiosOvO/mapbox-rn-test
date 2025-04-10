import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const UserInfoCard = ({ user, onClose }) => {
    const navigation = useNavigation();

    const handleTrackPlayback = () => {
        // 先关闭信息卡片
        onClose();
        // 然后导航到轨迹回放页面
        navigation.navigate('TrackPlayback', {
            userId: user.id,
            userName: user.userName || '未知用户'
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>用户信息</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.label}>用户名：</Text>
                    <Text style={styles.value}>{user.userName || '未知用户'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>工作组：</Text>
                    <Text style={styles.value}>{user.jobGroup || '未分组'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>职位：</Text>
                    <Text style={styles.value}>{user.job || '未设置'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>状态：</Text>
                    <Text style={[styles.value, { color: user.isAlive === 1 ? '#52c41a' : '#f5222d' }]}>
                        {user.isAlive === 1 ? '在线' : '离线'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>位置：</Text>
                    <Text style={styles.value}>
                        {`${user.longitude.toFixed(6)}, ${user.latitude.toFixed(6)}`}
                    </Text>
                </View>
                {user.lastUpdateTime && (
                    <View style={styles.row}>
                        <Text style={styles.label}>最后更新：</Text>
                        <Text style={styles.value}>{user.lastUpdateTime}</Text>
                    </View>
                )}
                <TouchableOpacity 
                    style={styles.trackButton}
                    onPress={handleTrackPlayback}
                >
                    <Icon name="timeline" size={20} color="#fff" style={styles.trackIcon} />
                    <Text style={styles.trackButtonText}>24小时轨迹回放</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    content: {
        padding: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        width: 80,
        fontSize: 16,
        color: '#666',
    },
    value: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1890ff',
        padding: 12,
        borderRadius: 6,
        marginTop: 15,
    },
    trackIcon: {
        marginRight: 8,
    },
    trackButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default UserInfoCard; 