import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const UserProfile = () => {
  const [session, setSession] = useState(null);
  const [userProf, setUserProf] = useState([]);

  useEffect(() => {
    async function fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        fetchUsers(session); // Pass session directly to avoid stale closure
      }
    }
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          fetchUsers(session); // Ensure session is not null before fetching users
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = async (currentSession) => {
    if (!currentSession || !currentSession.user) return; // Guard clause to ensure session and user are not null

    const { data, error } = await supabase
      .from("employee_users")
      .select("*")
      .eq("employee_id", currentSession.user.id);

    if (error) {
      console.error(error);
    } else {
      setUserProf(data[0]);    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.id}>{userProf.employee_id}</Text>
      <Text style={styles.username}>{userProf.name}</Text>
      <Text style={styles.email}>{userProf.email}</Text>
      <Text style={styles.email}>+91 {userProf.phoneNo}</Text>
      <Text style={styles.bio}>{userProf.bio}</Text>
      <TouchableOpacity style={[styles.button, styles.signOutButton]}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff", // Set the background color to black
  },
  username: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000", // Change text color to white
  },
  id: {
    fontSize: 16,
    color: "#CCC", // Light gray color for better visibility
    marginBottom: 5,
  },
  email: {
    fontSize: 17,
    color: "#AAAAAA", // Light gray color for better visibility
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#FFF", // Change text color to white
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "85%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: "red",
  },
});

export default UserProfile;
