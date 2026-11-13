import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { LuPanelLeft, LuLogOut, LuKey, LuSettings, LuUser } from 'react-icons/lu';
import kasperLogo from './assets/kasper_ai_studio.svg';
import './App.css';

import ApiKeysPage from './pages/ApiKeysPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import { kasperApi } from './services/KasperApiClient';



function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    thumbHeight: 40,
    thumbTop: 0
  });
  const [isScrolling, setIsScrolling] = useState(false);
  const [isTrackHovered, setIsTrackHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const mainRef = useRef(null);
  const hideTimerRef = useRef(null);
  const dragStartRef = useRef({ y: 0, scrollTop: 0 });
  const navigate = useNavigate();
  const currentUser = kasperApi.getUser();
  const displayName = currentUser?.name || 'Usuário';

  const updateScrollbar = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 1) {
      setScrollState((prev) => (prev.hasOverflow ? { ...prev, hasOverflow: false } : prev));
      return;
    }
    const thumbHeight = Math.max(40, (clientHeight / scrollHeight) * clientHeight);
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = (scrollTop / maxScroll) * maxThumbTop;
    setScrollState({ hasOverflow: true, thumbHeight, thumbTop });
  }, []);

  const triggerScrollVisibility = useCallback(() => {
    setIsScrolling(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 900);
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    updateScrollbar();

    const handleScroll = () => {
      updateScrollbar();
      triggerScrollVisibility();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [children, updateScrollbar, triggerScrollVisibility]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const el = mainRef.current;
      if (!el) return;
      const { scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const maxThumbTop = clientHeight - scrollState.thumbHeight;
      if (maxThumbTop <= 0 || maxScroll <= 0) return;

      const deltaY = e.clientY - dragStartRef.current.y;
      const scrollRatio = maxScroll / maxThumbTop;
      el.scrollTop = dragStartRef.current.scrollTop + deltaY * scrollRatio;
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      triggerScrollVisibility();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, scrollState.thumbHeight, triggerScrollVisibility]);

  const handleThumbPointerDown = (e) => {
    e.preventDefault();
    const el = mainRef.current;
    if (!el) return;
    dragStartRef.current = { y: e.clientY, scrollTop: el.scrollTop };
    setIsDragging(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    kasperApi.logout();
    navigate('/login');
  };

  const showThumb = scrollState.hasOverflow && (isScrolling || isTrackHovered || isDragging);

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
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="profile-info">
            <div className="profile-avatar" aria-hidden="true">
              {displayName ? displayName.charAt(0).toUpperCase() : <LuUser size={15} />}
            </div>
            <span className="profile-name">{displayName}</span>
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
      
      <div className="main-pane">
        <main className="main-content" ref={mainRef}>
          {children}
        </main>
        <div className="scroll-bottom-vignette" aria-hidden="true" />
        {scrollState.hasOverflow && (
          <div
            className="custom-scrollbar-track"
            onMouseEnter={() => setIsTrackHovered(true)}
            onMouseLeave={() => setIsTrackHovered(false)}
            aria-hidden="true"
          >
            <div
              className="custom-scrollbar-thumb-slot"
              style={{
                height: `${scrollState.thumbHeight}px`,
                transform: `translateY(${scrollState.thumbTop}px)`
              }}
              onPointerDown={handleThumbPointerDown}
            >
              <div className={`custom-scrollbar-thumb ${showThumb ? 'visible' : ''}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <MainLayout>
          <Routes>
            <Route path="/keys" element={<ApiKeysPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </MainLayout>
      } />
    </Routes>
  );
}

export default App;
