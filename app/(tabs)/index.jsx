import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";

import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState("To complete");
  const [session, setSession] = useState(null);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
  const [tasksNew, setTasksNew] = useState([]);

  const [location, setLocation] = useState(null); // Initialize as null

  useEffect(() => {
    getPermissions();
    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      console.log("this is the user session from index page - ", session.user?.id);
      employeeTasks(session.user?.id);
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  });

  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Please grant permission");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  const employeeTasks = async (userId) => {
    const { data, error } = await supabase
      .from("employee_tasks")
      .select("*")
      .eq("assigned_to_id", userId);

    if (error) {
    } else {
      setTasksNew(data);
    }
  };

  const handlePhonePress = (phoneNo) => {
    console.log(phoneNo);
  };

  const handleMapPress = (mapLink) => {
    console.log(mapLink);
  };

  const renderItem = (item) => (
    <View key={item.id} style={[styles.taskContainer]}>
      <Text style={styles.taskTime}>{item.created_at}</Text>
      <View style={styles.taskTitleContainer}>
        <Text style={styles.taskTitle}>{item.location_name}</Text>
        <TouchableOpacity
          onPress={() => handleMapPress(item.location_map_link)}
        >
          <Text style={styles.mapLink}>View on Map</Text>
        </TouchableOpacity>
        <Text style={styles.completionDate}>{item.completion_date}</Text>
        <TouchableOpacity
          onPress={() => handlePhonePress(item.location_poc_phoneNo)}
        >
          <Text style={styles.pocName}>{item.location_poc_name}</Text>
          <Text style={styles.pocPhoneNo}>{item.location_poc_phoneNo}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Task</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredTasks = tasksNew.filter((task) => task.status === selectedTab);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} showsUserLocation showsMyLocationButton>
        {tasksNew.map((marker, index) => (
          <Marker key={marker.id} index={index} coordinate={marker} />
        ))}
      </MapView>
      <BottomSheet snapPoints={snapPoints} index={2}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleHeading}>21st July 2021</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => setSelectedTab("To complete")}
              style={
                selectedTab === "To complete"
                  ? styles.buttonActive
                  : styles.button
              }
            >
              <Text
                style={
                  selectedTab === "To complete"
                    ? styles.buttonTextActive
                    : styles.buttonText
                }
              >
                To complete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab("In Progress")}
              style={
                selectedTab === "In Progress"
                  ? styles.buttonActive
                  : styles.button
              }
            >
              <Text
                style={
                  selectedTab === "In Progress"
                    ? styles.buttonTextActive
                    : styles.buttonText
                }
              >
                In Progress
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedTab("Completed")}
              style={
                selectedTab === "Completed"
                  ? styles.buttonActive
                  : styles.button
              }
            >
              <Text
                style={
                  selectedTab === "Completed"
                    ? styles.buttonTextActive
                    : styles.buttonText
                }
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.listContainer}
          >
            {filteredTasks.map(renderItem)}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D3D47",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
    marginHorizontal: 10,
  },
  titleHeading: {
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 0.75,
    borderColor: "#ccc",
  },
  buttonActive: {
    backgroundColor: "#1890FF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1890FF",
  },
  buttonText: {
    fontSize: 15,
    color: "#000",
  },
  buttonTextActive: {
    fontSize: 15,
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  taskContainer: {
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 0.75,
    borderColor: "#ccc",
  },
  taskTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  taskTitleContainer: {
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  mapLink: {
    color: "#1E90FF",
    textDecorationLine: "underline",
  },
  completionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  pocName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  pocPhoneNo: {
    fontSize: 14,
    color: "#1E90FF",
    textDecorationLine: "underline",
  },
  taskDescription: {
    fontSize: 14,
    color: "#333",
  },
  editButton: {
    alignItems: "center",
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 7,
  },
});
