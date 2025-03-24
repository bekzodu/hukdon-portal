import React, { createContext, useState, useContext } from 'react';

const StoresContext = createContext();

export const StoresProvider = ({ children }) => {
  const [storesCache, setStoresCache] = useState({
    data: null,
    timestamp: null,
    expiryTime: 5 * 60 * 1000 // 5 minutes in milliseconds
  });

  const updateStoresCache = (newData) => {
    setStoresCache({
      data: newData,
      timestamp: Date.now(),
      expiryTime: 5 * 60 * 1000
    });
  };

  const isCacheValid = () => {
    if (!storesCache.data || !storesCache.timestamp) return false;
    return (Date.now() - storesCache.timestamp) < storesCache.expiryTime;
  };

  return (
    <StoresContext.Provider value={{ storesCache, updateStoresCache, isCacheValid }}>
      {children}
    </StoresContext.Provider>
  );
};

export const useStores = () => useContext(StoresContext);