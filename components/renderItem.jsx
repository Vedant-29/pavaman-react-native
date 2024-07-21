import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons

export const renderItem = (item) => (
  <View key={item.id} style={styles.taskContainer}>
    <View style={styles.taskHeader}>
      <Text style={styles.taskTitle}>{item.location_name}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => handleMapPress(item.location_map_link)}>
          <Icon name="map" size={24} color="#1E90FF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditPress(item.id)}>
          <Icon name="edit" size={24} color="#1E90FF" />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.pocContainer}>
      <Text style={styles.pocName}>{item.location_poc_name}</Text>
      <Text style={styles.pocEmail}>{item.location_poc_email}</Text>
      <Text style={styles.pocPhoneNo}>{item.location_poc_phoneNo}</Text>
    </View>
    <Text style={styles.taskDescription}>{item.description}</Text>
  </View>
);

const styles = StyleSheet.create({
  taskContainer: {
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 0.75,
    borderColor: "#ccc",
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  pocContainer: {
    marginBottom: 10,
  },
  pocName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pocEmail: {
    fontSize: 14,
    color: '#666',
  },
  pocPhoneNo: {
    fontSize: 14,
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  taskDescription: {
    fontSize: 14,
    color: '#333',
  },
});
