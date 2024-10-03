import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Image, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Add Firestore functions
import { db } from '../firebase'; // Adjust the import path according to your project structure
import ComposeMailModal from './ComposeMailModal'; // Adjust path

const CustomerQuery = () => {
  const route = useRoute(); // Access the route prop
  const { serialNumber } = route.params; // Extract the serial number from params
  const [queryData, setQueryData] = useState(null); // State to hold query data
  const [modalVisible, setModalVisible] = useState(false);

  // Function to fetch data based on the serial number
  const fetchData = async () => {
    try {
      const queriesCollection = collection(db, 'queries');
      const q = query(queriesCollection, where('serialNumber', '==', serialNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data(); // Get the first document's data
        setQueryData(data);
      } else {
        console.log('No matching documents found');
      }
    } catch (error) {
      console.error('Error fetching query data:', error);
    }
  };

  // Use effect to fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [serialNumber]);

  const navbarStyle = Platform.OS === 'web' ? styles.navbarWeb : styles.navbar;

  return (
    <LinearGradient colors={['#93a5cf', '#e4efe9']} style={styles.container}>
      {/* Admin Navbar with Logo and Company Name */}
      <View style={navbarStyle}>
        <Image
          source={require('../assets/images/sm.jpg')}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.companyName}>Stellar MoldTech</Text>
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>Customer Query</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {queryData ? (
          <>
            <Text style={styles.detail}>Serial Number : {queryData.serialNumber}</Text>
            <Text style={styles.detail}>Company Name : {queryData.company}</Text>
            <Text style={styles.detail}>GST : {queryData.gst}</Text>
            <Text style={styles.detail}>City : {queryData.city}</Text>
            <Text style={styles.detail}>Customer Name : {queryData.name}</Text>
            <Text style={styles.detail}>Mail id : {queryData.email}</Text>
            <Text style={styles.detail}>Phone : {queryData.phone}</Text>
            <Text style={styles.detail}>Job Type : {queryData.jobType}</Text>
            <Text style={styles.detail}>Description : {queryData.description}</Text>
            <Text style={styles.detail}>
              Attachment: {queryData.attachment ? (
                <Text
                  style={styles.link}
                  onPress={() => {
                    // Open the attachment URL using Linking API
                    Linking.openURL(queryData.attachment).catch(err => console.error("Failed to open URL: ", err));
                  }}
                >
                  Open Attachment
                </Text>
              ) : (
                <Text style={styles.detail}>No attachment</Text>
              )}
            </Text>
            <Text style={styles.detail}>Submission Date : {queryData.submissionDate}</Text>
            <Text style={styles.detail}>Submission Time : {queryData.submissionTime}</Text>

            {/* Button to open the ComposeMailModal */}
            <TouchableOpacity
              style={styles.composeButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.composeButtonText}>Compose Email</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.detail}>Loading data...</Text>
        )}

        {/* Compose Mail Modal */}
        <ComposeMailModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          customerName={queryData?.name}      // Pass customer name
          jobType={queryData?.jobType}        // Pass job type
          customerEmail={queryData?.email} 
          customerReadStatus={queryData?.readStatus} 
          customerSerialNumber={queryData?.serialNumber} 

        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1, // Ensures it takes the full height
  },
  scrollViewContent: {
    flexGrow: 1, // Allows content to grow
    padding: 5,
    paddingLeft: 10,
    marginTop: Platform.OS === 'web' ? -0 : 0,
  },
  container: {
    flex: 1,
    flexGrow: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '107%',
    height: 70,
    marginLeft: -10,
    marginTop: 25,
  },
  navbarWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 70,
    marginTop: 10,
  },
  logo: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginTop: -10,
    marginRight: 15,
    marginLeft: 15,
    overflow: 'hidden',
  },
  companyName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -10,
    color: '#111',
  },
  headerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: -5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  detail: {
    fontSize: 22,
    marginVertical: 5,
    paddingLeft: 5,
  },
  composeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  composeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CustomerQuery;
