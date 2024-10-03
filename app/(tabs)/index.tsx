import React, { useState, useEffect } from 'react';
import { View, Text, Image,FlatList, TouchableOpacity, StyleSheet, ScrollView, Platform, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../firebase'; // Ensure this points to your Firebase setup
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import BellNotification from '../BellNotification'; // Make sure to import the BellNotification component




export default function Dashboard() {
  const navigation = useNavigation();

  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);

  const [activeJobs, setActiveJobs] = useState([]); // For active job details
  const [completedJobs, setCompletedJobs] = useState([]); // For completed job details


  const [activeJobsModalVisible, setActiveJobsModalVisible] = useState(false);
  const [completedJobsModalVisible, setCompletedJobsModalVisible] = useState(false);

  const navbarStyle = Platform.OS === 'web' ? styles.navbarWeb : styles.navbar;



  const fetchActiveJobs = async () => {
    const activeJobsDocRef = doc(db, 'activeJobs', 'current');

    const q = query(collection(db, 'adminentries'), where('status', '==', 'inProgress'));

    try {
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Store job details

      setActiveJobs(jobs); // Save job details in state
      setActiveJobsCount(jobs.length); // Set the active jobs count

      await updateDoc(activeJobsDocRef, {
        count: jobs.length,
      });
    } catch (error) {
      console.error('Error fetching active jobs:', error);
    }
  };

  // Fetch completed jobs and details
  const fetchCompletedJobs = async () => {
    const completedJobsDocRef = doc(db, 'completedJobs', 'current');

    const q = query(collection(db, 'adminentries'), where('status', '==', 'completed'));

    try {
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Store job details

      setCompletedJobs(jobs); // Save job details in state
      setCompletedJobsCount(jobs.length); // Set the completed jobs count

      await updateDoc(completedJobsDocRef, {
        count: jobs.length,
      });
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
    fetchCompletedJobs();
  }, []);

  const handleManageJobsPress = () => {
    navigation.navigate('manageJobs');
  };
  

  return (
    <LinearGradient colors={['#93a5cf', '#e4efe9']} style={styles.container}>
      {/* Active Jobs Modal */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={activeJobsModalVisible}
  onRequestClose={() => setActiveJobsModalVisible(false)}
>
  <View style={styles.fetchOverlay}>
    <View style={styles.fetchContent}>
      <Text style={styles.fetchTitle}>Active Jobs</Text>
      {activeJobs.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeJobs.map((item, index) => (
            <TouchableOpacity key={index} style={styles.dataBlock}onPress={() => {
              setActiveJobsModalVisible(false); // Close the modal
              navigation.navigate('activeJobs', { serialNumber: item.serialNumber }); // Navigate and pass the data
            }}
          >
              <Text style={styles.fetchText}>Company Name: {item.company }</Text>
              <Text style={styles.fetchText}>Third Party Comp. Name: {item.thirdParty}</Text>
              <Text style={styles.fetchText}>Job Type: {item.jobType}</Text>
              <Text style={styles.fetchText}>Status: {item.status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text>No active jobs found.</Text>
      )}
      <TouchableOpacity
        onPress={() => setActiveJobsModalVisible(false)}
        style={styles.fetchButton}
      >
        <Text style={styles.fetchButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{/* Completed Jobs Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={completedJobsModalVisible}
  onRequestClose={() => setCompletedJobsModalVisible(false)}
>
  <View style={styles.fetchOverlay}>
    <View style={styles.fetchContent}>
      <Text style={styles.fetchTitle}>Completed Jobs</Text>
      {completedJobs.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {completedJobs.map((item, index) => {
            const dateObject = new Date();
            const formattedDate = format(dateObject, 'dd/MM/yyyy'); // Format as dd/mm/yyyy

            return (
              <TouchableOpacity key={index} style={styles.dataBlock}>
                <Text style={styles.fetchText}>Company : {item.company}</Text>
                <Text style={styles.fetchText}>3rd Party : {item.thirdParty}</Text>
                <Text style={styles.fetchText}>Job Type : {item.jobType}</Text>
                <Text style={styles.fetchText}>Status : {item.status}</Text>
                <Text style={styles.fetchText}>Completion Date : {formattedDate}</Text> 
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <Text>No completed jobs found.</Text>
      )}
      <TouchableOpacity
        onPress={() => setCompletedJobsModalVisible(false)}
        style={styles.fetchButton}
      >
        <Text style={styles.fetchButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* Admin Navbar with Logo and Company Name */}
      <View style={navbarStyle}>
        <Image source={require('../../assets/images/sm.jpg')} style={styles.logo} resizeMode="cover" />
        <Text style={styles.companyName}>Stellar MoldTech</Text>
        
        <BellNotification />

      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome</Text>
          {/* <Text style={styles.subText}>Manage your data.</Text> */}

          {/* Key Metrics */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statCard} onPress={() => setActiveJobsModalVisible(true)}>
              <Text style={styles.statTitle}>Active Jobs</Text>
              <Text style={styles.statValue}>{activeJobsCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={() => setCompletedJobsModalVisible(true)}>
              <Text style={styles.statTitle}>Completed Jobs</Text>
              <Text style={styles.statValue}>{completedJobsCount}</Text>
            </TouchableOpacity>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Total Revenue</Text>
              <Text style={styles.statValue}>₹1,50,000</Text>
            </View>
          </View>

          {/* Other content */}
          <View style={styles.activityFeed}>
            <Text style={styles.activityTitle}>Recent Activities</Text>
            <Text style={styles.activityItem}>New job request for CNC machining received.</Text>
            <Text style={styles.activityItem}>Job #1234 completed successfully.</Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity onPress={handleManageJobsPress} style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Manage Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Edit Job Types')} style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Edit Job Types</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notifications}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <Text style={styles.notificationItem}>Job #1234 is overdue!</Text>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Job Completion Trends</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart will be here</Text>
            </View>
          </View>

          <View style={styles.resources}>
            <Text style={styles.resourcesTitle}>Help & Resources</Text>
            <TouchableOpacity onPress={() => console.log('Open Documentation')}>
              <Text style={styles.resourcesLink}>View Documentation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Stellar MoldTech. All rights reserved.</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1, // Ensures it takes the full height
  },
  scrollViewContent: {
    flexGrow: 1, // Allows content to grow
    padding: 5,
    paddingTop: 15,
    marginTop: Platform.OS === 'web' ? -0 : 0,
  },
  // container: {
  //   flex: 1,
  // },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  jobItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },

  fetchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    // paddingLeft:'35%',
    textAlign: 'center'
    
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
    paddingTop:10,
    paddingLeft:20,
    paddingRight:20,
    backgroundColor: '#fff',
    borderRadius: 20,
    // alignItems: 'center',
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
    position: 'absolute',    // Make the button's position absolute
    bottom: 10,              // Set the distance from the bottom (adjust as needed)
    left: 50,                // Align it with some padding from the left
    right: 50,               // Align it with some padding from the right
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
  container: {
    flex: 1,
    flexGrow:1,
    padding: 10,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:'#111',
    justifyContent: 'space-between', // Aligns items to the left and right
    width:'100%',
    height:70,
    marginLeft:-10,
    marginTop:10,


  },
  navbarWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between', // Aligns items to the left and right

    height: 70,
    marginLeft: -10,
    marginTop: -10, // Adjust this value to move the navbar upwards
  },
  logo: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginTop: 0,
    marginRight: 15,
    marginLeft: 15,
    overflow: 'hidden',

  },
  companyName: {
    fontSize: 32,
    fontWeight: 'bold',
    right: 12,

    color: '#111',
  },
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
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
  content: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop:-24
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
    
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  statTitle: {
    fontSize: 15, // Adjusted font size
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18, // Adjusted font size
    marginTop: 3,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  activityFeed: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  activityItem: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  quickActionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notifications: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationItem: {
    fontSize: 14,
    color: '#ff0000',
    marginTop: 5,
  },
  chartContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 10,
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  resources: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resourcesLink: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});