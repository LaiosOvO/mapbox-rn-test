import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from 'react-native-ui-lib';

const BottomNavBar = ({ 
  onLayersPress, 
  onLocationPress, 
  onDrawPress, 
  onCommandPress 
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.newButton}>
        <Text style={styles.newButtonText}>+ 新建林班</Text>
      </TouchableOpacity>
      
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={onLayersPress}>
          <Icon name="layers" size={24} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onLocationPress}>
          <Icon name="edit" size={24} color={Colors.black} />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.iconButton} onPress={onDrawPress}>
          <Icon name="edit" size={24} color={Colors.black} />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.iconButton} onPress={onCommandPress}>
          <Icon name="crop_square" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'white',
  },
  newButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default BottomNavBar; 