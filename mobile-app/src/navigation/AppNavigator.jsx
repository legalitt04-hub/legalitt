// navigation/AppNavigator.jsx - PRODUCTION READY WITH TOKEN VALIDATION & REFRESH
import AuthLoadingScreen from './AuthLoadingScreen';
import SearchFilterScreen from '../screens/client/SearchFilterScreen';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import OfflineBanner from '../components/common/OfflineBanner';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator, Text, StatusBar, Platform } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';

// AUTH SCREENS
import SplashScreen from '../screens/auth/SplashScreen';
import LegalittIntroScreen from '../screens/auth/LegalittIntroScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginRegisterScreen from '../screens/auth/LoginRegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import TermsAcceptanceScreen from '../screens/auth/TermsAcceptanceScreen';

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
import BookingScreen from '../screens/client/BookingScreen';
import FIRTypeSelector from '../screens/client/FIRTypeSelector';
import FIRFormScreen from '../screens/client/FIRFormScreen';
import FIRPreviewScreen from '../screens/client/FIRPreviewScreen';
import AILegalNoticeScreen from '../screens/client/AILegalNoticeScreen';
import MyDraftsScreen from '../screens/client/MyDraftsScreen';
import ProfileEditScreen from '../screens/client/ProfileEditScreen';
import SavedAdvocatesScreen from '../screens/client/SavedAdvocatesScreen';
import SettingsScreen from '../screens/client/SettingsScreen';
import PropertyResearchLandingScreen from '../screens/client/PropertyResearchLandingScreen';
import PropertyResearchFormScreen from '../screens/client/PropertyResearchFormScreen';
import PropertyResearchReviewScreen from '../screens/client/PropertyResearchReviewScreen';
import PropertyResearchPaymentScreen from '../screens/client/PropertyResearchPaymentScreen';
import PropertyResearchSuccessScreen from '../screens/client/PropertyResearchSuccessScreen';
import PropertyResearchTrackScreen from '../screens/client/PropertyResearchTrackScreen';
import PropertyResearchChecklistScreen from '../screens/client/PropertyResearchChecklistScreen';
import PropertyResearchLockScreen from '../screens/client/PropertyResearchLockScreen';

// LEGAL ADVICE CONSULTATION SCREENS
import LegalAdviceLandingScreen from '../screens/client/LegalAdviceLandingScreen';
import LegalMatterScreen from '../screens/client/LegalMatterScreen';
import ConsultationDetailsScreen from '../screens/client/ConsultationDetailsScreen';
import ReviewPaymentScreen from '../screens/client/ReviewPaymentScreen';
import ConsultationScheduledScreen from '../screens/client/ConsultationScheduledScreen';
import TrackConsultationScreen from '../screens/client/TrackConsultationScreen';
import ConsultationCompletedScreen from '../screens/client/ConsultationCompletedScreen';

// SHARED SCREENS
import ChatScreen from '../screens/shared/ChatScreen';
import ChatListScreen from '../screens/shared/ChatListScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import PrivacyPolicyScreen from '../screens/shared/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/shared/TermsConditionsScreen';
import DataDeletionScreen from '../screens/shared/DataDeletionScreen';

// ADVOCATE SCREENS
import AdvocateStack from './AdvocateStack';
import AdvocateDashboardScreen from '../screens/advocate/DashboardScreen';
import CaseRequestsScreen from '../screens/advocate/CaseRequestsScreen';
import EarningsScreen from '../screens/advocate/EarningsScreen';
import DocumentUploadScreen from '../screens/advocate/DocumentUploadScreen';
import PendingApprovalScreen from '../screens/advocate/PendingApprovalScreen';
import { CasesScreen, ClientsScreen, CaseDetailScreen, ProfileEditScreen as AdvocateProfileEditScreen } from '../screens/advocate';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TOKEN_KEY = 'authToken';
const REFRESH_KEY = 'refreshToken';
const BASE_URL = Constants.expoConfig?.extra?.API_URL;

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
          height: 70,
          paddingBottom: 16,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          backgroundColor: '#FFFFFF',
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

