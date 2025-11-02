"use client";
import { useEffect, useState } from 'react';
import api from '../../services/api';

const ApiDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Check environment variables
    const envInfo = {
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout
    };
    
    // Check localStorage
    const storageInfo = {
      token: typeof window !== 'undefined' ? localStorage.getItem('token') : 'N/A (SSR)',
      tokenLength: typeof window !== 'undefined' ? (localStorage.getItem('token')?.length || 0) : 0
    };
    
    setDebugInfo({ env: envInfo, storage: storageInfo });
  }, []);

  const testApiCall = async () => {
    try {
      setTestResult({ loading: true });
      const response = await api.get('/recommended-stores/list');
      setTestResult({ 
        success: true, 
        data: response.data,
        status: response.status,
        headers: response.headers
      });
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">API Debug Information</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Environment Variables:</h4>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
          {JSON.stringify(debugInfo.env, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Storage Information:</h4>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
          {JSON.stringify(debugInfo.storage, null, 2)}
        </pre>
      </div>
      
      <button 
        onClick={testApiCall}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test API Call
      </button>
      
      {testResult && (
        <div className="mt-4">
          <h4 className="font-semibold">Test Result:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiDebug;