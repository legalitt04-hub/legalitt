import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Blue GPS dot (like Google Maps) ──────────────────────
const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center;">
      <div style="
        position:absolute;
        width:40px;height:40px;
        background:rgba(13,122,95,0.15);
        border-radius:50%;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        animation:gps-pulse 2s ease-out infinite;
      "></div>
      <div style="
        width:18px;height:18px;
        background:#0d7a5f;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 8px rgba(13,122,95,0.6);
        position:relative;z-index:1;
      "></div>
    </div>`,
  iconSize:   [22, 22],
  iconAnchor: [11, 11],
});

// ── Advocate pin ──────────────────────────────────────────
const makeAdvocateIcon = (isSelected) => L.divIcon({
  className: '',
  html: `
    <div style="
      width:34px;height:34px;
      background:${isSelected ? '#0d7a5f' : 'white'};
      border:2.5px solid #0d7a5f;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 10px rgba(0,0,0,${isSelected ? '0.3' : '0.12'});
      display:flex;align-items:center;justify-content:center;
    ">
      <span style="transform:rotate(45deg);font-size:15px;">⚖️</span>
    </div>`,
  iconSize:    [34, 34],
  iconAnchor:  [17, 34],
  popupAnchor: [0, -36],
});

// ── Auto-pan when location changes ───────────────────────
function FlyToLocation({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.5 });
    }
  }, [center?.[0], center?.[1]]);
  return null;
}

export default function MapView({
  advocates      = [],
  userLocation   = null,
  selectedId     = null,
  onSelectAdvocate,
  radius         = 20,
}) {
  const navigate = useNavigate();

  // Start at Jabalpur only if we have no real location yet
  const initialCenter = [23.1815, 79.9864];

  const userCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : null;

  // Pan to selected advocate, else pan to user
  const selectedAdv = advocates.find(a => a._id === selectedId);
  const selectedCenter = selectedAdv?.location?.coordinates?.length === 2
    ? [selectedAdv.location.coordinates[1], selectedAdv.location.coordinates[0]]
    : null;

  const flyTarget = selectedCenter || userCenter;
  const flyZoom   = selectedCenter ? 14 : 13;

  return (
    <>
      {/* GPS pulse animation */}
      <style>{`
        @keyframes gps-pulse {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
        }
      `}</style>

      <MapContainer
        center={initialCenter}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fly to real location once GPS locks */}
        {flyTarget && <FlyToLocation center={flyTarget} zoom={flyZoom} />}

        {/* ── User location ── */}
        {userLocation && (
          <>
            {/* Accuracy circle — shows how precise the GPS fix is */}
            {userLocation.accuracy && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color:       '#0d7a5f',
                  fillColor:   '#0d7a5f',
                  fillOpacity: 0.12,
                  weight:      1,
                }}
              />
            )}

            {/* Search radius circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radius * 1000}
              pathOptions={{
                color:       '#0d7a5f',
                fillColor:   '#0d7a5f',
                fillOpacity: 0.04,
                weight:      1.5,
                dashArray:   '6 4',
              }}
            />

            {/* You are here dot */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
              zIndexOffset={2000}
            >
              <Popup>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '4px 0' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#0d7a5f', margin: 0 }}>
                    📍 You are here
                  </p>
                  {userLocation.accuracy && (
                    <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>
                      GPS accuracy: ±{Math.round(userLocation.accuracy)}m
                      {userLocation.accuracy < 20  && ' 🟢 Excellent'}
                      {userLocation.accuracy >= 20 && userLocation.accuracy < 100 && ' 🟡 Good'}
                      {userLocation.accuracy >= 100 && ' 🔴 Low — move outdoors'}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* ── Advocate markers ── */}
        {advocates.map(adv => {
          const coords = adv.location?.coordinates;
          if (!coords || coords.length < 2) return null;
          // GeoJSON = [lng, lat], Leaflet needs [lat, lng]
          const [lng, lat] = coords;
          if (!lat || !lng || (lat === 0 && lng === 0)) return null;

          const isSelected = adv._id === selectedId;

          return (
            <Marker
              key={adv._id}
              position={[lat, lng]}
              icon={makeAdvocateIcon(isSelected)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => onSelectAdvocate?.(adv._id) }}
            >
              <Popup maxWidth={240}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <img
                      src={adv.image}
                      alt={adv.name}
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(adv.name)}&background=0d7a5f&color=fff`; }}
                    />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', margin: 0 }}>{adv.name}</p>
                      <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{adv.specialization}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <span style={{ color: '#f5c842' }}>★</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{adv.rating?.toFixed(1)}</span>
                        {adv.distance != null && (
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>· {adv.distance} km</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: '#0d7a5f', fontWeight: 600, margin: '4px 0 0' }}>
                        ₹{adv.fees?.toLocaleString('en-IN')}/consultation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/advocate/${adv._id}`)}
                    style={{
                      marginTop: 10, width: '100%',
                      background: '#0d7a5f', color: 'white',
                      border: 'none', borderRadius: 8,
                      padding: '8px 0', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer',
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
    </>
  );
}
