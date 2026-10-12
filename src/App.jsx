// CARELOOP - Main Application Entry Point
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CareContinuityMap } from './components/CareContinuityMap';
import { DashboardPage } from './pages/DashboardPage';
import { PatientListPage } from './pages/PatientListPage';
import { PatientDetailsPage } from './pages/PatientDetailsPage';
import { CareGapsPage } from './pages/CareGapsPage';
import { TaskCenterPage } from './pages/TaskCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CsvImportPage } from './pages/CsvImportPage';
import { DemoSimulationPage } from './pages/DemoSimulationPage';
import { SettingsPage } from './pages/SettingsPage';
import { Sidebar, NotificationToast } from './components/shared/Navigation';

function AppContent() {
  const { user } = useApp();
  // Set default page to the new beautiful 'landing' home page inspired by user reference
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedPatientId, setSelectedPatientId] = useState('P-1001');

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentPage('map'); // Route straight into Care Continuity Map for that patient!
  };

  const renderPage = () => {
    if (currentPage === 'patient-details' && selectedPatientId) {
      return (
        <PatientDetailsPage
          patientId={selectedPatientId}
          onBack={() => { setCurrentPage('patients'); }}
        />
      );
    }

    switch (currentPage) {
      case 'landing':
        return (
          <HomePage
            onExploreApp={handleNavigate}
            onSelectPatient={handleSelectPatient}
          />
        );
      case 'map':
        return (
          <CareContinuityMap
            initialPatientId={selectedPatientId}
            onPatientChange={(id) => setSelectedPatientId(id)}
          />
        );
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} onSelectPatient={handleSelectPatient} />;
      case 'patients':
        return <PatientListPage onNavigate={handleNavigate} onSelectPatient={handleSelectPatient} />;
      case 'gaps':
        return <CareGapsPage onSelectPatient={handleSelectPatient} />;
      case 'tasks':
        return <TaskCenterPage onSelectPatient={handleSelectPatient} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'import':
        return <CsvImportPage />;
      case 'demo':
        return <DemoSimulationPage onSelectPatient={handleSelectPatient} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <HomePage
            onExploreApp={handleNavigate}
            onSelectPatient={handleSelectPatient}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfcff]">
      {currentPage !== 'landing' && (
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0 bg-[#fbfcff]">
        {renderPage()}
      </main>
      <NotificationToast />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
