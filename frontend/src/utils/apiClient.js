const API_URLS = [
  'http://localhost:8000',
  'https://ecommerce-8342.onrender.com'
];

let currentApiUrl = null;

const testConnection = async (url) => {
  try {
    const response = await fetch(`${url}/api/health`, { 
      method: 'GET',
      timeout: 5000 
    });
    return response.ok;
  } catch {
    return false;
  }
};

const getApiUrl = async () => {
  if (currentApiUrl) return currentApiUrl;
  
  for (const url of API_URLS) {
    if (await testConnection(url)) {
      currentApiUrl = url;
      return url;
    }
  }
  
  currentApiUrl = API_URLS[1]; // fallback to deployment
  return currentApiUrl;
};

export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = await getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
};

export default apiRequest;