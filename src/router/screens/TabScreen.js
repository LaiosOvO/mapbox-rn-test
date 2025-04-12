import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Msg from '../../pages/message/index';
import Mate from '../../pages/mate/index';
import User from '../../pages/user/index';
import MapboxTest from '../../pages/MapboxTest';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Colors, TouchableOpacity} from 'react-native-ui-lib';
import {useSelector} from 'react-redux';

const Tab = createBottomTabNavigator();

const renderTabinfo = (name, type, focused = false) => {
  let IconName = '';
  let tablabel = '';
  let IconComponent = FontAwesome;

  switch (name) {
    case 'Msg':
      IconName = focused ? 'comments' : 'comments-o';
      tablabel = '消息';
      break;
    case 'Mate':
      IconName = focused ? 'address-book' : 'address-book-o';
      tablabel = '好友';
      break;
    case 'Map':
      IconComponent = MaterialIcons;
      IconName = 'map';
      tablabel = '地图';
      break;
    case 'User':
      IconName = focused ? 'user' : 'user-o';
      tablabel = '我的';
      break;
  }

  if (type === 'icon') {
    return {IconName, IconComponent};
  }
  if (type === 'label') {
    return tablabel;
  }
  return null;
};

const TabScreen = () => {
  const themeColor = useSelector(state => state.settingStore.themeColor);
  const isFullScreen = useSelector(state => state.settingStore.isFullScreen);

  return (
    <Tab.Navigator
      initialRouteName="Msg"
      screenOptions={({route}) => ({
        tabBarLabel: renderTabinfo(route.name, 'label'),
        tabBarActiveTintColor: themeColor,
        tabBarInactiveTintColor: Colors.grey40,
        tabBarIcon: ({focused, color, size}) => {
          const {IconName, IconComponent} = renderTabinfo(route.name, 'icon', focused);
          if (!IconName) return null;
          return <IconComponent name={IconName} color={color} size={size} />;
        },
        headerShown: !isFullScreen,
        headerStyle: {backgroundColor: themeColor, height: 46},
        headerTitleAlign: 'center',
        headerTitleStyle: {fontSize: 16, color: Colors.white},
        tabBarStyle: {
          display: 'flex',
          height: 50,
          paddingBottom: 5,
        },
      })}>
      <Tab.Screen
        name="Msg"
        options={({navigation}) => ({
          title: '消息',
          headerRight: () => (
            <TouchableOpacity
              paddingR-16
              onPress={() => navigation.navigate('SearchMsg')}>
              <AntDesign name="search1" color={Colors.white} size={20} />
            </TouchableOpacity>
          ),
        })}
        component={Msg}
      />
      <Tab.Screen
        name="Mate"
        options={({navigation}) => ({
          title: '好友',
          headerTitleAlign: 'left',
          headerRight: () => (
            <TouchableOpacity
              paddingR-12
              onPress={() => navigation.navigate('Addmate')}>
              <FontAwesome name="user-plus" color={Colors.white} size={20} />
            </TouchableOpacity>
          ),
        })}
        component={Mate}
      />
      <Tab.Screen
        name="Map"
        component={MapboxTest}
        options={{
          title: '地图',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="User"
        options={{
          title: '我的',
        }}
        component={User}
      />
    </Tab.Navigator>
  );
};
export default TabScreen;
