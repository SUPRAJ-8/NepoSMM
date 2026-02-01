const getBackendUrl = () => {
    // If we're in the browser and on localhost, use the local backend
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000';
    }
    // Otherwise use the environment variable or fallback to production API
    return (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.neposmm.com').replace(/\/$/, '');
};

export const BACKEND_URL = getBackendUrl();
export const API_URL = `${BACKEND_URL}/api`;
