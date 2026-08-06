// screens/client/MapScreen.web.jsx - Web-compatible premium visual alternative to react-native-maps
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import { advocateAPI } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle, Line, Path } from 'react-native-svg';

const INITIAL_REGION = {
  latitude: 22.7196,
  longitude: 75.8577,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const RADIUS_OPTIONS = [1, 2, 3, 4, 5];

const MapScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isWide = width >= 768;

  const [userLocation, setUserLocation] = useState(null);
  const [advocates, setAdvocates] = useState([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(route.params?.filters?.radius || 1);
  const [showRadiusControl, setShowRadiusControl] = useState(false);
  const [showListView, setShowListView] = useState(false); // Mobile view toggle
  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Sonar rotation animation
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sweepAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    sweepAnimation.start();
    return () => sweepAnimation.stop();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchAdvocatesNearby(userLocation.latitude, userLocation.longitude);
    }
  }, [searchRadius]);

  const getUserLocation = async () => {
    try {
      setLoading(true);
      // Attempt browser geolocation if available
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setUserLocation(userCoords);
            fetchAdvocatesNearby(userCoords.latitude, userCoords.longitude);
          },
          (error) => {
            console.warn('Geolocation failed, falling back to INITIAL_REGION:', error);
            const fallback = {
              latitude: INITIAL_REGION.latitude,
              longitude: INITIAL_REGION.longitude,
            };
            setUserLocation(fallback);
            fetchAdvocatesNearby(fallback.latitude, fallback.longitude);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        const fallback = {
          latitude: INITIAL_REGION.latitude,
          longitude: INITIAL_REGION.longitude,
        };
        setUserLocation(fallback);
        fetchAdvocatesNearby(fallback.latitude, fallback.longitude);
      }
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
        limit: 100, // Reasonable limit for web interface
      });

      if (response.data.success && response.data.data) {
        const transformedAdvocates = response.data.data.map((adv) => ({
          id: adv._id,
          name: adv.user?.name || 'Unknown',
          avatar: adv.user?.avatar || `https://i.pravatar.cc/150?u=${adv.user?._id || adv._id}`,
          specialization: adv.specializations?.join(' • ') || 'Legal Services',
          rating: adv.rating?.average || 0,
          consultationFee: adv.consultationFee || 500,
          distance: adv.distance || 0,
          latitude: adv.location?.coordinates?.[1] || INITIAL_REGION.latitude,
          longitude: adv.location?.coordinates?.[0] || INITIAL_REGION.longitude,
        }));
        setAdvocates(transformedAdvocates);
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

  // Radar plotting helpers
  const RADAR_RADIUS = 130;
  const RADAR_CENTER = 150;

  const getRadarCoords = (advLat, advLng) => {
    if (!userLocation) return { x: RADAR_CENTER, y: RADAR_CENTER, distance: 0 };
    const dLat = advLat - userLocation.latitude;
    const dLng = advLng - userLocation.longitude;
    const dxKm = dLng * 102.0;
    const dyKm = dLat * 111.0;
    const distance = Math.sqrt(dxKm * dxKm + dyKm * dyKm);

    const maxRadius = searchRadius || 1;
    const scale = RADAR_RADIUS / maxRadius;

    // Convert to relative coordinates in pixels centered on (150, 150)
    const px = RADAR_CENTER + dxKm * scale;
    const py = RADAR_CENTER - dyKm * scale;

    return { x: px, y: py, distance };
  };

  const plottedAdvocates = advocates
    .map((adv) => ({
      ...adv,
      coords: getRadarCoords(adv.latitude, adv.longitude),
    }))
    .filter((adv) => adv.coords.distance <= searchRadius);

  // Render list of advocate cards
  const renderAdvocateList = () => {
    if (plottedAdvocates.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No advocates found in this area.</Text>
          <Text style={styles.emptySubtext}>Try increasing the search radius.</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.listContent}>
        {plottedAdvocates.map((advocate) => {
          const isSelected = selectedAdvocate?.id === advocate.id;
          return (
            <TouchableOpacity
              key={advocate.id}
              style={[
                styles.advocateCardItem,
                isSelected && styles.advocateCardItemSelected,
              ]}
              onPress={() => setSelectedAdvocate(advocate)}
            >
              <Image source={{ uri: advocate.avatar }} style={styles.listAvatar} />
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{advocate.name}</Text>
                <Text style={styles.listSpecialization} numberOfLines={1}>
                  {advocate.specialization}
                </Text>
                <View style={styles.listStats}>
                  <View style={styles.listStat}>
                    <Ionicons name="star" size={14} color="#FCD34D" />
                    <Text style={styles.listStatText}>{advocate.rating.toFixed(1)}</Text>
                  </View>
                  <View style={styles.listStat}>
                    <Ionicons name="navigate" size={14} color="#6B7280" />
                    <Text style={styles.listStatText}>{advocate.distance.toFixed(1)} km</Text>
                  </View>
                </View>
              </View>
              <View style={styles.listPriceContainer}>
                <Text style={styles.listPrice}>₹{advocate.consultationFee}</Text>
                <Text style={styles.listPriceSub}>Fee</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderRadarScanner = () => (
    <View style={styles.radarWrapper}>
      <View style={styles.radarCard}>
        <View style={styles.radarHeader}>
          <Ionicons name="scan-circle" size={24} color={COLORS.primary} />
          <Text style={styles.radarTitle}>Interactive Radar Scanner</Text>
        </View>
        
        <View style={styles.radarContainer}>
          {/* Static SVG Grid Background */}
          <Svg width={300} height={300} style={styles.radarSvg}>
            {/* Concentric rings */}
            <SvgCircle cx={150} cy={150} r={130} fill="rgba(15, 23, 42, 0.85)" stroke={COLORS.primary} strokeWidth={1.5} />
            <SvgCircle cx={150} cy={150} r={130 * 0.8} fill="none" stroke="rgba(20, 184, 166, 0.25)" strokeWidth={1} strokeDasharray="4 4" />
            <SvgCircle cx={150} cy={150} r={130 * 0.6} fill="none" stroke="rgba(20, 184, 166, 0.25)" strokeWidth={1} strokeDasharray="4 4" />
            <SvgCircle cx={150} cy={150} r={130 * 0.4} fill="none" stroke="rgba(20, 184, 166, 0.25)" strokeWidth={1} strokeDasharray="4 4" />
            <SvgCircle cx={150} cy={150} r={130 * 0.2} fill="none" stroke="rgba(20, 184, 166, 0.25)" strokeWidth={1} strokeDasharray="4 4" />

            {/* Crosshairs */}
            <Line x1={150 - 130} y1={150} x2={150 + 130} y2={150} stroke="rgba(20, 184, 166, 0.25)" strokeWidth={1} />
            <Line x1={150} y1={150 - 130} x2={150} y2={150 + 130} stroke="rgba(20, 184, 166, 0.25)" strokeWidth={1} />
            
            {/* Central user beacon indicator */}
            <SvgCircle cx={150} cy={150} r={7} fill={COLORS.primary} stroke="#FFFFFF" strokeWidth={2} />
          </Svg>

          {/* Sweeping Sonar Overlay */}
          <Animated.View style={[styles.radarSweep, { transform: [{ rotate: spin }] }]} pointerEvents="none">
            <Svg width={300} height={300}>
              <Line x1={150} y1={150} x2={150} y2={150 - 130} stroke={COLORS.primary} strokeWidth={2.5} opacity={0.8} />
              {/* Sonar sweep wedge (30 degrees angle) */}
              <Path
                d={`M 150 150 
                    L 150 ${150 - 130} 
                    A 130 130 0 0 1 ${150 + 130 * Math.sin(Math.PI / 6)} ${150 - 130 * Math.cos(Math.PI / 6)} 
                    Z`}
                fill="rgba(20, 184, 166, 0.12)"
              />
            </Svg>
          </Animated.View>

          {/* Interactive Advocate Pins */}
          {plottedAdvocates.map((advocate) => {
            const isSelected = selectedAdvocate?.id === advocate.id;
            return (
              <TouchableOpacity
                key={advocate.id}
                style={[
                  styles.radarPin,
                  {
                    left: advocate.coords.x - 12,
                    top: advocate.coords.y - 12,
                  },
                ]}
                onPress={() => setSelectedAdvocate(advocate)}
                activeOpacity={0.8}
              >
                {/* Pulsing beacon dot */}
                <View style={[styles.pinDot, isSelected && styles.pinDotSelected]} />
                {/* Ripple effect */}
                <View style={[styles.pinRipple, isSelected && styles.pinRippleSelected]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.radarLegend}>
          <Text style={styles.legendText}>🟢 Advocates found within {searchRadius}km radius</Text>
          <Text style={styles.legendHelp}>Click pins to select and view profile details</Text>
        </View>
      </View>
    </View>
  );

  // Wide layout implementation (Desktop)
  if (isWide) {
    return (
      <View style={styles.wideContainer}>
        <View style={styles.wideSidebar}>
          {/* Header */}
          <View style={styles.wideHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.wideHeaderTitleContainer}>
              <Text style={styles.headerTitle}>Nearby Advocates</Text>
              <Text style={styles.headerSubtitle}>
                {loading ? 'Scanning...' : `${plottedAdvocates.length} advocates found`}
              </Text>
            </View>
          </View>

          {/* Radius selector */}
          <View style={styles.wideRadiusControl}>
            <Text style={styles.radiusLabel}>Search Radius:</Text>
            <View style={styles.radiusTabs}>
              {RADIUS_OPTIONS.map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusTab,
                    searchRadius === radius && styles.radiusTabActive,
                  ]}
                  onPress={() => setSearchRadius(radius)}
                >
                  <Text
                    style={[
                      styles.radiusTabText,
                      searchRadius === radius && styles.radiusTabTextActive,
                    ]}
                  >
                    {radius}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* List or Loading */}
          {loading ? (
            <View style={styles.sidebarLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Scanning advocates nearby...</Text>
            </View>
          ) : (
            renderAdvocateList()
          )}

          {/* Selected Advocate View in Sidebar */}
          {selectedAdvocate && (
            <View style={styles.sidebarSelection}>
              <TouchableOpacity
                style={styles.selectionClose}
                onPress={() => setSelectedAdvocate(null)}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.selectionBody}>
                <Image source={{ uri: selectedAdvocate.avatar }} style={styles.selectionAvatar} />
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionName}>{selectedAdvocate.name}</Text>
                  <Text style={styles.selectionSpecialization}>{selectedAdvocate.specialization}</Text>
                  <View style={styles.selectionStats}>
                    <View style={styles.stat}>
                      <Ionicons name="star" size={14} color="#FCD34D" />
                      <Text style={styles.statText}>{selectedAdvocate.rating.toFixed(1)}</Text>
                    </View>
                    <View style={styles.stat}>
                      <Ionicons name="navigate" size={14} color="#6B7280" />
                      <Text style={styles.statText}>{selectedAdvocate.distance.toFixed(1)}km away</Text>
                    </View>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.sidebarViewButton}
                onPress={() => navigation.navigate('AdvocateProfile', { id: selectedAdvocate.id })}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.viewProfileGradient}
                >
                  <Text style={styles.viewProfileText}>View Full Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.wideMain}>
          <StatusBar barStyle="dark-content" />
          {renderRadarScanner()}
        </View>
      </View>
    );
  }

  // Narrow layout implementation (Mobile Web)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { top: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Nearby Advocates</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? 'Scanning...' : `${plottedAdvocates.length} within ${searchRadius}km`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setShowListView(!showListView)}
        >
          <Ionicons name={showListView ? 'scan' : 'list'} size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Radius Control Button */}
      <TouchableOpacity
        style={[styles.radiusButton, { top: Math.max(insets.top, 16) + 60 }]}
        onPress={() => setShowRadiusControl(!showRadiusControl)}
        activeOpacity={0.9}
      >
        <Ionicons name="navigate" size={20} color={COLORS.primary} />
        <Text style={styles.radiusButtonText}>{searchRadius}km</Text>
      </TouchableOpacity>

      {/* Radius Control Dropdown */}
      {showRadiusControl && (
        <View style={[styles.radiusDropdown, { top: Math.max(insets.top, 16) + 110 }]}>
          <Text style={styles.radiusDropdownTitle}>Search Radius</Text>
          {RADIUS_OPTIONS.map((radius) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusOption,
                searchRadius === radius && styles.radiusOptionActive,
              ]}
              onPress={() => handleRadiusChange(radius)}
            >
              <Ionicons
                name="navigate"
                size={16}
                color={searchRadius === radius ? COLORS.primary : '#6B7280'}
              />
              <Text
                style={[
                  styles.radiusOptionText,
                  searchRadius === radius && styles.radiusOptionTextActive,
                ]}
              >
                {radius}km
              </Text>
              {searchRadius === radius && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.mobileMainContent}>
        {loading ? (
          <View style={styles.mobileLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Scanning area...</Text>
          </View>
        ) : showListView ? (
          <View style={styles.mobileListWrapper}>
            {renderAdvocateList()}
          </View>
        ) : (
          <View style={styles.mobileRadarWrapper}>
            {renderRadarScanner()}
          </View>
        )}
      </View>

      {/* Location Refresh Button */}
      {!showListView && (
        <TouchableOpacity
          style={[styles.locationButton, { bottom: Math.max(insets.bottom, 20) + 140 }]}
          onPress={getUserLocation}
        >
          <Ionicons name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {/* Filter Button */}
      <TouchableOpacity
        style={[styles.filterButton, { bottom: Math.max(insets.bottom, 20) + 80 }]}
        onPress={() => navigation.navigate('Filter')}
      >
        <Ionicons name="options-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Selected Advocate Sliding Card */}
      {selectedAdvocate && !showListView && (
        <Animated.View
          style={[
            styles.advocateCard,
            {
              bottom: Math.max(insets.bottom, 20),
              transform: [{ translateY: slideAnim }],
            },
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
            <Image source={{ uri: selectedAdvocate.avatar }} style={styles.advocateAvatar} />

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
            onPress={() => navigation.navigate('AdvocateProfile', { id: selectedAdvocate.id })}
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
  // Global styles
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
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
    shadowOpacity: 0.1,
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
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusButton: {
    position: 'absolute',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 90,
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  radiusDropdown: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 140,
    zIndex: 110,
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
  radiusOptionActive: {
    backgroundColor: '#F0FDFA',
  },
  radiusOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  radiusOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Mobile layout styles
  mobileMainContent: {
    flex: 1,
    paddingTop: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileRadarWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileListWrapper: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
  },
  mobileLoading: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Radar Scanner styling
  radarWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  radarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  radarContainer: {
    width: 300,
    height: 300,
    position: 'relative',
    borderRadius: 150,
    overflow: 'hidden',
  },
  radarSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  radarSweep: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: 300,
  },
  radarLegend: {
    marginTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  legendHelp: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  // Radar Pins
  radarPin: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  pinDotSelected: {
    backgroundColor: COLORS.primaryDark,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: '#FCD34D',
  },
  pinRipple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.4)',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  pinRippleSelected: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    backgroundColor: 'rgba(252, 211, 77, 0.15)',
  },

  // Floating map control buttons
  locationButton: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 80,
  },
  filterButton: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 80,
  },

  // Selected Advocate Sliding Card (Mobile Web)
  advocateCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  advocateAvatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  advocateInfo: {
    flex: 1,
  },
  advocateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  advocateSpecialization: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  advocateStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  fee: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 'auto',
  },
  viewProfileButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewProfileGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Wide layout styles (Desktop Web)
  wideContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
  },
  wideSidebar: {
    width: 380,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  wideHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wideHeaderTitleContainer: {
    flex: 1,
  },
  wideRadiusControl: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  radiusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  radiusTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },
  radiusTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  radiusTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  radiusTabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  radiusTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sidebarLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  wideMain: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Wide selection details
  sidebarSelection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAF5FF',
    position: 'relative',
  },
  selectionClose: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  selectionBody: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  selectionAvatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  selectionSpecialization: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  selectionStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  sidebarViewButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },

  // List Item layout (sidebar & mobile toggle list)
  listContent: {
    paddingVertical: 8,
  },
  advocateCardItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  advocateCardItemSelected: {
    backgroundColor: '#F0FDFA',
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  listSpecialization: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  listStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  listStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listStatText: {
    fontSize: 11,
    color: '#4B5563',
  },
  listPriceContainer: {
    alignItems: 'flex-end',
  },
  listPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listPriceSub: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  // Empty State styling
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default MapScreen;
