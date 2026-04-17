// CasesScreen, ClientsScreen, ProfileEditScreen, CaseDetailScreen
import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const headerStyle = { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' };

export const CasesScreen = ({ navigation }) => (
  <View style={{ flex: 1, backgroundColor: COLORS.backgroundGrey }}>
    <StatusBar barStyle="dark-content" />
    <View style={headerStyle}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={{ flex: 1, fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' }}>Today Cases</Text>
      <View style={{ width: 32 }} />
    </View>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 48 }}>⚖️</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>Cases list coming soon</Text>
    </View>
  </View>
);

export const ClientsScreen = ({ navigation }) => (
  <View style={{ flex: 1, backgroundColor: COLORS.backgroundGrey }}>
    <StatusBar barStyle="dark-content" />
    <View style={headerStyle}>
      <Text style={{ flex: 1, fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' }}>Clients</Text>
    </View>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 48 }}>👥</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>Client list coming soon</Text>
    </View>
  </View>
);

export const ProfileEditScreen = ({ navigation }) => (
  <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <StatusBar barStyle="dark-content" />
    <View style={headerStyle}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={{ flex: 1, fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' }}>Edit Profile</Text>
      <View style={{ width: 32 }} />
    </View>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 48 }}>✏️</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>Profile edit coming soon</Text>
    </View>
  </View>
);

export const CaseDetailScreen = ({ route, navigation }) => (
  <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <StatusBar barStyle="dark-content" />
    <View style={headerStyle}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={{ flex: 1, fontSize: SIZES.subtitle, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' }}>Case Detail</Text>
      <View style={{ width: 32 }} />
    </View>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 48 }}>📋</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>Case details coming soon</Text>
    </View>
  </View>
);

export default CasesScreen;
