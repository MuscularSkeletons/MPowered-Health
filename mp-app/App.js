import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ASSESSMENT_QUESTIONS } from './questions/index';
import AssessmentScreen from './assessmentScreen';

export default function HomeScreen() {

  const [currentPage, setCurrentPage] = useState('home');
  const [currentAssessmentId, setCurrentAssessmentId] = useState(null);

  // If a category is selected, render the assessment screen
  if (currentPage !== 'home') {
    return (
      <AssessmentScreen
        categoryData={ASSESSMENT_QUESTIONS[currentPage]}
        assessmentId={currentAssessmentId}
        onBack={() => setCurrentPage('home')}
      />
    );
  }
  
  // Otherwise render the homescreen
  return(
    <View style={styles.container}>
        <Text style={styles.heading}>Menu</Text>

    {/* My Pain */}
    <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentPage('My Pain')}
      >
        <Text style={styles.buttonText}>My Pain</Text>
      </TouchableOpacity>

      {/* My Movement */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentPage('My Movement')}
      >
        <Text style={styles.buttonText}>My Movement</Text>
      </TouchableOpacity>

      {/* My Personal Care */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentPage('My Personal Care')}
      >
        <Text style={styles.buttonText}>My Personal Care</Text>
      </TouchableOpacity>

      {/* My Social Health */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentPage('My Social Health')}
      >
        <Text style={styles.buttonText}>My Social Health</Text>
      </TouchableOpacity>

      {/* My Management */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCurrentPage('My Management')}
      >
        <Text style={styles.buttonText}>My Management</Text>
      </TouchableOpacity>
    </View>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center', 
    paddingHorizontal: 24,
    gap: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24, 
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 180,        
  },
  backButton: {
    backgroundColor: '#475569', 
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});