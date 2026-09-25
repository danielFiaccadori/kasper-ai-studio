import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LuPanelLeft, LuLogOut, LuKey, LuActivity, LuSettings } from 'react-icons/lu';
import kasperLogo from './assets/kasper_ai_studio.svg';
import './App.css';

import ApiKeysPage from './pages/ApiKeysPage';
import LoginPage from './pages/LoginPage';

// Componentes das páginas
function UsagePage() {
  return (
    <div>
      <h2 className="page-title">Uso</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Acompanhe o consumo da sua conta e métricas.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h1 className="page-title">Configurações</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Suas preferências e opções estarão aqui em breve.</p>
    </div>
  );
}

function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <LuPanelLeft size={16} />
        </button>
        <div className="sidebar-header">
          <img src={kasperLogo} alt="Kasper AI Studio Logo" className="sidebar-logo" />
        </div>
        {/* Conteúdo da barra lateral */}
        <div className="sidebar-content">
          <nav className="nav-menu">
            <NavLink to="/keys" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <LuKey size={16} className="nav-icon" />
              <span className="nav-label">Chaves de API</span>
            </NavLink>
            <NavLink to="/usage" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <LuActivity size={16} className="nav-icon" />
              <span className="nav-label">Uso</span>
            </NavLink>
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="profile-info">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="profile-pic" />
            <span className="profile-name">Daniel</span>
          </div>
          <div className="footer-actions" style={{ display: 'flex', gap: '4px' }}>
            <button className="logout-btn settings-btn" onClick={() => navigate('/settings')} aria-label="Configurações">
              <LuSettings size={18} />
            </button>
            <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
              <LuLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/keys" replace />} />
            <Route path="/keys" element={<ApiKeysPage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </MainLayout>
      } />
    </Routes>
  );
}

export default App;
