import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { getLabelUserPage, saveLabelUser, deleteLabelUser, listLabelUserPage } from '../api/linban/label/index';

const DrawingTools = ({ 
    visible, 
    onClose, 
    onToolSelect, 
    onSave, 
    currentTool, 
    onCancel, 
    onClearMapData, 
    savedFeatures, 
    onSetSavedFeatures 
}) => {
    const [userLabel, setUserLabel] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const userInfo = useSelector(state => state.userStore.userInfo);
    
    const loadData = async () => {
        try {
            let params = {
                pageNum: 1,
                pageSize: 100,
                userId: userInfo.id
            }
            
            console.log("****************")
            console.log(params)
            console.log("****************")

            let res = await listLabelUserPage(params);
            if (res.code === 0) {
                setUserLabel(res.data);
            }
        } catch(error) {
            console.log('获取标注数据失败:', error);
        }
    }

    useEffect(() => {
        loadData()
        const fetchData = async () => {
            try {
                const mockData = [
                ];
                setUserLabel(mockData);
            } catch (error) {
                console.error('获取标注数据失败:', error);
            }
        };
        
        if (visible) {
            fetchData();
        }
    }, [visible, savedFeatures]);

    const tools = [
        { id: 'marker', name: '标记', icon: 'place', type: 'Point' },
        { id: 'polyline', name: '折线', icon: 'timeline', type: 'LineString' },
        { id: 'polygon', name: '多边形', icon: 'crop-square', type: 'Polygon' },
    ];

    useEffect(() => {
        // console.log('savedFeatures has changed:', savedFeatures);
        // 在这里可以执行一些操作，比如更新本地状态或执行其他逻辑
    }, [savedFeatures]);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('提示', '请输入标注名称');
            return;
        }

        await onSave({
            title: title.trim(),
            description: description.trim()
        });

        onCancel();
        onClearMapData();
        loadData();

        setTitle('');
        setDescription('');
    };

    const handleSelectGeoJson = (item) => {
        try {
            console.log("*************************************************");
            console.log(item)
            console.log(item.dataJson.geometry.coordinates)
            console.log("*************************************************");

            const features = item.dataJson;
            console.log("*************************************************");
            console.log(features)
            console.log("*************************************************");
            onSetSavedFeatures([features]);
        } catch (e) {
            console.error('解析GeoJSON失败:', e);
            Alert.alert('错误', '解析标注数据失败');
        }
    };

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>绘图工具</Text>
                <TouchableOpacity onPress={onClose}>
                    <Icon name="close" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>绘图模式</Text>
                    <View style={styles.toolGrid}>
                        {tools.map(tool => (
                            <TouchableOpacity
                                key={tool.id}
                                style={[
                                    styles.toolButton,
                                    currentTool === tool.id && styles.activeTool
                                ]}
                                onPress={() => onToolSelect(tool)}
                            >
                                <Icon
                                    name={tool.icon}
                                    size={24}
                                    color={currentTool === tool.id ? 'white' : 'grey'}
                                />
                                <Text style={[
                                    styles.toolLabel,
                                    currentTool === tool.id && styles.activeLabel
                                ]}>
                                    {tool.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>标注信息</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="标注名称 *"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="备注信息"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>取消绘制</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>保存标注</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionTitle, styles.listTitle]}>已保存标注</Text>
                    <View style={styles.savedFeaturesList}>
                        {userLabel.map((feature) => (
                            <TouchableOpacity 
                                key={feature.id} 
                                style={styles.featureItem}
                                onPress={() => handleSelectGeoJson(feature)}
                            >
                                <Text style={styles.featureTitle}>{feature.labelName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 300,
        backgroundColor: 'white',
        padding: 16,
        elevation: 9999,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    scrollView: {
        flex: 1
    },
    content: {
        flex: 1
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginVertical: 12
    },
    toolGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    toolButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#eee',
        width: '30%'
    },
    activeTool: {
        backgroundColor: '#4285F4'
    },
    toolLabel: {
        marginTop: 4,
        fontSize: 12,
        color: 'grey'
    },
    activeLabel: {
        color: 'white'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 24
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 6
    },
    cancelButton: {
        backgroundColor: '#f0f0f0'
    },
    saveButton: {
        backgroundColor: '#4285F4'
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '500'
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '500'
    },
    listTitle: {
        marginTop: 8
    },
    savedFeaturesList: {
        marginTop: 8
    },
    featureItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        marginBottom: 8
    },
    featureTitle: {
        fontSize: 14,
        color: '#333'
    }
});

export default DrawingTools;    