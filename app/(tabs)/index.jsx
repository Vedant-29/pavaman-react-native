import { Image, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useState } from "react";

const tasks = [
  {
    id: "1",
    time: "10:30 AM - 11:30 AM",
    title: "Programming",
    description:
      "Create a unique emotional story that describes better than words",
    color: "#E6F7FF",
    borderColor: "#1890FF",
    icon: "💻",
  },
  {
    id: "2",
    time: "11:30 AM - 12:30 PM",
    title: "Math",
    description:
      "Create a unique emotional story that describes better than words",
    color: "#FFF1F0",
    borderColor: "#FF4D4F",
    icon: "🔢",
  },
  {
    id: "3",
    time: "11:30 AM - 12:30 PM",
    title: "Science",
    description:
      "Create a unique emotional story that describes better than words",
    color: "#FFF1F0",
    borderColor: "#FF4D4F",
    icon: "🔬",
  },
];

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState("To complete");

  const renderItem = (item) => (
    <View key={item.id} style={[styles.taskContainer, { backgroundColor: item.color, borderColor: item.borderColor }]}>
      <Text style={styles.taskTime}>{item.time}</Text>
      <View style={styles.taskTitleContainer}>
        <Text style={styles.taskIcon}>{item.icon}</Text>
        <Text style={styles.taskTitle}>{item.title}</Text>
      </View>
      <Text style={styles.taskDescription}>{item.description}</Text>
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">21st July 2021</ThemedText>
      </ThemedView>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => setSelectedTab("To complete")}
            style={styles.button}
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
            style={styles.button}
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
            style={styles.button}
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
        {tasks.map(renderItem)}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: 50,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: 'space-around',
    justifyContent: "center",
  },
  button: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
  listContainer: {
    paddingHorizontal: 7,
  },
  taskContainer: {
    padding: 15,
    marginHorizontal: 5,
    marginVertical: 0,
    borderRadius: 10,
    borderWidth: 1,
  },
  taskTime: {
    fontSize: 14,
    color: "#000",
  },
  taskTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  taskIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  taskDescription: {
    fontSize: 14,
    color: "#000",
    marginTop: 5,
  },
});
