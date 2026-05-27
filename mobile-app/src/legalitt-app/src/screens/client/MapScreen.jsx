// screens/client/MapScreen.jsx - FIXED: Proper radius control, smooth UI
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
  StatusBar,
} from 'react-native';
import { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
// import MapView from 'react-native-map-clustering';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { advocateAPI } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INITIAL_REGION = {
  latitude: 22.7196,
  longitude: 75.8577,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const RADIUS_OPTIONS = [1, 2, 3, 4, 5];

const MapScreen = ({ navigation, route }) => {
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState(INITIAL_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [advocates, setAdvocates] = useState([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(route.params?.filters?.radius || 1);
  const [showRadiusControl, setShowRadiusControl] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const [tracksView, setTracksView] = useState(true);

  useEffect(() => {
    getUserLocation();
  }, []);

  // Fixes Android bug where custom markers are invisible if tracksViewChanges is false initially
  useEffect(() => {
    if (advocates.length > 0) {
      setTracksView(true);
      const timer = setTimeout(() => {
        setTracksView(false);
      }, 1500); // Allow custom pin UI to render fully, then freeze it to boost performance
      return () => clearTimeout(timer);
    }
  }, [advocates]);

  useEffect(() => {
    if (userLocation) {
      fetchAdvocatesNearby(userLocation.latitude, userLocation.longitude);
    }
  }, [searchRadius]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Please enable location');
        return;
      }

      setLoading(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // 📍 SMART FALLBACK: If running on Emulator and it detects default Google HQ location,
      // force Indore, India coordinates so seeded advocates are visible.
      const isDefaultEmulatorLocation = 
        Math.abs(userCoords.latitude - 37.4220) < 0.01 && 
        Math.abs(userCoords.longitude - (-122.0841)) < 0.01;

      if (isDefaultEmulatorLocation) {
        console.log('📍 Emulator default location detected. Mocking to Indore (Advocate Hub)...');
        userCoords = {
          latitude: INITIAL_REGION.latitude,
          longitude: INITIAL_REGION.longitude,
        };
      }

      setUserLocation(userCoords);
      
      const newRegion = {
        ...userCoords,
        latitudeDelta: searchRadius / 111,
        longitudeDelta: searchRadius / 111,
      };
      
      setRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 800);
      }

      fetchAdvocatesNearby(userCoords.latitude, userCoords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      fetchAdvocatesNearby(INITIAL_REGION.latitude, INITIAL_REGION.longitude);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvocatesNearby = async (lat, lng) => {
    try {
      setLoading(true);

      const response = await advocateAPI.getNearby({
        lat,
        lng,
        radius: searchRadius,
        limit: 1000, // ✅ Increased to 1000 to maximize visible advocates without crashing.
      });

      if (response.data.success && response.data.data) {
        const transformedAdvocates = response.data.data.map(adv => ({
          id: adv._id,
          name: adv.user?.name || 'Unknown',
          avatar: adv.user?.avatar || `https://i.pravatar.cc/150?u=${adv.user?._id || adv._id}`,
          specialization: adv.specializations?.join(' • ') || 'Legal Services',
          rating: adv.rating?.average || 0,
          consultationFee: adv.consultationFee || 500,
          distance: adv.distance || 0,
          latitude: adv.location?.coordinates?.[1],
          longitude: adv.location?.coordinates?.[0],
        }));

        console.log("First 3 advocates:", transformedAdvocates.slice(0, 3).map(a => ({ id: a.id, name: a.name })));        setAdvocates(transformedAdvocates);
        console.log(`✅ Loaded ${transformedAdvocates.length} advocates within ${searchRadius}km`);
      }
    } catch (error) {
      console.error('Error fetching advocates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    setShowRadiusControl(false);
    
    if (userLocation && mapRef.current) {
      const newRegion = {
        ...userLocation,
        latitudeDelta: newRadius / 111,
        longitudeDelta: newRadius / 111,
      };
      mapRef.current.animateToRegion(newRegion, 800);
    }
  };

  const toggleRadiusControl = () => {
    setShowRadiusControl(!showRadiusControl);
  };

  useEffect(() => {
    if (selectedAdvocate) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -300,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  }, [selectedAdvocate]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        clusterColor={COLORS.primary}
        clusterTextColor="#FFFFFF"
        clusterFontFamily="System"
        radius={60}
        maxZoomLevel={20}
        minZoomLevel={5}
        extent={256}
        nodeSize={64}
      >
        {/* Radius Circle */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={searchRadius * 1000}
            strokeWidth={2}
            strokeColor={COLORS.primary}
            fillColor="rgba(20, 184, 166, 0.1)"
          />
        )}

        {/* Advocate Markers - Top 300 closest advocates rendered for butter-smooth UI & no crashes */}
        {advocates.slice(0, 300).map((advocate) => (
          <Marker
            key={advocate.id}
            coordinate={{
              latitude: advocate.latitude,
              longitude: advocate.longitude,
            }}
            tracksViewChanges={tracksView} // ✅ Fixed: allow initial rendering, then freeze to boost performance
            onPress={() => { 
              console.log('📍 Pin clicked:', advocate.id, advocate.name); 
              setSelectedAdvocate(advocate); 
              
              // Smoothly auto-zoom based on CURRENT selected radius to avoid jarring jumps
              const currentDelta = searchRadius / 111;
              mapRef.current?.animateToRegion({
                latitude: advocate.latitude - (currentDelta * 0.25), // dynamic offset so pin stays visible above bottom sheet
                longitude: advocate.longitude,
                latitudeDelta: currentDelta,
                longitudeDelta: currentDelta,
              }, 800);
            }}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { top: Math.max(insets.top, 16) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Nearby Advocates</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Loading...' : `${advocates.length} within ${searchRadius}km`}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Radius Control Button */}
      <TouchableOpacity
        style={[styles.radiusButton, { top: Math.max(insets.top, 16) + 60 }]}
        onPress={toggleRadiusControl}
        activeOpacity={0.9}
      >
        <Ionicons name="navigate" size={20} color={COLORS.primary} />
        <Text style={styles.radiusButtonText}>{searchRadius}km</Text>
      </TouchableOpacity>

      {/* ✅ FIXED: Radius Control Dropdown - Properly hides/shows */}
      {showRadiusControl && (
        <View style={[styles.radiusDropdown, { top: Math.max(insets.top, 16) + 110 }]}>
          <Text style={styles.radiusDropdownTitle}>Search Radius</Text>
          {RADIUS_OPTIONS.map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusOption,
                searchRadius === radius && styles.radiusOptionActive
              ]}
              onPress={() => handleRadiusChange(radius)}
            >
              <Ionicons 
                name="navigate" 
                size={16} 
                color={searchRadius === radius ? COLORS.primary : '#6B7280'} 
              />
              <Text style={[
                styles.radiusOptionText,
                searchRadius === radius && styles.radiusOptionTextActive
              ]}>
                {radius}km
              </Text>
              {searchRadius === radius && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* My Location Button */}
      <TouchableOpacity
        style={[styles.locationButton, { bottom: Math.max(insets.bottom, 20) + 140 }]}
        onPress={getUserLocation}
      >
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Filter Button */}
      <TouchableOpacity
        style={[styles.filterButton, { bottom: Math.max(insets.bottom, 20) + 80 }]}
        onPress={() => navigation.navigate('Filter')}
      >
        <Ionicons name="options-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && (
        <View style={[styles.loadingOverlay, { top: Math.max(insets.top, 16) + 10 }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Selected Advocate Card */}
      {selectedAdvocate && (
        <Animated.View 
          style={[
            styles.advocateCard,
            { bottom: Math.max(insets.bottom, 20), transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedAdvocate(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <Image
              source={{ uri: selectedAdvocate.avatar }}
              style={styles.advocateAvatar}
            />
            
            <View style={styles.advocateInfo}>
              <Text style={styles.advocateName} numberOfLines={1}>
                {selectedAdvocate.name}
              </Text>
              <Text style={styles.advocateSpecialization} numberOfLines={1}>
                {selectedAdvocate.specialization}
              </Text>
              
              <View style={styles.advocateStats}>
                <View style={styles.stat}>
                  <Ionicons name="star" size={14} color="#FCD34D" />
                  <Text style={styles.statText}>{selectedAdvocate.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="navigate" size={14} color="#6B7280" />
                  <Text style={styles.statText}>{selectedAdvocate.distance.toFixed(1)}km</Text>
                </View>
                <Text style={styles.fee}>₹{selectedAdvocate.consultationFee}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => { const advocateId = selectedAdvocate.id; const advocateName = selectedAdvocate.name; console.log('🔍 Opening profile:', advocateId, advocateName); navigation.navigate('AdvocateProfile', { id: advocateId }); }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.viewProfileGradient}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  headerSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  radiusButton: {
    position: 'absolute',
    top: 110,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  radiusDropdown: {
    position: 'absolute',
    top: 150,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 140,
  },
  radiusDropdownTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  radiusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  radiusOptionActive: { backgroundColor: '#F0FDFA' },
  radiusOptionText: { flex: 1, fontSize: 14, color: '#6B7280' },
  radiusOptionTextActive: { color: COLORS.primary, fontWeight: '600' },
  locationButton: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  advocateCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  closeButton: {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 32,  // Bigger
  height: 32, // Bigger
  borderRadius: 16,
  backgroundColor: '#FFFFFF',  // White background
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,  // Very high
  elevation: 10,  // Android
  shadowColor: '#000',  // iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
},
  cardContent: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  advocateAvatar: { width: 60, height: 60, borderRadius: 12 },
  advocateInfo: { flex: 1 },
  advocateName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  advocateSpecialization: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  advocateStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, fontWeight: '500', color: '#1F2937' },
  fee: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginLeft: 'auto' },
  viewProfileButton: { borderRadius: 12, overflow: 'hidden' },
  viewProfileGradient: { paddingVertical: 12, alignItems: 'center' },
  viewProfileText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

export default MapScreen;
