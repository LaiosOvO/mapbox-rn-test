import * as React from 'react';
import {Platform} from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Login from '../pages/login/login';
import DrawerScreen from './screens/DrawerScreen';
import BaseWebView from '../pages/commom/baseWebView';
import {Colors, TouchableOpacity} from 'react-native-ui-lib';
import {useSelector, useDispatch} from 'react-redux';
import {setShowMusicCtrl} from '../stores/store-slice/musicStore';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {createStackNavigator} from '@react-navigation/stack';
import BootSplash from 'react-native-bootsplash';
import MapboxTest from '../pages/MapboxTest';
import LinbanList from '../pages/LinbanList'; // 确保导入林班列表页面
import LinbanDetail from '../pages/LinbanDetail'; // 确保导入林班列表页面


const Stack = createStackNavigator();

const RootScreen = () => {
  const dispatch = useDispatch();

  const userToken = useSelector(state => state.userStore.userToken);
  const themeColor = useSelector(state => state.settingStore.themeColor);
  const isFullScreen = useSelector(state => state.settingStore.isFullScreen);
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        BootSplash.hide();
        const curRouteName = navigationRef.current.getCurrentRoute().name;
        dispatch(setShowMusicCtrl(curRouteName));
      }}
      onStateChange={async () => {
        const curRouteName = navigationRef.current.getCurrentRoute().name;
        dispatch(setShowMusicCtrl(curRouteName));
      }}>
      <Stack.Navigator>
    
        {userToken ? (
          <Stack.Screen
            name="Root"
            component={DrawerScreen}
            options={{
              headerShown: Platform.OS === 'ios' ? true : false,
              headerStatusBarHeight: 0,
              headerStyle: {
                backgroundColor: userToken
                  ? isFullScreen
                    ? Colors.$backgroundNeutral
                    : themeColor
                  : Colors.white,
              },
              title: '',
            }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
            }}
          />
        )}
        
        {/*  公共屏幕 */}
        <Stack.Group
          screenOptions={({navigation}) => ({
            headerLeft: () => (
              <TouchableOpacity paddingH-26 onPress={() => navigation.goBack()}>
                <FontAwesome
                  name="angle-left"
                  color={userToken ? Colors.white : Colors.black}
                  size={26}
                />
              </TouchableOpacity>
            ),
          })}>
          <Stack.Screen
            name="WebView"
            component={BaseWebView}
            options={({route}) => ({
              title: route.params?.title,
            })}
          />
        </Stack.Group>

        <Stack.Screen
          name="MapboxTest"
          component={MapboxTest}
          options={{
            headerShown: false,
          }}
        />

      <Stack.Screen
        name="LinbanList"
        component={LinbanList}
        options={{
          headerShown: true, // 根据需要显示或隐藏头部
          title: '林班列表', // 设置页面标题
        }}
      />
      <Stack.Screen
        name="LinbanDetail"
        component={LinbanDetail}
        options={{
          headerShown: true, // 根据需要显示或隐藏头部
          title: '林班列表', // 设置页面标题
        }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootScreen;
