import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import emailjs from 'emailjs-com';
import axios from 'axios';
import { doc, updateDoc, collection, getDocs, query, where  } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure the correct path to your firebase.js

const ComposeMailModal = ({ modalVisible, setModalVisible, customerName, jobType, customerEmail, customerReadStatus, customerSerialNumber }) => {
  const [status, setStatus] = useState(''); // Either 'success' or 'failure'
  const [emailBody, setEmailBody] = useState('');
  const serviceId = 'service_ytue7a4';
  const templateId = 'template_ds9vde5';
  const publicKey = '6Y74BU4B_mo0yo7Aw';

  // Dynamically generate the email body based on the status
  const composeEmailBody = () => {
    let body = `Hello ${customerName},\n\n`;
    body += `We are pleased to inform you about the status of your query with Stellar MoldTech regarding the ${jobType}.\n\n`;

    // Set status_message based on the selected status
    const statusMessage = status === 'success' 
        ? `We have successfully matched your job request! Our team is excited to work on your ${jobType} requirement, and we will proceed with the next steps to ensure timely delivery.` 
        : `Unfortunately, we couldn't find a matching solution for your ${jobType} at this time. However, our team will continue to monitor and keep you updated in case any suitable opportunities arise.`;

    body += `${statusMessage}\n\nBest regards,\nStellar MoldTech Team`;

    setEmailBody(body);
  };

  const sendEmail = async () => {


    const emailData = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: customerEmail,
        message: emailBody,
        customer_name: customerName,
        job_type: jobType,
        status_message: status === 'success' ? `We have successfully matched your job request! Our team is excited to work on your ${jobType} requirement, and we will proceed with the next steps to ensure timely delivery.` : `Unfortunately, we couldn't find a matching solution for your ${jobType} at this time. However, our team will continue to monitor and keep you updated in case any suitable opportunities arise.`,
      },
    };

    try {
      const res = await axios.post("https://api.emailjs.com/api/v1.0/email/send", emailData);
      console.log('Email sent successfully!', res.data);

      const serialNumberString = String(customerSerialNumber).trim(); // Ensure you're using customerSerialNumber
    const q = query(collection(db, 'queries'), where('serialNumber', '==', serialNumberString));
    const querySnapshot = await getDocs(q);

    // Check if we found a matching document
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref; // Get the document reference
      await updateDoc(docRef, { readStatus: 'seen' });
      console.log('Test: Read status updated to seen');
    } else {
      console.error('No matching document found for the given serial number');
    }      setModalVisible(false); // Close modal after sending
    } catch (error) {
      console.error('Failed to send email...', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    composeEmailBody(); // Generate email body whenever status changes
  }, [status]);
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          
          <Text style={styles.title}>Compose Email</Text>
          <Text style={styles.title}>{customerReadStatus}</Text>

          <Text style={styles.subtitle}>Job Type: {jobType}</Text>
          <Text style={styles.subtitle}>Customer: {customerName}</Text>
          <Text style={styles.subtitle}>Customer Mail: {customerEmail}</Text>

          <TouchableOpacity
            onPress={() => setStatus('success')}
            style={[styles.optionButton, status === 'success' && styles.selected]}
          >
            <Text style={styles.optionButtonText}>Success</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStatus('failure')}
            style={[styles.optionButton, status === 'failure' && styles.selected]}
          >
            <Text style={styles.optionButtonText}>Failure</Text>
          </TouchableOpacity>

          <Text style={styles.previewTitle}>Email Preview:</Text>
          <Text style={styles.previewText}>{emailBody}</Text>

          <TouchableOpacity onPress={sendEmail} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#0056b3',
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  previewText: {
    textAlign: 'left',
    marginTop: 10,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  sendButton: {
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default ComposeMailModal;
