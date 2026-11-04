import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuSearch,
  LuPlus,
  LuCopy,
  LuTrash2,
  LuEye,
  LuEyeOff,
  LuBan,
} from 'react-icons/lu';
import kasperIcon from '../assets/kasper_logo_icon_large.svg';
import { kasperApi } from '../services/KasperApiClient';
import './ApiKeysPage.css';

function formatBackendDate(dateStr) {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function maskTokenDisplay(keyObj, isVisible) {
  const fullToken = keyObj.token;
  if (fullToken) {
    if (isVisible) return fullToken;
    const prefix = fullToken.slice(0, 14);
    const suffix = fullToken.slice(-4);
    return `${prefix}${'•'.repeat(16)}${suffix}`;
  }
  return keyObj.tokenPrefix || 'edupredict_sk_••••••••••••';
}

export default function ApiKeysPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [keys, setKeys] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [justCreatedToken, setJustCreatedToken] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const fetchTokens = useCallback(async () => {
    setErrorBanner('');
    setIsLoading(true);
    try {
      const list = await kasperApi.listTokens();
      setKeys(list);
    } catch (err) {
      if (err.status === 401) {
        kasperApi.logout();
        navigate('/login');
        return;
      }
      setErrorBanner(err.message || 'Não foi possível carregar as chaves de API.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!kasperApi.isAuthenticated()) {
      navigate('/login');
      return undefined;
    }

    let isCancelled = false;
    kasperApi
      .listTokens()
      .then((list) => {
        if (!isCancelled) {
          setKeys(list);
          setErrorBanner('');
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        if (err.status === 401) {
          kasperApi.logout();
          navigate('/login');
          return;
        }
        setErrorBanner(err.message || 'Não foi possível carregar as chaves de API.');
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  const filteredKeys = keys.filter((k) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (k.name || '').toLowerCase().includes(term);
    const tokenMatch = (k.token || k.tokenPrefix || '').toLowerCase().includes(term);
    return nameMatch || tokenMatch;
  });

  const copyToClipboard = (id, textToCopy) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevokeKey = async (id) => {
    setErrorBanner('');
    try {
      const updated = await kasperApi.revokeToken(id);
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, ...updated } : k)));
    } catch (err) {
      setErrorBanner(err.message || 'Erro ao revogar a chave de API.');
    }
  };

  const handleDeleteKey = async (id) => {
    setErrorBanner('');
    try {
      await kasperApi.deleteToken(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (justCreatedToken?.id === id) {
        setJustCreatedToken(null);
      }
    } catch (err) {
      setErrorBanner(err.message || 'Erro ao excluir a chave de API.');
    }
  };

  const toggleVisibility = (id) => {
    setVisibleKeys((prev) =>
      prev.includes(id) ? prev.filter((keyId) => keyId !== id) : [...prev, id]
    );
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim() || isCreating) return;

    setIsCreating(true);
    setErrorBanner('');

    try {
      // O back-end gera o token real (edupredict_sk_...) e associa ao usuário no banco
      const created = await kasperApi.createToken(newKeyName.trim());

      const newKeyEntry = {
        id: created.id,
        name: created.name,
        token: created.token,
        tokenPrefix: `${created.token.slice(0, 24)}...`,
        active: true,
        createdAt: created.createdAt,
        expiresAt: created.expiresAt,
        lastUsedAt: null,
      };

      setKeys((prev) => [newKeyEntry, ...prev]);
      setVisibleKeys((prev) => [...prev, created.id]);
      setJustCreatedToken(newKeyEntry);
      setIsModalOpen(false);
      setNewKeyName('');
    } catch (err) {
      setErrorBanner(err.message || 'Não foi possível criar a chave no back-end.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="api-keys-container">
      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Criar nova chave de API</h2>
            <p className="modal-subtitle">
              Dê um nome para identificar sua chave e utilizá-la em suas integrações.
            </p>
            <form onSubmit={handleCreateKey}>
              <div className="modal-input-group">
                <label htmlFor="keyName">Nome da chave</label>
                <input
                  type="text"
                  id="keyName"
                  placeholder="Ex: Chave de Produção"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  maxLength={100}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-btn confirm"
                  disabled={!newKeyName.trim() || isCreating}
                >
                  {isCreating ? 'Criando chave...' : 'Criar chave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="api-keys-header">
        <h1 className="page-title">Chaves de API</h1>
        {keys.length > 0 && (
          <button
            className="create-key-btn"
            onClick={() => setIsModalOpen(true)}
            onMouseMove={handleMouseMove}
          >
            <LuPlus size={16} />
            <span>Criar chave de API</span>
          </button>
        )}
      </header>

      {errorBanner && (
        <div className="api-error-alert" role="alert">
          <span>{errorBanner}</span>
          <button type="button" onClick={fetchTokens} className="retry-inline-btn">
            Tentar novamente
          </button>
        </div>
      )}

      {justCreatedToken && (
        <div className="created-token-banner">
          <div className="created-token-info">
            <strong>Sua nova chave de API ({justCreatedToken.name})</strong>
            <span>
              Guarde essa chave com cuidado em um local seguro. Por motivos de segurança, ela não será exibida novamente por completo.
            </span>
            <code>{justCreatedToken.token}</code>
          </div>
          <div className="created-token-actions">
            <button
              type="button"
              className="create-key-btn"
              onClick={() => copyToClipboard(`banner-${justCreatedToken.id}`, justCreatedToken.token)}
            >
              <LuCopy size={14} />
              <span>
                {copiedId === `banner-${justCreatedToken.id}` ? 'Copiado!' : 'Copiar chave'}
              </span>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setJustCreatedToken(null)}
              title="Fechar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {keys.length > 0 && (
        <div className="api-keys-toolbar">
          <div className="search-bar">
            <LuSearch size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar chaves de API..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="table-container">
        {isLoading ? (
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <div className="empty-state-content">
              <p>Carregando suas chaves de API...</p>
            </div>
          </div>
        ) : keys.length > 0 ? (
          <table className="api-keys-table">
            <thead>
              <tr>
                <th>Chave</th>
                <th>Status</th>
                <th>Criado em</th>
                <th className="actions-header"></th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.length > 0 ? (
                filteredKeys.map((k) => {
                  const isVisible = visibleKeys.includes(k.id);
                  const copyableValue = k.token || k.tokenPrefix;
                  return (
                    <tr key={k.id} className={!k.active ? 'revoked-row' : ''}>
                      <td className="key-main-cell">
                        <div
                          className="key-string-wrapper"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <span className="key-value">{maskTokenDisplay(k, isVisible)}</span>
                          {k.token && (
                            <button
                              className="icon-btn"
                              onClick={() => toggleVisibility(k.id)}
                              style={{ padding: '2px', opacity: 0.6 }}
                              title={isVisible ? 'Ocultar chave' : 'Mostrar chave completa'}
                            >
                              {isVisible ? <LuEyeOff size={14} /> : <LuEye size={14} />}
                            </button>
                          )}
                        </div>
                        <div className="key-name-subtitle">{k.name}</div>
                      </td>
                      <td className="key-status-cell">
                        <span className={`status-pill ${k.active ? 'active' : 'revoked'}`}>
                          {k.active ? 'Ativa' : 'Revogada'}
                        </span>
                      </td>
                      <td className="key-date">{formatBackendDate(k.createdAt)}</td>
                      <td className="key-actions">
                        <div className="key-actions-wrapper">
                          <button
                            className={`icon-btn copy-btn ${copiedId === k.id ? 'copied' : ''}`}
                            aria-label="Copiar chave"
                            title={k.token ? 'Copiar chave' : 'Copiar identificador da chave'}
                            onClick={() => copyToClipboard(k.id, copyableValue)}
                          >
                            <LuCopy size={16} />
                            {copiedId === k.id && <span className="copy-tooltip">Copiado!</span>}
                          </button>

                          {k.active && (
                            <button
                              className="icon-btn warn"
                              aria-label="Revogar chave"
                              title="Revogar chave de API"
                              onClick={() => handleRevokeKey(k.id)}
                            >
                              <LuBan size={16} />
                            </button>
                          )}

                          <button
                            className="icon-btn danger"
                            aria-label="Excluir chave"
                            title="Excluir chave de API"
                            onClick={() => handleDeleteKey(k.id)}
                          >
                            <LuTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="empty-row">
                  <td colSpan="4" className="empty-state">
                    <div className="empty-state-content">
                      <img
                        src={kasperIcon}
                        alt="Kasper"
                        width={100}
                        height={100}
                        style={{ opacity: 0.8, marginBottom: '16px' }}
                      />
                      <h3>Não encontrou suas chaves de API?</h3>
                      <p>Nenhuma chave corresponde à sua pesquisa. Tente usar outros termos.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div
            className="empty-state"
            style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}
          >
            <div className="empty-state-content" style={{ marginTop: '40px' }}>
              <img
                src={kasperIcon}
                alt="Kasper"
                width={100}
                height={100}
                style={{ opacity: 0.8, marginBottom: '16px' }}
              />
              <h3>Não encontrou suas chaves de API?</h3>
              <p style={{ marginBottom: '24px' }}>
                Você ainda não possui chaves de API cadastradas. Crie uma nova chave abaixo para começar.
              </p>

              <button
                className="create-key-btn"
                onClick={() => setIsModalOpen(true)}
                onMouseMove={handleMouseMove}
              >
                <LuPlus size={16} />
                <span>Criar chave de API</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