// ADVOCATE BOTTOM TABS - 4 TABS FOR PRACTICE MANAGEMENT
const AdvocateTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TodayCases') {
            iconName = focused ? 'scale' : 'scale-outline';
          } else if (route.name === 'Requests') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 70,
          paddingBottom: 16,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdvocateDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="TodayCases" 
        component={CasesScreen}
        options={{ title: 'Today Cases' }}
      />
      <Tab.Screen 
        name="Requests" 
        component={CaseRequestsScreen}
        options={{ title: 'Requests' }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen}
        options={{ title: 'Earnings' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, user, isRestoring, consentAccepted } = useAuth();
  const [splashFinished, setSplashFinished] = useState(false);

  // ─── SYNCHRONIZED SPLASH ANIMATION GATE ─────────────────────────────────
  // Render LegalittIntroScreen until the logo reveal animation completion event fires.
  // Prevents Home screen or Auth screens from appearing while animation is running.
  if (!splashFinished) {
    return (
      <View style={{ flex: 1, backgroundColor: '#07080A' }}>
        <LegalittIntroScreen
          onAnimationComplete={() => {
            setSplashFinished(true);
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 400 }}>
          {!consentAccepted ? (
            // ─── CONSENT GATE FLOW (UNACCEPTED) ────────────────────────
            <>
              <Stack.Screen name="TermsAcceptance" component={TermsAcceptanceScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
            </>
          ) : !isAuthenticated ? (
            // ─── AUTHENTICATION FLOW (UNAUTHENTICATED) ───────────────────
            <>
              <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="LoginRegister" component={LoginRegisterScreen} />
              <Stack.Screen name="OTP" component={OTPScreen} />
              <Stack.Screen name="AdvocateFlow" component={AdvocateStack} />
              <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />
              {/* Policy screens reachable from the login/register checkbox links */}
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
            </>
          ) : user?.role === 'advocate' ? (
            // ─── ADVOCATE PRACTICE MANAGEMENT FLOW (AUTHENTICATED) ────────
            <>
              <Stack.Screen name="AdvocateMain" component={AdvocateTabs} />
              <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} />
              <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
              <Stack.Screen name="Cases" component={CasesScreen} />
              <Stack.Screen name="CaseRequests" component={CaseRequestsScreen} />
              <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
              <Stack.Screen name="Clients" component={ClientsScreen} />
              <Stack.Screen name="AdvocateProfileEdit" component={AdvocateProfileEditScreen} />
              <Stack.Screen name="ChatList" component={ChatListScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
              <Stack.Screen name="DataDeletion" component={DataDeletionScreen} />
            </>
          ) : (
            // ─── CLIENT EXPERIENCE FLOW (AUTHENTICATED) ───────────────────
            <>
              <Stack.Screen name="ClientMain" component={ClientTabs} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="AdvocateProfile" component={AdvocateProfileScreen} />
              <Stack.Screen name="Filter" component={FilterScreen} />
              <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />
              <Stack.Screen name="Booking" component={BookingScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
              <Stack.Screen name="ChatList" component={ChatListScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
              <Stack.Screen name="FIRTypeSelector" component={FIRTypeSelector} />
              <Stack.Screen name="FIRForm" component={FIRFormScreen} />
              <Stack.Screen name="FIRPreview" component={FIRPreviewScreen} />
              <Stack.Screen name="AILegalNotice" component={AILegalNoticeScreen} />
              <Stack.Screen name="MyDrafts" component={MyDraftsScreen} />
              <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
              <Stack.Screen name="PropertyResearchLanding" component={PropertyResearchLandingScreen} />
              <Stack.Screen name="PropertyResearchForm" component={PropertyResearchFormScreen} />
              <Stack.Screen name="PropertyResearchConfirm" component={PropertyResearchReviewScreen} />
              <Stack.Screen name="PropertyResearchPayment" component={PropertyResearchPaymentScreen} />
              <Stack.Screen name="PropertyResearchSuccess" component={PropertyResearchSuccessScreen} />
              <Stack.Screen name="PropertyResearchTrack" component={PropertyResearchTrackScreen} />
              <Stack.Screen name="PropertyResearchChecklist" component={PropertyResearchChecklistScreen} />
              <Stack.Screen name="PropertyResearchLock" component={PropertyResearchLockScreen} />

              {/* LEGAL ADVICE CONSULTATION FLOW */}
              <Stack.Screen name="LegalAdviceLanding" component={LegalAdviceLandingScreen} />
              <Stack.Screen name="LegalMatter" component={LegalMatterScreen} />
              <Stack.Screen name="ConsultationDetails" component={ConsultationDetailsScreen} />
              <Stack.Screen name="ReviewPayment" component={ReviewPaymentScreen} />
              <Stack.Screen name="ConsultationScheduled" component={ConsultationScheduledScreen} />
              <Stack.Screen name="TrackConsultation" component={TrackConsultationScreen} />
              <Stack.Screen name="ConsultationCompleted" component={ConsultationCompletedScreen} />

              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen 
                name="SavedAdvocates" 
                component={SavedAdvocatesScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
              <Stack.Screen name="DataDeletion" component={DataDeletionScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default AppNavigator;
