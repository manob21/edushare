import React, { createContext, useContext, useMemo } from 'react';
import { resourcesApi } from '../services/resourcesApi';

const ResourcesCtx = createContext(null);

export function ResourcesProvider({ children }) {
  const value = useMemo(() => ({ api: resourcesApi }), []);
  return <ResourcesCtx.Provider value={value}>{children}</ResourcesCtx.Provider>;
}

export function useResources() {
  const ctx = useContext(ResourcesCtx);
  if (!ctx) throw new Error('useResources must be used within ResourcesProvider');
  return ctx;
}