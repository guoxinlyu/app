// Import the token setter to store JWT after successful login
import { setAccessToken } from "./api"; 

// Base URL for the backend API
const API_BASE = "https://ecocache-backend-8618.onrender.com/api";

/**
 * Registers a new user account.
 * Sends a POST request to /signup/ with username, email, and password.
 *
 * @param {Object} param0 - An object containing username, email, and password
 * @returns {Object} - The response data from the server (user info or tokens)
 * @throws {Error} - If registration fails, throws the first available error message
 */
export async function signUpUser({ username, email, password, dob }) {
  const res = await fetch(`${API_BASE}/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, dob }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.username?.[0] ||
      data?.password?.[0] ||
      data?.email?.[0] ||
      data?.dob?.[0] ||
      data?.detail ||
      'Registration failed'
    );
  }

  return data;
}


/**
 * Logs in an existing user and stores the access token.
 * Sends a POST request to /signin/ with username and password.
 *
 * @param {Object} param0 - An object containing username and password
 * @returns {Object} - The response data including tokens and username
 * @throws {Error} - If login fails, throws the error message from the server
 */
export async function signInUser({ username, password }) {
  const res = await fetch(`${API_BASE}/signin/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Throw the error message returned by the backend
    throw new Error(data?.detail || 'Login failed');
  }
  // Save the access token for authenticated requests
  setAccessToken(data.access);

  return {
    username,
    ...data
  };
}
