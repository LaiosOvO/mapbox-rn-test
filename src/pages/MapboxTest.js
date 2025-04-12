import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Alert, TextInput, TouchableOpacity, Modal, Text } from 'react-native';
import Mapbox,{ Localization }  from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import BottomNavBar from '../components/BottomNavBar';
import DrawingTools from '../components/DrawingTools';
import CommandCenter from '../components/CommandCenter';
import AnnotationManager from '../components/AnnotationManager';
import { getLabelUserPage, saveLabelUser, deleteLabelUser,updateLabelUser } from '../api/linban/label/index';
import { getUserDetail, getGroupUsers, updateUserLocation } from '../api/linban';
import UserInfoCard from '../components/UserInfoCard';

Mapbox.setAccessToken('sk.eyJ1IjoiN3huM3VtbHQiLCJhIjoiY205M3Y3bzZuMG11NzJqcXozOTQ5YjB0YSJ9.fk8RU7RNlM0QDj9WUw-84A');
// Mapbox.setLanguage('zh-Hans');

const predefinedColors = [
    '#4285F4', // 蓝色
    '#DB4437', // 红色
    '#F4B400', // 黄色
    '#0F9D58', // 绿色
    '#AB47BC', // 紫色
    '#00ACC1', // 青色
    '#FF7043'  // 橙色
];

