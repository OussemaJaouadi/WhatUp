export const getObjectStorageBaseUrl = (): string => {
  const url = import.meta.env.VITE_OBJECT_STORAGE_BASE_URL;
  if (!url) {
    console.warn("VITE_OBJECT_STORAGE_BASE_URL is not defined. Please check your .env file.");
    return ""; // Or throw an error, depending on desired behavior
  }
  return url;
};

export const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  if (!url) {
    console.warn("VITE_API_BASE_URL is not defined. Please check your .env file.");
    return ""; // Or throw an error, depending on desired behavior
  }
  return url;
}