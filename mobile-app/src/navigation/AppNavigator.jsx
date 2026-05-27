// navigation/AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// AUTH SCREENS
import SplashScreen from '../screens/auth/SplashScreen';
import LogoScreen from '../screens/auth/LogoScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// CLIENT SCREENS
import HomeScreen from '../screens/client/HomeScreen';
import SearchScreen from '../screens/client/SearchScreen';
import MapScreen from '../screens/client/MapScreen';
import AIAssistantScreen from '../screens/client/AIAssistantScreen';
import AdvocateProfileScreen from '../screens/client/AdvocateProfileScreen';
import FilterScreen from '../screens/client/FilterScreen';
import ProfileScreen from '../screens/client/ProfileScreen';
import PaymentScreen from '../screens/client/PaymentScreen';
import PaymentSuccessScreen from '../screens/client/PaymentSuccessScreen';
import MyBookingsScreen from '../screens/client/MyBookingsScreen';

// SHARED SCREENS
import ChatScreen from '../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// CLIENT BOTTOM TABS - 4 TABS WITH OPTIMIZED MAP
const ClientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Map' }}
      />
      <Tab.Screen 
        name="AI" 
        component={AIAssistantScreen}
        options={{ title: 'AI Assistant' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// MAIN APP NAVIGATOR
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {/* AUTH FLOW */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Logo" component={LogoScreen} />
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="LoginRegister" component={LoginRegisterScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />

        {/* CLIENT MAIN (4 Bottom Tabs - MAP RE-ENABLED) */}
        <Stack.Screen name="ClientMain" component={ClientTabs} />

        {/* CLIENT SCREENS */}
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="AdvocateProfile" component={AdvocateProfileScreen} />
        <Stack.Screen name="Filter" component={FilterScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
