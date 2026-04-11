import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;background:#1a4fd6;border:3px solid white;
    border-radius:50%;box-shadow:0 2px 8px rgba(26,79,214,0.5);position:relative;">
    <div style="position:absolute;inset:-6px;background:rgba(26,79,214,0.25);
    border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const makeAdvocateIcon = (isSelected) => L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;background:${isSelected ? '#1a4fd6' : 'white'};
    border:2.5px solid ${isSelected ? '#0f3296' : '#1a4fd6'};
    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    box-shadow:0 3px 12px rgba(0,0,0,${isSelected ? '0.3' : '0.15'});
    display:flex;align-items:center;justify-content:center;">
    <span style="transform:rotate(45deg);font-size:14px">⚖️</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
  }, [center]);
  return null;
}

export default function MapView({ advocates, userLocation, selectedId, onSelectAdvocate, radius = 20 }) {
  const navigate = useNavigate();
  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [22.7196, 75.8577]; // Indore

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && <MapController center={[userLocation.lat, userLocation.lng]} zoom={12} />}

      {/* User location marker */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-sm font-medium text-primary-700 py-1">📍 Your Location</div>
            </Popup>
          </Marker>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radius * 1000}
            pathOptions={{ color: '#1a4fd6', fillColor: '#1a4fd6', fillOpacity: 0.05, weight: 1, dashArray: '6' }}
          />
        </>
      )}

      {/* Advocate markers */}
      {advocates.map(adv => {
        const [lng, lat] = adv.location?.coordinates || [0, 0];
        if (!lat || !lng) return null;
        const isSelected = adv._id === selectedId;

        return (
          <Marker
            key={adv._id}
            position={[lat, lng]}
            icon={makeAdvocateIcon(isSelected)}
            eventHandlers={{ click: () => onSelectAdvocate?.(adv._id) }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup maxWidth={240} className="advocate-popup">
              <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 200 }}>
                <div className="flex gap-2.5 items-start">
                  <img
                    src={adv.image}
                    alt={adv.name}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adv.name)}&background=1a4fd6&color=fff`; }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e', lineHeight: 1.3, margin: 0 }}>{adv.name}</p>
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{adv.specialization}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                      <span style={{ color: '#e8b800', fontSize: 12 }}>★</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{adv.rating?.toFixed(1)}</span>
                      {adv.distance != null && (
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>· {adv.distance} km</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/advocate/${adv._id}`)}
                  style={{
                    marginTop: 10, width: '100%', background: '#1a4fd6', color: 'white',
                    border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 12,
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  View Profile →
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
