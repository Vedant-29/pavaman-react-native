import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState("To complete");
  const [session, setSession] = useState(null);
  const [tasksNew, setTasksNew] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const snapPoints = useMemo(() => ["25%", "50%", "75%", "90%"], []);

  useEffect(() => {
    getPermissions();
    async function fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      fetchTasks(session.user?.id, selectedDate);
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [selectedDate]);

  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Please grant permission");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };
  const fetchTasks = async (userId, date) => {
    const startOfDay = moment(date).startOf("day").toISOString();
    const endOfDay = moment(date).endOf("day").toISOString();

    const { data, error } = await supabase
      .from("employee_tasks")
      .select("*")
      .eq("assigned_to_id", userId)
      .gte("completion_date", startOfDay)
      .lte("completion_date", endOfDay);

    if (error) {
      console.error(error);
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

  const handleSendLocation = async () => {
    if (location) {
      const userId = session?.user?.id; // Get the user ID from the session
      if (userId) {
        const { data, error } = await supabase
          .from("employee_users")
          .update({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          })
          .eq("employee_id", userId); // Filter for the specific user ID

        if (error) {
          console.error("Error updating location:", error.message);
        } else {
          console.log("Location updated successfully:", data);
          Alert.alert(
            "Location Sent",
            `Location: ${location.coords.latitude}, ${location.coords.longitude}`
          );
        }
      } else {
        Alert.alert("No User ID", "User ID not available.");
      }
    } else {
      Alert.alert("No Location", "Location not available.");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const renderItem = (item) => (
    <View style={renderStyles.taskContainer}>
      <View style={renderStyles.taskHeader}>
        <Text style={renderStyles.taskTitle}>{item.location_name}</Text>
        <View style={renderStyles.iconContainer}>
          <TouchableOpacity
            onPress={() => handleMapPress(item.location_map_link)}
            style={renderStyles.iconStyle}
          >
            <Icon name="map-marker" size={24} color="#1E90FF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEditPress(item.id)}
            style={renderStyles.iconStyleSecond}
          >
            <Icon name="edit" size={24} color="#1E90FF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={renderStyles.pocContainer}>
        <Text style={renderStyles.pocName}>{item.location_poc_name}</Text>
        <Text style={renderStyles.pocPhoneNo}>{item.location_poc_phoneNo}</Text>
      </View>
      <Text style={renderStyles.taskDescription}>
        Task created at {new Date(item.created_at).toLocaleDateString()}{" "}
        {new Date(item.created_at).toLocaleTimeString()}
      </Text>
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
            <TouchableOpacity
              onPress={() =>
                setSelectedDate(
                  moment(selectedDate).subtract(1, "days").toDate()
                )
              }
              style={{
                marginLeft: 20,
                padding: 8,
                justifyContent: "center",
                alignItems: "center",
                width: 40,
                height: 40,
                borderRadius: 100,
                backgroundColor: "#F0F0F0",
              }}
            >
              <Icon name="chevron-left" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.titleHeading}>
                {moment(selectedDate).format("DD MMM YYYY")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setSelectedDate(moment(selectedDate).add(1, "days").toDate())
              }
              style={{
                marginRight: 20,
                padding: 8,
                justifyContent: "center",
                alignItems: "center",
                width: 40,
                height: 40,
                borderRadius: 100,
                backgroundColor: "#F0F0F0",
              }}
            >
              <Icon name="chevron-right" size={24} />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode={"date"}
              display="default"
              onChange={handleDateChange}
            />
          )}
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
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleSendLocation}
      >
        <Icon name="send" size={24} color="#fff" />
      </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    marginHorizontal: 10,
  },
  titleHeading: {
    fontSize: 26,
    fontWeight: "bold",
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
    backgroundColor: "#fff",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  iconContainer: {
    flexDirection: "row",
    gap: 10,
  },
  pocContainer: {
    marginBottom: 10,
  },
  pocName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  pocEmail: {
    fontSize: 14,
    color: "#666",
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
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1E90FF",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 7,
  },
});

const renderStyles = StyleSheet.create({
  taskContainer: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  iconContainer: {
    flexDirection: "row",
  },
  pocContainer: {
    marginTop: 2,
  },
  pocName: {
    fontSize: 16,
    fontWeight: "500",
  },
  pocPhoneNo: {
    fontSize: 14,
    color: "#555",
  },
  taskDescription: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },
  iconStyle: {
    padding: 8,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#F0F0F0",
  },
  iconStyleSecond: {
    padding: 8,
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#F0F0F0",
  },
});
