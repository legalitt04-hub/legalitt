// MapScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { advocateAPI } from '../../services/api';
import { COLORS } from '../../constants/theme';

const MapScreen = ({ navigation }) => {
  const [region, setRegion] = useState({ latitude: 23.1815, longitude: 79.9864, latitudeDelta: 0.15, longitudeDelta: 0.15 });
  const [advocates, setAdvocates] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.15, longitudeDelta: 0.15 });
        const { data } = await advocateAPI.getNearby({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        setAdvocates(data.data || []);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} region={region} showsUserLocation showsMyLocationButton>
        {advocates.map((a) => (
          <Marker
            key={a._id}
            coordinate={{ latitude: a.location?.coordinates?.[1] || 23.18, longitude: a.location?.coordinates?.[0] || 79.98 }}
            title={a.user?.name}
            description={a.specializations?.join(', ')}
            onPress={() => navigation.navigate('AdvocateProfile', { advocateId: a._id })}
          />
        ))}
      </MapView>
    </View>
  );
};
export default MapScreen;
