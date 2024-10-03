// app/ManageJobsLayout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import ManageJobsScreen from './manageJobs'; // Ensure this path is correct

export default function ManageJobsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index" // This will be the default screen
        component={ManageJobsScreen}
        options={{
          headerShown: false, // This hides the header
        }}
      />
    </Stack>
  );
}
