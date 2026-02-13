/**
 * Admin Auth Store
 * Zustand store with email/password authentication (aligned with frontend)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi, setAccessToken, AdminUser } from "@/lib/api";

interface AdminAuthState {
	// State
	user: AdminUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Actions
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	clearError: () => void;
	hasPermission: (permission: string) => boolean;
}

export const useAdminAuthStore = create<AdminAuthState>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			// Login with email/password
			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null });
				try {
					const response = await authApi.login({ email, password });
					const { accessToken, user } = response.payload;

					// ADMIN or SUPER_ADMIN CHECK
					if (user.userType !== "admin" && user.userType !== "super_admin") {
						set({
							error: "Access denied. Admin account required.",
							isLoading: false,
						});
						// Logout immediately
						try {
							await authApi.logout();
						} catch {}
						throw new Error("Not an admin account");
					}

					setAccessToken(accessToken);

					set({
						user: user as AdminUser,
						isAuthenticated: true,
						isLoading: false,
					});
				} catch (error: any) {
					if (error.message === "Not an admin account") {
						throw error;
					}
					const message =
						error.response?.data?.error ||
						error.message ||
						"Login failed";
					set({ error: message, isLoading: false });
					throw error;
				}
			},

			// Logout
			logout: async () => {
				set({ isLoading: true });
				try {
					await authApi.logout();
				} catch {}
				setAccessToken(null);
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			// Check auth on load
			checkAuth: async () => {
				const state = get();
				if (state.isLoading) return;

				set({ isLoading: true });
				try {
					await authApi.refresh();
					const response = await authApi.getMe();
					const user = response?.user ?? response?.payload?.user;

					// Verify admin or super_admin
					if (user && (user.userType === "admin" || user.userType === "super_admin")) {
						set({
							user,
							isAuthenticated: true,
							isLoading: false,
						});
					} else {
						// Not admin, clear
						set({
							user: null,
							isAuthenticated: false,
							isLoading: false,
						});
					}
				} catch {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					});
				}
			},

			// Clear error
			clearError: () => set({ error: null }),

			// Check permission
			hasPermission: (permission: string) => {
				const { user } = get();
				return user?.permissions?.includes(permission) ?? false;
			},
		}),
		{
			name: "admin-auth-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
