// Get current GPS position
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'লোকেশন পেতে সমস্যা';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'লোকেশন অনুমতি দিন';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'লোকেশন তথ্য পাওয়া যাচ্ছে না';
            break;
          case error.TIMEOUT:
            message = 'সময় শেষ, আবার চেষ্টা করুন';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

// Format distance in Bangla
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} মিটার`;
  }
  return `${km.toFixed(1)} কিলোমিটার`;
};

// Calculate distance between two coordinates (Haversine)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Save user location to localStorage
export const saveUserLocation = (location) => {
  localStorage.setItem('user_location', JSON.stringify(location));
};

// Get saved user location
export const getSavedUserLocation = () => {
  const saved = localStorage.getItem('user_location');
  return saved ? JSON.parse(saved) : null;
};
