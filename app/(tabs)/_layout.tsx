import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Platform, StyleSheet, View } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#282c34',
          borderTopColor: '#444',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="dashboard" color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (Platform.OS === 'web') {
              // Apply blur for the web view on tab press
              document.body.style.backdropFilter = 'blur(10px)';
            }
          },
        })}
      />
      <Tabs.Screen
        name="add_entry"
        options={{
          title: 'New Entry',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (Platform.OS === 'web') {
              // Apply blur for the web view on tab press
              document.body.style.backdropFilter = 'blur(10px)';
            }
          },
        })}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <TabBarIcon name="newspaper-o" color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (Platform.OS === 'web') {
              // Apply blur for the web view on tab press
              document.body.style.backdropFilter = 'blur(10px)';
            }
          },
        })}
      />
    </Tabs>
  );
}
