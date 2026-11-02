import React, { useState } from 'react';
import { useTheme } from '../context/useTheme';
import kasperLogoFull from '../assets/kasper_logo_full.svg';
import { kasperApi, DEFAULT_BACKEND_URL } from '../services/KasperApiClient';
import './SettingsPage.css';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [backendUrl, setBackendUrl] = useState(() => kasperApi.getBaseUrl());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveBackendUrl = (e) => {
    e.preventDefault();
    const normalized = kasperApi.setBaseUrl(backendUrl);
    setBackendUrl(normalized);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetDefault = () => {
    const normalized = kasperApi.setBaseUrl(DEFAULT_BACKEND_URL);
    setBackendUrl(normalized);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="settings-page">
      <div className="settings-content">
        <div className="settings-section">
          <h2>Aparência</h2>
          <div className="theme-selector-container">
            <div className="theme-options">
              
              <div className="theme-option" onClick={() => setTheme('light')}>
                <div className={`theme-preview light ${theme === 'light' ? 'active' : ''}`}>
                  <div className="preview-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  {theme === 'light' && (
                    <div className="checkmark">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                <span className="theme-label">Claro</span>
              </div>

              <div className="theme-option" onClick={() => setTheme('dark')}>
                <div className={`theme-preview dark ${theme === 'dark' ? 'active' : ''}`}>
                  <div className="preview-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  {theme === 'dark' && (
                    <div className="checkmark">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                <span className="theme-label">Escuro</span>
              </div>

              <div className="theme-option" onClick={() => setTheme('system')}>
                <div className={`theme-preview system ${theme === 'system' ? 'active' : ''}`}>
                  <div className="preview-inner dark-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  <div className="preview-inner light-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  {theme === 'system' && (
                    <div className="checkmark">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                <span className="theme-label">Sistema</span>
              </div>

            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Conexão com o Back-end (Porta / URL)</h2>
          <form className="backend-settings-form" onSubmit={handleSaveBackendUrl}>
            <p className="backend-settings-hint">
              Informe apenas o número da porta local (ex: <code>8080</code>) ou a URL completa da API do back-end.
            </p>
            <div className="backend-settings-row">
              <input
                type="text"
                className="backend-settings-input"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="Ex: 8080 ou http://localhost:8080"
              />
              <button type="submit" className="backend-settings-btn primary">
                {savedNotice ? 'Salvo!' : 'Salvar Porta/URL'}
              </button>
              <button
                type="button"
                className="backend-settings-btn secondary"
                onClick={handleResetDefault}
              >
                Padrão (8080)
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="settings-footer">
        <img src={kasperLogoFull} alt="Kasper" className="footer-logo" />
        <span className="app-version">v1.0.0</span>
      </div>
    </div>
  );
}
