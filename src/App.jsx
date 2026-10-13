// CARELOOP - Main Application Entry Point
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CareContinuityMap } from './components/CareContinuityMap';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
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
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedPatientId, setSelectedPatientId] = useState('P-1001');

  // When logging in as Rahul Sharma (PATIENT role), route directly to the Patient Dashboard
  useEffect(() => {
    if (user?.role === 'PATIENT') {
      setCurrentPage('patient-dashboard');
    } else if (user) {
      setCurrentPage('landing');
    }
  }, [user]);

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentPage('map');
  };

  // Patient Dashboard has its own dedicated Left Sidebar & Top Bar layout
  if (currentPage === 'patient-dashboard' || currentPage === 'dashboard') {
    return (
      <>
        <PatientDashboardPage onBackToLanding={() => setCurrentPage('landing')} />
        <NotificationToast />
      </>
    );
  }

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
