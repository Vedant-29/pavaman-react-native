import React, { useEffect } from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import * as Location from "expo-location";
import { useState } from "react";
import { Text, FlatList, TouchableOpacity } from "react-native";

export default function App() {
  const [location, setLocation] = useState([]);

  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Please Grant permission");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);

    console.log(location.coords.latitude);
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
      <ThemedView style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            getPermissions();
          }}
        >
          <Text style={styles.buttonTextActive}>To complete</Text>
        </TouchableOpacity>
        <ThemedText type="title">Latitude - {location.coords.latitude}</ThemedText>
        <ThemedText type="title">Longitude - {location.coords.longitude}</ThemedText>

      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
  },
  titleContainer: {},
  map: {
    width: "100%",
    height: "100%",
  },
  button: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  buttonTextActive: {
    fontSize: 16,
    color: "#FFF",
    backgroundColor: "#1890FF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
});
