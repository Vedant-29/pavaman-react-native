import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function Account() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Fetch session when component mounts
    async function fetchSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    if (session) {
      getProfile();
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) {
        console.log("No user in this session");
        return;
      }

      const { data, error } = await supabase
        .from('employee_users')
        .select("*")
        .eq('id', session.user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setEmail(data.email);
        setUsername(data.name);
        setPhoneNo(data.phoneNo);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    phoneNo,
  }: {
    username: string;
    phoneNo: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session.user.id,
        username,
        phoneNo,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('employee_users').upsert(updates);

      if (error) {
        throw error;
      } else {
        Alert.alert("Profile updated successfully!");
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Phone No" value={phoneNo || ''} onChangeText={(text) => setPhoneNo(text)} />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, phoneNo })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
