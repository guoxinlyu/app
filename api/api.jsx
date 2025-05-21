// Stores the current user's access token (JWT)
let ACCESS_TOKEN = null;

/**
 * Sets the global access token.
 * Should be called after login to save the token for authenticated requests.
 * @param {string} token - JWT access token
 */
export function setAccessToken(token) {
  ACCESS_TOKEN = token;
}

/**
 * Logs out the current user by clearing the access token.
 */
export function logout() {
  setAccessToken(null);
}


/**
 * A helper function to make authenticated API requests.
 * Automatically includes the Authorization header and sets Content-Type to JSON.
 *
 * @param {string} path - API path (relative to /api)
 * @param {object} options - Fetch options such as method, headers, and body
 * @returns {Promise<any>} - Parsed JSON response from the server
 */
export async function fetchWithAuth(path, options = {}) {
  const token = ACCESS_TOKEN;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`https://ecocache-backend-8618.onrender.com/api${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error: ${res.status} - ${errText}`);
  }

  return res.json();
}

/**
 * Fetches the currently logged-in user's information.
 * GET /api/userinfo
 */
export async function getUserInfo() {
  return fetchWithAuth("/userinfo");
}

/**
 * Sends a discovery event for a beacon (when user finds a beacon).
 * POST /api/discover/
 * @param {string} beaconId - ID of the beacon
 */
export async function discoverBeacon(beaconId) {
  return fetchWithAuth("/discover/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ beacon_id: beaconId }),
  });
}

/**
 * Fetches details of a specific beacon.
 * GET /api/beacons/{beaconId}/
 * @param {string} beaconId - ID of the beacon
 */
export async function getBeacon(beaconId) {
  return fetchWithAuth(`/beacons/${beaconId}/`);
}

/**
 * Fetches the list of all beacon locations.
 * GET /api/beacons/
 */
export async function getBeaconLocations() {
  return fetchWithAuth("/beacons/");
}

/**
 * Gets all discoveries made by the current user.
 * GET /api/my-discoveries/
 */
export async function getMyDiscoveries() {
  return fetchWithAuth("/my-discoveries/");
}

/**
 * Uploads a profile picture to the server.
 * POST /api/upload-avatar/
 * This uses FormData — do NOT manually set Content-Type; the browser handles it.
 *
 * @param {FormData} formData - Form data containing a 'profile_picture' field
 */
export async function uploadAvatar(formData) {
  const token = ACCESS_TOKEN;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch("https://ecocache-backend-8618.onrender.com/api/upload-avatar/", {
    method: "POST",
    headers,
    body: formData, 
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload error: ${res.status} - ${errText}`);
  }

  return res.json();
}

/**
 * Updates user's profile (username, bio, and optionally profile picture).
 * PATCH /api/userinfo/
 *
 * @param {FormData} formData - FormData containing 'username', 'bio', and optionally 'profile_picture'
 * @returns {Promise<any>} - Updated user profile
 */
export async function updateProfile(formData) {
  const token = ACCESS_TOKEN;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch("https://ecocache-backend-8618.onrender.com/api/update-profile/", {
    method: "PATCH",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Profile update failed: ${res.status} - ${errText}`);
  }

  return res.json();
}



