import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ServiceDashboard } from './pages/ServiceDashboard';
import { ChaosControl } from './pages/ChaosControl';
import { FixItAgent } from './pages/FixItAgent';
import { SettingsPage } from './pages/SettingsPage';
import { DemoGuide } from './pages/DemoGuide';
import { SolutionsPage } from './pages/SolutionsPage';
import { ForgeDashboardsPage } from './pages/ForgeDashboardsPage';

export const App = () => {
  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServiceDashboard />} />
        <Route path="/chaos" element={<ChaosControl />} />
        <Route path="/fixit" element={<FixItAgent />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/demo-guide" element={<DemoGuide />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/forge-dashboards" element={<ForgeDashboardsPage />} />
      </Routes>
  );
};
