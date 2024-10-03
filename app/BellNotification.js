import React, { useState,useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from expo vector-icons
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebase'; // Import your Firebase configuration
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const BellNotification = () => {
  const [notifications, setNotifications] = useState(0); // Initialize notification count
  const [modalVisible, setModalVisible] = useState(false);
  const [queriesData, setQueriesData] = useState([]); // State to hold fetched data

  const navigation = useNavigation(); // Get the navigation prop

  const fetchQueriesData = async () => {
    try {
      const queriesCollection = collection(db, 'queries');
      const queriesSnapshot = await getDocs(queriesCollection);
      const queriesList = queriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Include document ID

      // Filter for unseen status
      const filteredSortedQueries = queriesList
        .filter(item => item.readStatus === 'unseen') // Filter for unseen status
        .sort((a, b) => b.serialNumber - a.serialNumber); // Sort in descending order

      setQueriesData(filteredSortedQueries);

      // Update notifications count based on unseen items
      setNotifications(filteredSortedQueries.length); // Set the count of unseen notifications
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };
  useEffect(() => {
    fetchQueriesData(); // Fetch the data when the component mounts
  }, []);

  const handleBellClick = async () => {
    setModalVisible(true);
    await fetchQueriesData(); // Fetch the data when modal opens
  };

  return (
    <View>
      {/* Notification Bell */}
      <TouchableOpacity onPress={handleBellClick} style={styles.bellContainer}>
        <Ionicons name="notifications-outline" size={30} color="#000" /> 
        {notifications > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal to show notifications */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.fetchOverlay}>
          <View style={styles.fetchContent}>
            <Text style={styles.fetchTitle}>Notifications</Text>

            {queriesData.length > 0 ? (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {queriesData.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.dataBlock}
                    onPress={() => {
                      navigation.navigate('CustomerQuery', { serialNumber: item.serialNumber });
                      setModalVisible(false); // Close modal on navigation
                    }} // Navigate with serial number
                  >
                    <Text style={styles.fetchText}>Serial Number: {item.serialNumber}</Text>
                    <Text style={styles.fetchText}>Job Type: {item.jobType}</Text>
                    <Text style={styles.fetchText}>Description: {item.description}</Text>
                    <Text style={styles.fetchText}>Company Name: {item.company}</Text>
                    <Text style={styles.fetchText}>Submission Date: {item.submissionDate}</Text>
                    <Text style={styles.fetchText}>Submission Time: {item.submissionTime}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text>No notifications found.</Text>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.fetchButton}
            >
              <Text style={styles.fetchButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  fetchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  fetchOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fetchContent: {
    width: '85%', // Increase the width for a better modal view
    height: '80%', // Set height for scrollability
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  dataBlock: {
    backgroundColor: '#e4efe9', // Light background for data block
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Adds shadow for Android
  },
  fetchText: {
    color: '#111',
    fontSize: 16,
    marginBottom: 5,
  },
  fetchButton: {
    position: 'absolute',
    bottom: 10,
    left: 50,
    right: 50,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BellNotification;
