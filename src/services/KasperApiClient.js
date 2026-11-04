export const DEFAULT_BACKEND_HOST = 'http://52.67.241.122';
export const DEFAULT_BACKEND_PORT = '8080';
export const DEFAULT_BACKEND_URL = `${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;

const STORAGE_KEYS = {
  BACKEND_URL: 'kasper_backend_url',
  JWT_TOKEN: 'kasper_jwt_token',
  USER_DATA: 'kasper_user_data',
  CREATED_TOKENS_CACHE: 'kasper_created_tokens_cache',
};

export class KasperApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'KasperApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Classe responsável por toda a comunicação do Front-end com o Back-end (Kasper / EduPredict API).
 *
 * - Autenticação (/api/auth/register, /api/auth/login)
 * - Gerenciamento de API Tokens (/api/tokens) -> Requer JWT
 * - Previsões de Machine Learning (/api/v1/predictions) -> Requer API Token (edupredict_sk_...)
 */
export class KasperApiClient {
  constructor(defaultBaseUrl = DEFAULT_BACKEND_URL) {
    this.defaultBaseUrl = defaultBaseUrl;
  }

  /**
   * Normaliza uma porta (ex: "8080") ou URL completa (ex: "http://localhost:8080")
   */
  normalizeUrlOrPort(input) {
    const trimmed = String(input || '').trim();
    if (!trimmed) {
      return this.defaultBaseUrl;
    }

    if (/^\d+$/.test(trimmed)) {
      return `${DEFAULT_BACKEND_HOST}:${trimmed}`;
    }

    if (!/^https?:\/\//i.test(trimmed)) {
      return `http://${trimmed.replace(/\/+$/, '')}`;
    }

    return trimmed.replace(/\/+$/, '');
  }

  /**
   * Retorna a URL base configurada para o back-end (ex: "http://localhost:8080")
   */
  getBaseUrl() {
    return this.defaultBaseUrl;
  }

  /**
   * Altera a porta ou URL completa do back-end e persiste no navegador
   */
  setBaseUrl(urlOrPort) {
    const normalized = this.normalizeUrlOrPort(urlOrPort);
    localStorage.setItem(STORAGE_KEYS.BACKEND_URL, normalized);
    window.dispatchEvent(new CustomEvent('kasper:backend-url-changed', { detail: normalized }));
    return normalized;
  }

  /**
   * Retorna apenas a porta atual se for localhost, ou a URL completa caso seja outro domínio
   */
  getPortOrUrl() {
    const baseUrl = this.getBaseUrl();
    try {
      const parsed = new URL(baseUrl);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
      }
      return baseUrl;
    } catch {
      return baseUrl;
    }
  }

  // =========================================================================
  // SESSÃO & JWT
  // =========================================================================

  getJwtToken() {
    return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  }

  getUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return Boolean(this.getJwtToken());
  }

  setSession(authResponse) {
    if (authResponse?.token) {
      localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, authResponse.token);
    }
    const user = {
      userId: authResponse?.userId,
      name: authResponse?.name,
      email: authResponse?.email,
      expiresIn: authResponse?.expiresIn,
    };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Cache local opcional para manter o rawToken (edupredict_sk_...) visível/copiável
  // após o POST /api/tokens (já que o GET /api/tokens retorna apenas o tokenPrefix)
  getCachedRawTokens() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CREATED_TOKENS_CACHE);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveCreatedRawToken(tokenId, rawToken) {
    if (!tokenId || !rawToken) return;
    const map = this.getCachedRawTokens();
    map[String(tokenId)] = rawToken;
    localStorage.setItem(STORAGE_KEYS.CREATED_TOKENS_CACHE, JSON.stringify(map));
  }

  removeCachedRawToken(tokenId) {
    if (!tokenId) return;
    const map = this.getCachedRawTokens();
    delete map[String(tokenId)];
    localStorage.setItem(STORAGE_KEYS.CREATED_TOKENS_CACHE, JSON.stringify(map));
  }

  // =========================================================================
  // CLIENTE HTTP INTERNO
  // =========================================================================

  async request(endpoint, { method = 'GET', body = null, bearerToken = null, headers = {} } = {}) {
    const targetBaseUrl = this.getBaseUrl();
    const isDevServer = Boolean(import.meta.env?.DEV);

    // Em modo dev (Vite), usa o proxy relativo (/api/...) enviando o destino no header X-Kasper-Backend-Url
    // para evitar bloqueios de CORS sem precisar alterar o back-end Spring Boot.
    const requestUrl = isDevServer ? endpoint : `${targetBaseUrl}${endpoint}`;

    const requestHeaders = {
      Accept: 'application/json',
      ...headers,
    };

    if (isDevServer) {
      requestHeaders['X-Kasper-Backend-Url'] = targetBaseUrl;
    }

    if (body !== null && body !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    if (bearerToken) {
      requestHeaders.Authorization = `Bearer ${bearerToken}`;
    }

    let response;
    try {
      response = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: body !== null && body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      throw new KasperApiError(
        'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
        0,
        networkError
      );
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    } else {
      const text = await response.text();
      payload = text ? { message: text } : null;
    }

    if (!response.ok) {
      let errorMessage = payload?.message || payload?.error;

      if (response.status === 401) {
        errorMessage = 'E-mail ou senha incorretos. Por favor, verifique seus dados.';
      } else if (response.status === 403) {
        errorMessage = 'Você não possui permissão para acessar este recurso.';
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        errorMessage = 'Nosso serviço está temporariamente indisponível. Tente novamente em alguns instantes.';
      } else if (!errorMessage) {
        errorMessage = 'Ocorreu um erro inesperado. Tente novamente em instantes.';
      }

      throw new KasperApiError(errorMessage, response.status, payload);
    }

    return payload;
  }

  // =========================================================================
  // 1. AUTENTICAÇÃO (/api/auth)
  // =========================================================================

  /**
   * Cadastra um novo usuário no back-end.
   * POST /api/auth/register
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<{ id: string, name: string, email: string }>}
   */
  async register({ name, email, password }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: {
        name: String(name || '').trim(),
        email: String(email || '').trim().toLowerCase(),
        password,
      },
    });
  }

  /**
   * Autentica o usuário e armazena o JWT retornado pelo back-end.
   * POST /api/auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ userId: string, name: string, email: string, token: string, tokenType: string, expiresIn: number }>}
   */
  async login({ email, password }) {
    const authData = await this.request('/api/auth/login', {
      method: 'POST',
      body: {
        email: String(email || '').trim().toLowerCase(),
        password,
      },
    });

    this.setSession(authData);
    return authData;
  }

  /**
   * Realiza o cadastro e em seguida autentica automaticamente o usuário para obter o JWT.
   * @param {{ name: string, email: string, password: string }} data
   */
  async registerAndLogin({ name, email, password }) {
    await this.register({ name, email, password });
    return this.login({ email, password });
  }

  /**
   * Encerra a sessão local removendo o JWT.
   */
  logout() {
    this.clearSession();
  }

  // =========================================================================
  // 2. API TOKENS (/api/tokens) - Necessitam JWT
  // =========================================================================

  requireJwt() {
    const jwt = this.getJwtToken();
    if (!jwt) {
      throw new KasperApiError('Sessão expirada. Faça login novamente.', 401);
    }
    return jwt;
  }

  /**
   * Solicita ao back-end a geração de um novo API Token (edupredict_sk_...).
   * POST /api/tokens
   * @param {string} name Nome de identificação do token
   * @returns {Promise<{ id: string, name: string, token: string, createdAt: string, expiresAt: string }>}
   */
  async createToken(name) {
    const jwt = this.requireJwt();
    const created = await this.request('/api/tokens', {
      method: 'POST',
      bearerToken: jwt,
      body: { name: String(name || '').trim() },
    });

    if (created?.id && created?.token) {
      this.saveCreatedRawToken(created.id, created.token);
    }

    return created;
  }

  /**
   * Lista todos os API Tokens do usuário autenticado salvos no back-end.
   * GET /api/tokens
   * @returns {Promise<Array<{ id: string, name: string, tokenPrefix: string, token: string | null, active: boolean, createdAt: string, lastUsedAt: string | null, expiresAt: string }>>}
   */
  async listTokens() {
    const jwt = this.requireJwt();
    const tokens = await this.request('/api/tokens', {
      method: 'GET',
      bearerToken: jwt,
    });

    const cachedRawTokens = this.getCachedRawTokens();
    return (Array.isArray(tokens) ? tokens : []).map((item) => ({
      ...item,
      token: cachedRawTokens[String(item.id)] || null,
    }));
  }

  /**
   * Revoga (desativa) um API Token existente no back-end.
   * PATCH /api/tokens/{id}/revoke
   * @param {string} id UUID do token
   * @returns {Promise<{ id: string, name: string, tokenPrefix: string, active: boolean, createdAt: string, lastUsedAt: string | null, expiresAt: string }>}
   */
  async revokeToken(id) {
    const jwt = this.requireJwt();
    const updated = await this.request(`/api/tokens/${id}/revoke`, {
      method: 'PATCH',
      bearerToken: jwt,
    });

    const cachedRawTokens = this.getCachedRawTokens();
    return {
      ...updated,
      token: cachedRawTokens[String(id)] || null,
    };
  }

  /**
   * Exclui permanentemente um API Token no back-end.
   * DELETE /api/tokens/{id}
   * @param {string} id UUID do token
   * @returns {Promise<void>}
   */
  async deleteToken(id) {
    const jwt = this.requireJwt();
    await this.request(`/api/tokens/${id}`, {
      method: 'DELETE',
      bearerToken: jwt,
    });
    this.removeCachedRawToken(id);
  }

  // =========================================================================
  // 3. MACHINE LEARNING (/api/v1/predictions) - Necessita API Token
  // =========================================================================

  /**
   * Gera previsão de evasão escolar enviando o API Token (edupredict_sk_...) no header Authorization.
   * POST /api/v1/predictions
   *
   * @param {{ studentId: string, features: Record<string, any> }} payload
   * @param {string} apiToken Token gerado pelo back-end (edupredict_sk_...)
   * @returns {Promise<{ studentId: string, dropoutProbability: number, dropoutPrediction: boolean, riskLevel: string, modelVersion: string }>}
   */
  async predict({ studentId, features }, apiToken) {
    const cleanToken = String(apiToken || '').trim();
    if (!cleanToken) {
      throw new KasperApiError(
        'É necessário informar um API Token válido (edupredict_sk_...) para gerar previsões.',
        401
      );
    }

    return this.request('/api/v1/predictions', {
      method: 'POST',
      bearerToken: cleanToken,
      body: {
        studentId: String(studentId || '').trim(),
        features: features || {},
      },
    });
  }
}

export const kasperApi = new KasperApiClient();
export default kasperApi;

