/**
 * Admin API Client
 * Axios instance with email/password auth (aligned with frontend)
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

// Token storage (in-memory for security)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
	accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request interceptor - add auth token
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor - unwrap API payload and handle token refresh
api.interceptors.response.use(
	(response) => {
		// Unwrap { status, message, payload } so components use response.data directly
		if (
			response.config.responseType !== "blob" &&
			response.data &&
			typeof response.data === "object" &&
			"payload" in response.data &&
			response.data.payload !== undefined
		) {
			response.data = response.data.payload;
		}
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// If 401 and not already retried, try to refresh token
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const response = await api.post("/auth/refresh");
				const payload = response.data?.payload ?? response.data;
				const newToken = payload?.accessToken;

				if (newToken) {
					setAccessToken(newToken);
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				setAccessToken(null);
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
			}
		}

		return Promise.reject(error);
	}
);

// ============================================
// Types
// ============================================

export interface AdminUser {
	id: string;
	uuid: string;
	name: string | null;
	phone: string;
	email: string | null;
	userType: "admin";
	permissions: string[];
}

export interface LoginParams {
	email: string;
	password: string;
}

export interface AuthResponse {
	accessToken: string;
	expiresIn: number;
	user: AdminUser;
}

// ============================================
// Auth API
// ============================================

export const authApi = {
	// Email/password login
	login: async (params: LoginParams): Promise<{ payload: AuthResponse }> => {
		const response = await api.post("/auth/login", params);
		const data = response.data?.payload ?? response.data;
		const token = data?.accessToken;
		if (token) {
			setAccessToken(token);
		}
		return { payload: data };
	},

	// Get current user (response interceptor unwraps to { user, roles, permissions, ... })
	getMe: async () => {
		const response = await api.get("/auth/me");
		return response.data;
	},

	// Logout
	logout: async () => {
		const response = await api.delete("/auth/logout");
		setAccessToken(null);
		return response.data;
	},

	// Refresh token (response.data is unwrapped payload)
	refresh: async () => {
		const response = await api.post("/auth/refresh");
		const data = response.data?.payload ?? response.data;
		const newToken = data?.accessToken;
		if (newToken) {
			setAccessToken(newToken);
		}
		return response.data;
	},
};

export default api;