const MapboxTest = () => {
    const navigation = useNavigation();
    const userInfo = useSelector(state => state.userStore.userInfo);
    const [userLocation, setUserLocation] = useState(null);
    const [showAnnotationManager, setShowAnnotationManager] = useState(false);
    const [showDrawingTools, setShowDrawingTools] = useState(false);
    const [showCommandCenter, setShowCommandCenter] = useState(false);
    const [drawingMode, setDrawingMode] = useState(null);
    const [activeGeoJson, setActiveGeoJson] = useState(null);
    const [savedGeoJsons, setSavedGeoJsons] = useState([]);
    const [annotations, setAnnotations] = useState([
        { id: '1', coordinates: [120.16, 30.28], name: '标注点1' },
        { id: '2', coordinates: [120.17, 30.29], name: '标注点2' },
    ]);

    const [drawingStyle, setDrawingStyle] = useState({
        color: '#4285F4',
        lineWidth: 3
    });
    const [groupUsers, setGroupUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const locationUpdateTimer = useRef(null);
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        color: '#4285F4',
        lineWidth: 3
    });

    const mapRef = useRef(null);
    const cameraRef = useRef(null);

    const [cameraConfig, setCameraConfig] = useState({
        centerCoordinate: [121.474000, 31.230001],
        zoomLevel: 14,
        animationDuration: 1000
    });

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const {longitude, latitude} = position.coords;
                const newLocation = [longitude, latitude];
                setUserLocation(newLocation);

                // 跳转到用户位置
                if (mapRef.current) {
                    mapRef.current.setCamera({
                        centerCoordinate: newLocation,
                        zoomLevel: 16,
                        animationDuration: 1500
                    });
                }

                console.log('当前位置:', newLocation);
            },
            error => {
                console.warn('获取位置失败:', error);
                // 如果获取位置失败，使用默认位置
                const defaultLocation = [121.474000, 31.230001];
                setUserLocation(defaultLocation);
                if (mapRef.current) {
                    mapRef.current.setCamera({
                        centerCoordinate: defaultLocation,
                        zoomLevel: 14,
                        animationDuration: 1500
                    });
                }
                Alert.alert(
                    '位置获取失败',
                    '无法获取您的当前位置，已切换到默认位置。请检查位置权限设置。'
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,        // 减少超时时间到10秒
                maximumAge: 5000,     // 允许使用最近5秒内的缓存位置
            },
        );
    };

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                const auth = await Geolocation.requestAuthorization('whenInUse');
                if (auth === 'granted') {
                    getCurrentLocation();
                }
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: '位置信息权限',
                        message: '需要获取您的位置信息',
                        buttonNeutral: '稍后询问',
                        buttonNegative: '取消',
                        buttonPositive: '确定',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation();
                }
            }
        } catch (err) {
            console.warn('请求位置权限失败:', err);
        }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    // 获取用户的所有标注点
    const fetchUserAnnotations = async () => {
        try {
            if (!userInfo?.id) {
                console.log('用户未登录，跳过获取标注点');
                return;
            }

            const response = await getLabelUserPage({
                userId: userInfo.id,
                pageNo: 1,
                pageSize: 100
            });
            
            if (response?.code === 0 && response?.data) {
                console.log('原始返回数据:', JSON.stringify(response.data));
                
                // 检查 list 是否存在
                if (!response.data.list) {
                    console.error('返回数据中没有 list 字段');
                    return;
                }

                // 逐个检查每个标注点的数据结构
                const validData = response.data.list.filter(item => {
                    // 打印完整的项目数据
                    console.log('检查项目:', JSON.stringify(item));

                    // 检查必要字段
                    if (!item) {
                        console.log('项目为空');
                        return false;
                    }

                    if (!item.dataJson) {
                        console.log(`项目 ${item.id} 缺少 dataJson`);
                        return false;
                    }

                    if (!item.dataJson.geometry) {
                        console.log(`项目 ${item.id} 缺少 geometry`);
                        return false;
                    }

                    if (!item.dataJson.geometry.coordinates) {
                        console.log(`项目 ${item.id} 缺少 coordinates`);
                        return false;
                    }

                    if (!Array.isArray(item.dataJson.geometry.coordinates)) {
                        console.log(`项目 ${item.id} 的 coordinates 不是数组:`, 
                            typeof item.dataJson.geometry.coordinates);
                        return false;
                    }

                    // 根据几何类型检查坐标格式
                    const { type, coordinates } = item.dataJson.geometry;
                    console.log(`项目 ${item.id} 类型:`, type);
                    console.log(`项目 ${item.id} 坐标:`, JSON.stringify(coordinates));

                    switch (type) {
                        case 'Point':
                            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                                console.log(`项目 ${item.id} Point坐标格式错误`);
                                return false;
                            }
                            break;
                        case 'LineString':
                            if (!Array.isArray(coordinates) || !coordinates.every(coord => 
                                Array.isArray(coord) && coord.length === 2)) {
                                console.log(`项目 ${item.id} LineString坐标格式错误`);
                                return false;
                            }
                            break;
                        case 'Polygon':
                            if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0]) || 
                                !coordinates[0].every(coord => Array.isArray(coord) && coord.length === 2)) {
                                console.log(`项目 ${item.id} Polygon坐标格式错误`);
                                return false;
                            }
                            break;
                        default:
                            console.log(`项目 ${item.id} 未知的几何类型:`, type);
                            return false;
                    }

                    return true;
                });

                console.log('有效数据数量:', validData.length);
                console.log('有效数据:', JSON.stringify(validData));

                setSavedGeoJsons(validData);
            }
        } catch (error) {
            console.error('获取标注点失败:', error);
        }
    };

    useEffect(() => {
        // 初始化时获取位置和标注点
        getCurrentLocation();
        fetchUserAnnotations();
    }, []);

    // 每5分钟更新一次用户位置
    useEffect(() => {
        const updateLocation = () => {
            if (!userInfo?.id) {
                console.log('用户未登录，跳过位置更新');
                return;
            }
            
            Geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await updateUserLocation({
                            latitude,
                            longitude,
                            timestamp: new Date().toISOString(),
                            userId: userInfo.id
                        });
                        loadGroupUsers();
                    } catch (error) {
                        console.error('更新位置失败:', error);
                    }
                },
                (error) => console.error('获取位置失败:', error),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        };

        updateLocation();
        const intervalId = setInterval(updateLocation, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [userInfo]);

    const loadGroupUsers = async () => {
        try {
            if (!userInfo?.id) {
                console.log('用户未登录，跳过加载群组用户');
                return;
            }

            const userDetail = await getUserDetail(userInfo.id);
            const users = await getGroupUsers(userDetail.data.jobGroupId);
            if (users.code === 0) {
                setGroupUsers(users);
            } else {
                console.error('加载用户失败:', users.msg);
            }
        } catch (error) {
            console.error('加载用户失败:', error);
        }
    };

    const handleToolSelect = (tool) => {
        try {
            if (!tool || !tool.id || !tool.type) {
                console.log('无效的工具选择');
                return;
            }

        setDrawingMode(tool.id);
        const newActiveGeoJson = {
            type: 'Feature',
            geometry: {
                type: tool.type,
                coordinates: tool.type === 'Polygon' ? [[]] : []
            },
            properties: {
                    color: drawingStyle?.color || '#4285F4',
                    lineWidth: drawingStyle?.lineWidth || 3,
                title: '新图形',
                description: '绘制中...'
            }
        };
        setActiveGeoJson(newActiveGeoJson);
            setShowDrawingTools(false);
        } catch (error) {
            console.error('handleToolSelect 错误:', error);
            Alert.alert('错误', '选择工具时出现错误，请重试');
        }
    };

    // 处理地图点击事件
    const handleMapPress = async (event) => {
        // 关闭所有侧边栏
        setShowAnnotationManager(false);
        setShowDrawingTools(false);
        setShowCommandCenter(false);

        if (!drawingMode || !activeGeoJson) return;

        const coords = event.geometry.coordinates;
        const newGeoJson = activeGeoJson;

        try {
            switch (newGeoJson.geometry.type) {
                case 'Point':
                    newGeoJson.geometry.coordinates = coords;
                    break;
                case 'LineString':
                    newGeoJson.geometry.coordinates.push(coords);
                    break;
                case 'Polygon':
                    if (!newGeoJson.geometry.coordinates[0]) {
                        newGeoJson.geometry.coordinates[0] = [];
                    }
                    newGeoJson.geometry.coordinates[0].push(coords);
                    break;
            }
            setActiveGeoJson(newGeoJson);
        } catch (error) {
            console.error('处理坐标时出错:', error);
        }
    };

    const handleUserPress = (user) => {
        setSelectedUser(user);
        setShowUserInfo(true);
    };

    const handleSaveDrawing = async (drawingInfo) => {
        if (!activeGeoJson) return;

        const geometryType = activeGeoJson.geometry.type;
        let currentPoints = 0;

        if (geometryType === 'Polygon') {
            currentPoints = activeGeoJson.geometry.coordinates[0]?.length || 0;
        } else {
            currentPoints = activeGeoJson.geometry.coordinates?.length || 0;
        }

        const minPoints = {
            Point: 1,
            LineString: 2,
            Polygon: 3
        }[geometryType];

        if (currentPoints < minPoints) {
            Alert.alert('提示', `${geometryType}需要至少${minPoints}个点`);
            return;
        }

        const finalizedGeoJson = JSON.parse(JSON.stringify(activeGeoJson));
        if (geometryType === 'Polygon') {
            const firstPoint = finalizedGeoJson.geometry.coordinates[0][0];
            finalizedGeoJson.geometry.coordinates[0].push(firstPoint);
        }

        finalizedGeoJson.properties = {
            ...finalizedGeoJson.properties,
            title: drawingInfo.title || `未命名${geometryType}`,
            description: drawingInfo.description || '无描述'
        };

        let data = {
            labelName: drawingInfo.title.trim(),
            labelRemark: drawingInfo.description.trim(),
            dataJson: finalizedGeoJson,
            userId: userInfo.id
        }

        let res = await saveLabelUser(data);
        if (res.code === 0) {
            await setSavedGeoJsons(prev => [...prev, finalizedGeoJson]);
            setActiveGeoJson(null);
            setDrawingMode(null);
        } else {
            Alert.alert('保存失败', res.msg || '保存标注失败，请重试');
        }
    };

    const handleCancelDrawing = () => {
        setActiveGeoJson(null);
        setDrawingMode(null);
    };

    const clearMapData = () => {
        setSavedGeoJsons([]);
        setActiveGeoJson(null);
        setDrawingMode(null);
    };

    // 渲染标注点
    const renderFeatures = () => {
        let features = [];

        // 添加已保存的特征
        if (savedGeoJsons && savedGeoJsons.length > 0) {
            features = savedGeoJsons
                .filter(item => {
                    if (!item?.dataJson?.geometry?.coordinates) {
                        console.log('无效的特征数据:', item);
                        return false;
                    }
                    return true;
                })
                .map(item => ({
                    type: 'Feature',
                    geometry: item.dataJson.geometry,
                    properties: {
                        color: item.dataJson.properties.color || '#000000',
                        lineWidth: item.dataJson.properties.lineWidth || 3,
                        title: item.dataJson.properties.title,
                        description: item.dataJson.properties.description
                    },
                    id: item.id.toString()
                }));
        }

        // 添加当前正在绘制的特征
        if (activeGeoJson?.geometry?.coordinates) {
            const { type, coordinates } = activeGeoJson.geometry;
            let shouldAdd = false;

            if (type === "Polygon") {
                if (coordinates[0] && coordinates[0].length > 2) {
                    shouldAdd = true;
                }
            } else if (type === "LineString") {
                if (coordinates.length > 1) {
                    shouldAdd = true;
                }
            } else if (type === "Point") {
                if (coordinates.length > 0) {
                    shouldAdd = true;
                }
            }

            if (shouldAdd) {
                features.push({
                    ...activeGeoJson,
                    id: 'active-feature'
                });
            }
        }

        return (
            <>
            <Mapbox.ShapeSource
                    id="points-source"
                    shape={{
                        type: 'FeatureCollection',
                        features: features.filter(f => f.geometry.type === 'Point')
                    }}
            >
                <Mapbox.CircleLayer
                    id="points"
                        style={{
                            circleRadius: 8,
                            circleColor: ['get', 'color', ['get', 'properties']],
                            circleStrokeWidth: 2,
                            circleStrokeColor: '#ffffff'
                        }}
                    />
                </Mapbox.ShapeSource>

                <Mapbox.ShapeSource
                    id="lines-source"
                    shape={{
                        type: 'FeatureCollection',
                        features: features.filter(f => f.geometry.type === 'LineString')
                    }}
                >
                <Mapbox.LineLayer
                    id="lines"
                        style={{
                            lineColor: ['get', 'color', ['get', 'properties']],
                            lineWidth: ['get', 'lineWidth', ['get', 'properties']]
                        }}
                    />
                </Mapbox.ShapeSource>

                <Mapbox.ShapeSource
                    id="polygons-source"
                    shape={{
                        type: 'FeatureCollection',
                        features: features.filter(f => f.geometry.type === 'Polygon')
                    }}
                >
                <Mapbox.FillLayer
                        id="polygons"
                        style={{
                            fillColor: ['get', 'color', ['get', 'properties']],
                            fillOpacity: 0.3
                        }}
                />
                <Mapbox.LineLayer
                        id="polygon-outlines"
                        style={{
                            lineColor: ['get', 'color', ['get', 'properties']],
                            lineWidth: ['get', 'lineWidth', ['get', 'properties']]
                        }}
                />
            </Mapbox.ShapeSource>
            </>
        );
    };

    // 渲染标注点标题
    const renderAnnotationTitles = () => {
        if (!savedGeoJsons || savedGeoJsons.length === 0) return null;

        return savedGeoJsons.map(item => {
            if (!item?.dataJson?.geometry?.coordinates) return null;

            let titleCoordinate;
            try {
                if (item.dataJson.geometry.type === 'Point') {
                    titleCoordinate = item.dataJson.geometry.coordinates;
                } else if (item.dataJson.geometry.type === 'LineString') {
                    if (Array.isArray(item.dataJson.geometry.coordinates) && 
                        item.dataJson.geometry.coordinates.length > 0) {
                        const midIndex = Math.floor(item.dataJson.geometry.coordinates.length / 2);
                        titleCoordinate = item.dataJson.geometry.coordinates[midIndex];
                    }
                } else if (item.dataJson.geometry.type === 'Polygon') {
                    if (Array.isArray(item.dataJson.geometry.coordinates) && 
                        item.dataJson.geometry.coordinates[0] &&
                        item.dataJson.geometry.coordinates[0].length > 0) {
                        const midIndex = Math.floor(item.dataJson.geometry.coordinates[0].length / 2);
                        titleCoordinate = item.dataJson.geometry.coordinates[0][midIndex];
                    }
                }

                if (!Array.isArray(titleCoordinate) || titleCoordinate.length !== 2) {
                    return null;
                }

                return (
                    <Mapbox.PointAnnotation
                        key={`title-${item.id}`}
                        id={`title-${item.id}`}
                        coordinate={titleCoordinate}
                        onSelected={() => {
                            console.log("*******")
                            console.log(" 触发了选择标注点 \n",item)
                            console.log("*******")
                            setSelectedAnnotation(item);
                            setModalVisible(true);
                        }}
                    >
                        <View style={styles.titleContainer}>
                            <Text style={styles.titleText}>
                                {item?.dataJson?.properties?.title || item?.labelName || '未命名'}
                            </Text>
                        </View>
                    </Mapbox.PointAnnotation>
                );
            } catch (error) {
                console.error('处理标题坐标时出错:', error, item.id);
                return null;
            }
        }).filter(Boolean);
    };

    const handleBottomBarPress = (buttonType) => {
        switch (buttonType) {
            case 'layers':
                setShowAnnotationManager(true);
                setShowDrawingTools(false);
                setShowCommandCenter(false);
                break;
            case 'location':
                setShowDrawingTools(true);
                setShowAnnotationManager(false);
                setShowCommandCenter(false);
                break;
            case 'draw':
                setShowDrawingTools(true);
                setShowAnnotationManager(false);
                setShowCommandCenter(false);
                break;
            case 'command':
                setShowCommandCenter(true);
                setShowAnnotationManager(false);
                setShowDrawingTools(false);
                break;
            default:
                break;
        }
    };

    const handleSearchPress = () => {
        navigation.navigate('LinbanList');
    };

    const renderUserMarkers = () => {
        if (!groupUsers?.data || groupUsers.data.length === 0) {
            return null;
        }

        return groupUsers.data.map((user) => {
            // 如果用户没有位置信息，跳过渲染
            if (!user.longitude || !user.latitude) {
                return null;
            }

            return (
                <Mapbox.PointAnnotation
                    key={user.id}
                    id={`user-${user.id}`}
                    coordinate={[parseFloat(user.longitude), parseFloat(user.latitude)]}
                    onSelected={() => handleUserPress(user)}
                >
                    <View style={[
                        styles.userMarker,
                        {
                            backgroundColor: user.isAlive === 1 ? '#52c41a' : '#f5222d',
                            width: user.id === userInfo?.id ? 20 : 16,
                            height: user.id === userInfo?.id ? 20 : 16,
                            borderRadius: user.id === userInfo?.id ? 10 : 8,
                        }
                    ]} />
                </Mapbox.PointAnnotation>
            );
        }).filter(Boolean);
    };

    // 处理标注点点击
    const handleAnnotationPress = (annotation) => {
        setSelectedAnnotation(annotation);
        setModalVisible(true);
    };

    // 处理删除标注点
    const handleDelete = async () => {
        try {
            const response = await deleteLabelUser(selectedAnnotation.id);
            if (response.code === 0) {
                Alert.alert('成功', '删除成功');
                fetchUserAnnotations(); // 重新获取标注点列表
                setModalVisible(false);
            }
        } catch (error) {
            Alert.alert('错误', '删除失败');
        }
    };

    // 处理分享给群组用户
    const handleShare = async (userId) => {
        try {
            // 这里需要实现分享逻辑
            Alert.alert('成功', '分享成功');
            setModalVisible(false);
        } catch (error) {
            Alert.alert('错误', '分享失败');
        }
    };

    /**
                // 验证坐标格式
                    const { type, coordinates } = item.dataJson.geometry;
                    
                    if (type === 'Point') {
                        return Array.isArray(coordinates) && coordinates.length === 2;
                    } else if (type === 'LineString') {
                        return Array.isArray(coordinates) && coordinates.length >= 2;
                    } else if (type === 'Polygon') {
                        return Array.isArray(coordinates) && 
                               Array.isArray(coordinates[0]) && 
                               coordinates[0].length >= 3;
                    }
                    return false;
    */

    // 添加处理更新的函数
    const handleUpdate = async () => {
        try {
            const updateData = {
                id: selectedAnnotation.id+'',
                labelName: editForm.title,
                labelRemark: editForm.description,
                dataJson: {
                    type: "Feature",
                    geometry: selectedAnnotation.dataJson.geometry,
                    properties: {
                        color: editForm.color,
                        lineWidth: parseInt(editForm.lineWidth),
                        title: editForm.title,
                        description: editForm.description
                    }
                },
                userId: userInfo.id,
            };

            const response = await updateLabelUser(selectedAnnotation.id, updateData);
            if (response.code === 0) {
                // 更新本地数据
                setSavedGeoJsons(prevGeoJsons => 
                    prevGeoJsons.map(item => 
                        item.id === selectedAnnotation.id 
                            ? {...item, dataJson: updateData.dataJson}
                            : item
                    )
                );
                
                Alert.alert('成功', '更新成功');
                setModalVisible(false);
                setEditMode(false);
                
                // 重新获取数据以确保显示正确
                await fetchUserAnnotations();
            } else {
                Alert.alert('错误', response.msg || '更新失败');
            }
        } catch (error) {
            Alert.alert('错误', '更新失败');
            console.error('更新失败:', error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                onPress={() => navigation.navigate('LinbanList')}
                style={{
                    paddingTop: 10,
                    paddingBottom: 10,
                    backgroundColor: '#fff',
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 20
                }}
            >
                <Icon name="search" size={24} color="#000000" />
                <Text>搜索林班</Text>
            </TouchableOpacity>
            <Mapbox.MapView
                ref={mapRef}
                style={styles.map}
                onPress={handleMapPress}
                styleURL="mapbox://styles/mapbox/streets-zh-v1"
                initialCameraOptions={{
                    centerCoordinate: userLocation || [121.474000, 31.230001],
                    zoomLevel: 14,
                }}
            >
                {userLocation && (
                    <Mapbox.PointAnnotation
                        id="userLocation"
                        coordinate={userLocation}
                    >
                        <View style={styles.userLocationMarker} />
                    </Mapbox.PointAnnotation>
                )}

                {renderFeatures()}
                {renderAnnotationTitles()}
                {renderUserMarkers()}
            </Mapbox.MapView>

            {/* 添加返回用户位置按钮 */}
            <TouchableOpacity 
                style={styles.locationButton}
                onPress={getCurrentLocation}
            >
                <Icon name="my-location" size={24} color="#4285F4" />
            </TouchableOpacity>

            {showAnnotationManager && (
                <AnnotationManager
                    onClose={() => setShowAnnotationManager(false)}
                    features={savedGeoJsons}
                />
            )}

            {showDrawingTools && (
                <DrawingTools
                    visible={showDrawingTools}
                    onClose={() => setShowDrawingTools(false)}
                    onToolSelect={handleToolSelect}
                    currentTool={drawingMode}
                    onSave={handleSaveDrawing}
                    onCancel={handleCancelDrawing}
                    onClearMapData={clearMapData}
                    savedFeatures={savedGeoJsons}
                    onSetSavedFeatures={setSavedGeoJsons}
                    onRefreshData={fetchUserAnnotations}
                />
            )}

            {showCommandCenter && (
                <CommandCenter onClose={() => setShowCommandCenter(false)} />
            )}

            <View style={styles.searchContainer}>
                <TouchableOpacity 
                    style={styles.searchBox} 
                    onPress={() => navigation.navigate('LinbanList')} 
                    activeOpacity={0.7}
                >
                    <Icon name="search" size={20} color="#666666" style={styles.searchIcon} />
                    <View style={styles.searchInput}>
                        <TextInput
                            placeholder="搜索林班、标记"
                            placeholderTextColor="#888888"
                            editable={false}
                            style={styles.searchText}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            <BottomNavBar
                onLayersPress={() => handleBottomBarPress('layers')}
                onLocationPress={() => handleBottomBarPress('location')}
                onDrawPress={() => handleBottomBarPress('draw')}
                onCommandPress={() => handleBottomBarPress('command')}
            />

            {showUserInfo && selectedUser && (
                <UserInfoCard
                    user={selectedUser}
                    onClose={() => {
                        setShowUserInfo(false);
                        setSelectedUser(null);
                    }}
                />
            )}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setModalVisible(false);
                    setEditMode(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {!editMode ? (
                            // 查看模式
                            <>
                                <Text style={styles.modalTitle}>
                                    {selectedAnnotation?.dataJson?.properties?.title || selectedAnnotation?.labelName || '未命名'}
                                </Text>
                                
                                <TouchableOpacity 
                                    style={styles.modalButton}
                                    onPress={() => {
                                        setEditForm({
                                            title: selectedAnnotation?.dataJson?.properties?.title || selectedAnnotation?.labelName || '',
                                            description: selectedAnnotation?.dataJson?.properties?.description || selectedAnnotation?.labelRemark || '',
                                            color: selectedAnnotation?.dataJson?.properties?.color || '#4285F4',
                                            lineWidth: selectedAnnotation?.dataJson?.properties?.lineWidth || 3
                                        });
                                        setEditMode(true);
                                    }}
                                >
                                    <Text>修改</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.modalButton}
                                    onPress={() => {
                                        Alert.alert('删除', '确定要删除这个标注点吗？', [
                                            { text: '取消', style: 'cancel' },
                                            { text: '确定', onPress: handleDelete }
                                        ]);
                                    }}
                                >
                                    <Text>删除</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.modalButton, { backgroundColor: '#ddd' }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text>关闭</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // 编辑模式
                            <>
                                <Text style={styles.modalTitle}>编辑标注点</Text>
                                
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>标题</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={editForm.title}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, title: text }))}
                                        placeholder="请输入标题"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>描述</Text>
                                    <TextInput
                                        style={[styles.input, { height: 80 }]}
                                        value={editForm.description}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                                        placeholder="请输入描述"
                                        multiline
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>颜色</Text>
                                    <View style={styles.colorOptionsContainer}>
                                        {predefinedColors.map(color => (
                                            <TouchableOpacity
                                                key={color}
                                                style={[
                                                    styles.colorOption,
                                                    { backgroundColor: color },
                                                    editForm.color === color && styles.selectedColor
                                                ]}
                                                onPress={() => setEditForm(prev => ({ ...prev, color }))}
                                            />
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>线条粗细: {editForm.lineWidth}</Text>
                                    <View style={styles.lineWidthControl}>
                                        <TouchableOpacity
                                            style={styles.widthButton}
                                            onPress={() => setEditForm(prev => ({ 
                                                ...prev, 
                                                lineWidth: Math.max(1, prev.lineWidth - 1)
                                            }))}
                                        >
                                            <Text style={styles.buttonText}>-</Text>
                                        </TouchableOpacity>
                                        <TextInput
                                            style={styles.widthInput}
                                            value={String(editForm.lineWidth)}
                                            keyboardType="numeric"
                                            onChangeText={(value) => {
                                                const width = parseInt(value) || 1;
                                                setEditForm(prev => ({
                                                    ...prev,
                                                    lineWidth: Math.min(Math.max(width, 1), 10)
                                                }));
                                            }}
                                        />
                                        <TouchableOpacity
                                            style={styles.widthButton}
                                            onPress={() => setEditForm(prev => ({ 
                                                ...prev, 
                                                lineWidth: Math.min(10, prev.lineWidth + 1)
                                            }))}
                                        >
                                            <Text style={styles.buttonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity 
                                        style={[styles.button, styles.saveButton]}
                                        onPress={handleUpdate}
                                    >
                                        <Text style={[styles.buttonText, { color: 'white' }]}>保存</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={() => {
                                            setEditMode(false);
                                            setEditForm({
                                                title: '',
                                                description: '',
                                                color: '#4285F4',
                                                lineWidth: 3
                                            });
                                        }}
                                    >
                                        <Text style={[styles.buttonText, { color: '#333' }]}>取消</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    map: {
        flex: 1,
    },
    userLocationMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        borderWidth: 2,
        borderColor: 'white',
    },
    searchContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 15,
        zIndex: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
    },
    searchText: {
        fontSize: 15,
        color: '#333333',
        padding: 0,
    },
    sidebarContainer: {
        position: 'absolute',
        top: 100,
        right: 0,
        bottom: 0,
        width: '80%',
        backgroundColor: '#fff',
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 999,
    },
    userMarker: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'white',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    titleContainer: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        opacity: 1,
    },
    titleText: {
        fontSize: 12,
        color: '#333',
    },
    formGroup: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 8,
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    button: {
        width: '45%',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#4285F4',
    },
    cancelButton: {
        backgroundColor: '#ddd',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    colorOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 10,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        margin: 5,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    selectedColor: {
        borderColor: '#000',
        borderWidth: 3,
    },
    lineWidthControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    widthButton: {
        backgroundColor: '#4285F4',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    widthInput: {
        width: 50,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 16,
    },
    locationButton: {
        position: 'absolute',
        right: 16,
        bottom: 90, // 位于底部导航栏上方
        backgroundColor: 'white',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default MapboxTest;
