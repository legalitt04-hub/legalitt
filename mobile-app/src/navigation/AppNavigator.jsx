import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';

// Auth screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';

// Client screens
import HomeScreen from '../screens/client/HomeScreen';
import SearchScreen from '../screens/client/SearchScreen';
import MapScreen from '../screens/client/MapScreen';
import AdvocateProfileScreen from '../screens/client/AdvocateProfileScreen';
import BookingScreen from '../screens/client/BookingScreen';
import PaymentScreen from '../screens/client/PaymentScreen';
import PaymentSuccessScreen from '../screens/client/PaymentSuccessScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import AIAssistantScreen from '../screens/client/AIAssistantScreen';
import FIRDraftScreen from '../screens/client/FIRDraftScreen';
import ProfileScreen from '../screens/client/ProfileScreen';
import FilterScreen from '../screens/client/FilterScreen';
import MyBookingsScreen from '../screens/client/MyBookingsScreen';

// Advocate screens
import AdvocateDashboardScreen from '../screens/advocate/DashboardScreen';
import AdvocateCasesScreen from '../screens/advocate/CasesScreen';
import CaseRequestsScreen from '../screens/advocate/CaseRequestsScreen';
import CaseDetailScreen from '../screens/advocate/CaseDetailScreen';
import EarningsScreen from '../screens/advocate/EarningsScreen';
import AdvocateProfileEditScreen from '../screens/advocate/ProfileEditScreen';
import AdvocateClientsScreen from '../screens/advocate/ClientsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = { headerShown: false, animation: 'slide_from_right' };

// ─── Client Bottom Tabs ───────────────────────────────────────────────────────
const ClientTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Map: focused ? 'location' : 'location-outline',
          AI: focused ? 'sparkles' : 'sparkles-outline',
          Profile: focused ? 'briefcase' : 'briefcase-outline',
        };
        return (
          <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
            <Ionicons name={icons[route.name]} size={focused ? 22 : 20} color={focused ? '#fff' : COLORS.navInactive} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="AI" component={AIAssistantScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─── Advocate Bottom Tabs ─────────────────────────────────────────────────────
const AdvocateTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarIcon: ({ focused }) => {
        const icons = {
          Dashboard: focused ? 'home' : 'home-outline',
          Cases: focused ? 'scale' : 'scale-outline',
          Clients: focused ? 'people' : 'people-outline',
          Earnings: focused ? 'wallet' : 'wallet-outline',
        };
        return (
          <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
            <Ionicons name={icons[route.name]} size={focused ? 22 : 20} color={focused ? '#fff' : COLORS.navInactive} />
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={AdvocateDashboardScreen} />
    <Tab.Screen name="Cases" component={AdvocateCasesScreen} />
    <Tab.Screen name="Clients" component={AdvocateClientsScreen} />
    <Tab.Screen name="Earnings" component={EarningsScreen} />
  </Tab.Navigator>
);

// ─── Root Navigator ───────────────────────────────────────────────────────────
const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        // Auth flow
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="LoginRegister" component={LoginRegisterScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        </>
      ) : user?.role === 'advocate' ? (
        // Advocate flow
        <>
          <Stack.Screen name="AdvocateMain" component={AdvocateTabs} />
          <Stack.Screen name="CaseRequests" component={CaseRequestsScreen} />
          <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ProfileEdit" component={AdvocateProfileEditScreen} />
        </>
      ) : (
        // Client flow
        <>
          <Stack.Screen name="ClientMain" component={ClientTabs} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Filter" component={FilterScreen} />
          <Stack.Screen name="AdvocateProfile" component={AdvocateProfileScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="FIRDraft" component={FIRDraftScreen} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  tabBar: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 24, right: 24, height: 64,
    borderRadius: 32, backgroundColor: '#fff',
    borderTopWidth: 0, paddingBottom: 0,
    ...SHADOWS.lg,
  },
  tabIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: COLORS.primary },
});

export default AppNavigator;
