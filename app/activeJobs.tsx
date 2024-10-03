import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Image, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Add Firestore functions
import { db } from '../firebase'; // Adjust the import path according to your project structure

const activeJobs = () => {
    const navigation = useNavigation();

  const route = useRoute(); // Access the route prop
  const { serialNumber } = route.params; // Extract the serial number from params
  const [queryData, setQueryData] = useState(null); // State to hold query data
//   const [modalVisible, setModalVisible] = useState(false);

  // Function to fetch data based on the serial number
  const fetchJobDetails = async () => {
    const q = query(collection(db, 'adminentries'), where('serialNumber', '==', serialNumber)); // Query adminentries collection with serialNumber

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const job = querySnapshot.docs[0].data(); // Assuming serial numbers are unique
        setQueryData(job); // Save job details in state
      } else {
        console.log('No job found with this serial number.');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  useEffect(() => {
    fetchJobDetails(); // Fetch job details when component mounts
  }, [serialNumber]);

//   const handleManageJobsPress = () => {
//     navigation.navigate('manageJobs');
//   };

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
            <Text style={styles.detail}>Purchase Amount : {queryData.purchaseAmount}</Text>
            <Text style={styles.detail}>Sale Amount : {queryData.saleAmount}</Text>
            <Text style={styles.detail}>Profit : {queryData.profit}</Text>
            <Text style={styles.detail}>Status : {queryData.status}</Text>
            <Text style={styles.detail}>Submission Date : {queryData.submissionDate}</Text>
            <Text style={styles.detail}>Third Party Company : {queryData.thirdParty}</Text>
            <Text style={styles.detail}>Third Party GST : {queryData.thirdPartyGST}</Text>
            <Text style={styles.detail}>Third Party City : {queryData.thirdPartyCity}</Text>

            {/* Button to open the ComposeMailModal */}
            {/* <TouchableOpacity onPress={handleManageJobsPress} style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Manage Jobs</Text>
            </TouchableOpacity> */}
          </>
        ) : (
          <Text style={styles.title}>Loading data...</Text>
        )}


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
    width:'98%',
    fontSize: 20,
    borderWidth: 1,         // Adds a border width of 1 (adjust as needed)
    borderColor: '#111',    // Sets the border color to match your existing color
    borderRadius: 8,        // Adds rounded corners to the border (adjust the radius as needed)
    marginVertical: 5,      // Vertical margin for spacing between text items
    paddingLeft: 5,         // Padding to create space between the text and the border
    // paddingRight: 10,         // Padding to create space between the text and the border
    paddingVertical: 8,    // Adds some padding vertically inside the border
  },
//   quickActionButton: {
//     alignItems:'center',
//     backgroundColor: '#2196F3',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     elevation: 3,
//   },
//   quickActionText: {

//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
  
});

export default activeJobs;
