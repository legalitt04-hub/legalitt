import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens will be imported here
import RegisterScreen from '../screens/advocate/RegisterScreen';
import DocumentUploadScreen from '../screens/advocate/DocumentUploadScreen';
import PendingApprovalScreen from '../screens/advocate/PendingApprovalScreen';
import LoginScreen from '../screens/advocate/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AdvocateStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="AdvocateLogin" component={LoginScreen} />
      <Stack.Screen name="AdvocateRegister" component={RegisterScreen} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
    </Stack.Navigator>
  );
}
