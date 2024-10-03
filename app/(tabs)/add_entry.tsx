import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, Platform, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Ensure this points to your Firebase setup
// import { query, where } from 'firebase/firestore'; // Add the 'where' import
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Required for web styling
import { format } from 'date-fns'; // To format the date



export default function AddEntry() {
    const navbarStyle = Platform.OS === 'web' ? styles.navbarWeb : styles.navbar;

  const [formData, setFormData] = useState({

    company: '',
    gst: '',
    city: '',
    thirdParty: '',
    thirdPartyGST: '',
    thirdPartyCity: '',
    name: '',
    email: '',
    phone: '',
    jobType: '',
    description: '',
    purchaseAmount: '',
    saleAmount: '',
    profit:'',
    status:'',
    note:'',
    serialNumber:0,
    completionDate: null, // Add field for completion date


  });

  const [selectedStatus, setSelectedStatus] = useState(''); // Default selected status

  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [queryData, setQueryData] = useState([]); // To store fetched data
  const [showQueryModal, setShowQueryModal] = useState(false); // Modal to display fetched data
  const [fetchPopVisible, setFetchPopVisible] = useState(false); // Secondary modal for Yes/No
  const [selectedData, setSelectedData] = useState(null); // Store the selected data from query
  const [showDatePicker, setShowDatePicker] = useState(false); // For controlling the date picker



  const handleChange = (name: any, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleStatusToggle = async (status: any) => {
    setSelectedStatus(status);
  
    // Update formData with the new status
    setFormData({
      ...formData,
      status: status, // Store selected status in form data
    });
  
    // Logic for handling status changes
    if (status === 'completed') {
      setShowDatePicker(true); // Show date picker for completed status
    } else if (status === 'inProgress') {
      setShowDatePicker(false);
      setFormData({ ...formData, completionDate: null }); // Clear the completion date for inProgress status
  
      // Now, let's update the status to 'inProgress' in Firebase
      try {
        const querySnapshot = await getDocs(
          query(collection(db, 'queries'), where('serialNumber', '==', formData.serialNumber))
        );
  
        if (!querySnapshot.empty) {
          // Get the document reference and update its status field to 'inProgress'
          const docRef = querySnapshot.docs[0].ref;
  
          await updateDoc(docRef, {
            status: 'inProgress',
          });
  
          alert('Status updated to inProgress!');
        } else {
          alert('No matching document found with the given serial number.');
        }
      } catch (error) {
        console.error('Error updating status: ', error);
        alert('Error updating the status in Firebase.');
      }
    }
  };
  
  const handleDateChange = (_event: any, selectedDate: null) => {
    const currentDate = selectedDate || formData.completionDate;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({
      ...formData,
      completionDate: currentDate,
    });
  };
  const handleWebDateChange = (date: any) => {
    setFormData({
      ...formData,
      completionDate: date,
    });
  };
  useEffect(() => {
    const purchaseAmount = parseFloat(formData.purchaseAmount) || 0; // Parse and default to 0 if empty
    const saleAmount = parseFloat(formData.saleAmount) || 0; // Parse and default to 0 if empty
    const profit = saleAmount - purchaseAmount; // Calculate profit

    setFormData((prevData) => ({
        ...prevData,
        profit: profit.toFixed(2), // Set profit to 2 decimal places
    }));
}, [formData.purchaseAmount, formData.saleAmount]);


  const formattedDate = formData.completionDate
  ? format(formData.completionDate, 'dd/MM/yyyy')
  : 'Select Date';
  const handleSubmit = async () => {
    try {
        // Validate form data
        const requiredFields = [
            'company',
            'thirdParty',
            'thirdPartyCity',
            'thirdPartyGST',
            'name',
            'email',
            'phone',
            'city',
            'jobType',
            'description',
            'purchaseAmount',
            'saleAmount',
            'gst',
        ];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            setAlertMessage('Please fill all the details!');
            setModalVisible(true);
            return;
        }

        // Check if a matching serial number exists in the queries collection
        const querySnapshot = await getDocs(
            query(collection(db, 'queries'), where('serialNumber', '==', formData.serialNumber))
        );

        let mergedData = { ...formData, status: formData.status || 'inProgress', }; // Start with the form data

        if (!querySnapshot.empty) {
            // If a document with the serial number exists, merge the data
            const queryData = querySnapshot.docs[0].data();
            mergedData = { ...queryData, ...formData, }; // Merge query data with form data
        }

        // Add merged data to Firestore (adminentries collection)
        await addDoc(collection(db, 'adminentries'), mergedData , );

        // Show success message
        alert('Entry added successfully!');

        

        // Clear form
        setFormData({
            company: '',
            thirdParty: '',
            thirdPartyCity: '',
            thirdPartyGST: '',
            name: '',
            email: '',
            phone: '',
            city: '',
            jobType: '',
            description: '',
            purchaseAmount: '',
            saleAmount: '',
            profit:'',
            gst: '',
            status: '',
            note: '',
            serialNumber: 0,
            completionDate: null, // Clear completion date after submission

        });
    } catch (error) {
        console.error('Error adding document: ', error);
        setAlertMessage('Error submitting your entry. Please try again.');
        setModalVisible(true);
    }
};


  // Fetch data from Firestore queries collection based on serialNumber
  const handleFetchData = async () => {
    try {
      // Create a Firestore query to fetch only the documents with a serialNumber
      const q = query(collection(db, 'queries'), 
      where('serialNumber', '!=', null)); // '!=' ensures non-null serialNumbers
  
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());
  
      // Sort data based on serialNumber in ascending order (if needed)
      const sortedData:any = data.sort((a, b) => b.serialNumber - a.serialNumber);
  
      setQueryData(sortedData); // Set fetched and sorted data
      setShowQueryModal(true); // Show modal with fetched data
    } catch (error) {
      console.error('Error fetching queries: ', error);
    }
  };
  // Handle click on data block and show fetchPop modal
  const handleDataBlockClick = (item: any) => {
    setSelectedData(item); // Set the selected data
    setFetchPopVisible(true); // Show the fetchPop modal
  };

  // Handle "Yes" click in fetchPop
  const handleYes = () => {
    if (selectedData) {
      // Fill formData with selected data
      setFormData({
        serialNumber: selectedData.serialNumber || '',
        company: selectedData.company || '',
        thirdParty: selectedData.thirdParty || '',
        thirdPartyCity: selectedData.thirdPartyCity || '',
        thirdPartyGST: selectedData.thirdPartyGST || '',
        name: selectedData.name || '',
        email: selectedData.email || '',
        phone: selectedData.phone || '',
        city: selectedData.city || '',
        jobType: selectedData.jobType || '',
        description: selectedData.description || '',
        purchaseAmount: selectedData.purchaseAmount || '',
        saleAmount: selectedData.saleAmount || '',
        profit:selectedData.profit || '',
        gst: selectedData.gst || '',
        status: selectedData.status || '',
        note: selectedData.note || '',
        completionDate: selectedData.completionDate || '',

        // serialNumber: selectedData.serialNumber || '',
      });
    }
    setFetchPopVisible(false); // Close fetchPop modal after Yes
    setShowQueryModal(false); // Close fetchPop modal after Yes
  };
  

  return (
    <LinearGradient colors={['#93a5cf','#e4efe9']} style={styles.container}>
    {/* Admin Navbar with Logo and Company Name */}
    <View style={navbarStyle}>
      <Image
        source={require('../../assets/images/sm.jpg')}
        style={styles.logo}
        resizeMode="cover"
      />
      <Text style={styles.companyName}>Stellar MoldTech</Text>
    </View>

        <View style={styles.headerContainer}>
  <Text style={styles.title}>Add Entry</Text>
  <TouchableOpacity onPress={handleFetchData} style={styles.newButton}>
    <Text style={styles.fetchButtonText}>Fetch Data</Text>
  </TouchableOpacity>
</View>


<ScrollView contentContainerStyle={styles.scrollViewContent}>


        <TextInput
          style={styles.input}
          placeholder="Serial Number"
          value={formData.serialNumber}
          onChangeText={(value) => handleChange('serialNumber', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Customer Company Name"
          value={formData.company}
          onChangeText={(value) => handleChange('company', value)}
        />
          <TextInput
            style={styles.input}
            placeholder="GST Number"
            value={formData.gst}
            onChangeText={(value) => handleChange('gst', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={(value) => handleChange('city', value)}
          />
        <TextInput
          style={styles.input}
          placeholder="Third Party Company Name"
          value={formData.thirdParty}
          onChangeText={(value) => handleChange('thirdParty', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Third Party GST Number"
          value={formData.thirdPartyGST}
          onChangeText={(value) => handleChange('thirdPartyGST', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Third Party City Name"
          value={formData.thirdPartyCity}
          onChangeText={(value) => handleChange('thirdPartyCity', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Customer Person Name"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Job Type"
          value={formData.jobType}
          onChangeText={(value) => handleChange('jobType', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Job Description"
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
        />
                <Text style={styles.amount}>Purchase Amount:</Text>

        <TextInput
        
          style={styles.input}
          placeholder="Purchase Amount"
          value={formData.purchaseAmount}
          onChangeText={(value) => handleChange('purchaseAmount', value)}
          keyboardType="numeric"
        />
        <Text style={styles.amount}>Sale Amount:</Text>
        <TextInput
          style={styles.input}
          placeholder="Sale Amount"
          value={formData.saleAmount}
          onChangeText={(value) => handleChange('saleAmount', value)}
          keyboardType="numeric"
        />
        <Text style={styles.amount}>Profit Amount:</Text>
        <TextInput
            style={styles.input}
            placeholder="Profit Amount"
            value={formData.profit}
            editable={false} // Make this field read-only
        />

{/* Toggle for Job Status */}
<View style={styles.toggleContainer}>
        <Text style={styles.status}>Job Status:</Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedStatus === 'inProgress' ? styles.selectedInProgress : styles.unselected,
          ]}
          onPress={() => handleStatusToggle('inProgress')}
        >
          <Text style={styles.toggleText}>In Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedStatus === 'completed' ? styles.selectedCompleted : styles.unselected,
          ]}
          onPress={() => handleStatusToggle('completed')}
        >
          <Text style={[styles.toggleText, selectedStatus === 'completed' ? styles.selectedCompletedtext : null]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker if job is completed */}
      {selectedStatus === 'completed' && (
        <View style={styles.datePickerContainer}>
          <Text style={styles.status}>Date:</Text>
          
          {/* For mobile (native date picker) */}
          {Platform.OS !== 'web' ? (
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formattedDate}</Text>
            </TouchableOpacity>
          ) : (
            /* For web (react-datepicker) */
            <DatePicker
              selected={formData.completionDate}
              onChange={handleWebDateChange}
              dateFormat="dd/MM/yyyy" // Set format for web
              placeholderText="Select Date"
              className="webDatePicker" // Add custom styles if needed
            />
          )}
          
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={formData.completionDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Note"
        value={formData.note}
        onChangeText={(value) => handleChange('note', value)}
      />

        <Button title="Submit Entry" onPress={handleSubmit} />

        {/* Custom Alert Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setAlertMessage(''); // Reset message when modal closes
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{alertMessage}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
{/* Fetch data modal */}
<Modal animationType="slide" transparent={true} visible={showQueryModal} onRequestClose={() => setShowQueryModal(false)}>
          <View style={styles.fetchOverlay}>
            <View style={styles.fetchContent}>
              <Text style={styles.fetchTitle}>Recent Data</Text>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {queryData.map((item, index) => (
                  <TouchableOpacity key={index} onPress={() => handleDataBlockClick(item)} style={styles.dataBlock}>
                    <Text style={styles.fetchText}>Sr. No: {item.serialNumber}</Text>
                    <Text style={styles.fetchText}>Company: {item.company}</Text>
                    <Text style={styles.fetchText}>City: {item.city}</Text>
                    <Text style={styles.fetchText}>Job Type: {item.jobType}</Text>
                    <Text style={styles.fetchText}>Time: {item.submissionTime}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowQueryModal(false)} style={styles.fetchButton}>
                <Text style={styles.fetchButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

{/* Secondary fetchPop modal */}
<Modal animationType="slide" transparent={true} visible={fetchPopVisible} onRequestClose={() => setFetchPopVisible(false)}>
  <View style={styles.yesnoOverlay}>
    <View style={styles.yesnoContent}>
      <Text style={styles.yesnoText}>Do you want to add the details in the fields?</Text>
      <View style={styles.yesnobuttonContainer}>
        <TouchableOpacity onPress={handleYes} style={styles.yesnobgg}>
          <Text style={styles.yesnoText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFetchPopVisible(false)} style={styles.yesnobgr}>
          <Text style={styles.yesnoText}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


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
        paddingTop: 10,
        marginTop: Platform.OS === 'web' ? -0 : 0,
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
        width:'107%',
        height:70,
        marginLeft:-10,
        marginTop:10,
    
    
      },
      navbarWeb: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '107%',
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
        marginTop: 0,
    
        color: '#111',
      },
      headerContainer: {
        flexDirection: 'row',
        flexWrap:'wrap',
        justifyContent: 'space-between', // Aligns items to the sides
        alignItems: 'center', // Centers items vertically
        width: '100%',
        marginTop: -5, // Adjust spacing as needed

      },
      
      newButton: {
        backgroundColor: 'green',
        marginRight: 10,

        borderRadius: 20,
        padding: 10,
      },
      
      
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'center',
    // marginTop:-10

  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '70%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,

  },
  modalText: {
    color: '#111',
    textAlign: 'center',
    fontSize: 18,
    marginTop:-5
  },
  // Styles for the form and toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 13,
    marginTop: -4,
  },
  toggleButton: {
    padding: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    width: '30%',
    alignItems: 'center',
    
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedInProgress: {
    backgroundColor: 'red',
  },
  selectedCompleted: {
    backgroundColor: 'green',
  },
  selectedCompletedtext: {
    color: '#fff'  ,
    fontSize: 16,
    fontWeight: 'bold',

},
  unselected: {
    backgroundColor: 'transparent', // Transparent background by default
  },

  status:{
    fontSize: 20,
    marginTop:4,
    fontWeight: '500',
  },
  amount:{
    fontSize: 17,
    marginTop:-6,
    fontWeight: '500',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateInput: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
    flex: 1,
  },
  dateText: {
    fontSize: 14,
  },
  webDatePicker: {

    // Optional custom styles for the web date picker
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
  marginBottom: 10,
  padding: 10,
  // paddingLeft: 0,
  backgroundColor: '#007BFF',
  borderRadius: 8,
  width: '100%',
  alignItems: 'center',
},
fetchButtonText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},

yesnoOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
yesnoContent: {
  width: '80%',
  padding: 20,
  backgroundColor: '#fff',
  borderRadius: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5,
},
yesnoText: {
  color: '#111',
  textAlign: 'center',
  fontSize: 18,
  marginBottom: 10,
},
yesnobuttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingLeft:30,
  paddingRight:30,
  height:55,
  width: '100%', // Full width for the button container
  // marginBottom:20,
},
yesnobgr: {
  backgroundColor: 'red',
  padding: 10,
  borderRadius: 10,
  flex: 1,
  marginLeft: 20, // Add space to the right of the red button
  alignItems: 'center',
  
},
yesnobgg: {
  backgroundColor: 'green',
  padding: 10,
  borderRadius: 10,
  flex: 1,
  marginRight: 20, // Add space to the right of the red button

  alignItems: 'center',
},

});
