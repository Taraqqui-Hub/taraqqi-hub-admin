/**
 * Admin Login Page
 * Email/Password login - Minimalistic, mobile-first design
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { useAdminAuthStore } from "@/store/authStore";

export default function AdminLoginPage() {
	const router = useRouter();
	const {
		login,
		isLoading,
		error,
		clearError,
		isAuthenticated,
	} = useAdminAuthStore();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Check for error in URL
	useEffect(() => {
		if (router.query.error === "permission_denied") {
			// Error will be shown via query param
		}
	}, [router.query]);

	// Redirect if authenticated
	useEffect(() => {
		if (isAuthenticated) {
			router.replace("/");
		}
	}, [isAuthenticated, router]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		clearError();
		try {
			await login(email, password);
			// Redirect happens via useEffect
		} catch {}
	};

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Admin Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-14 h-14 bg-[#2563EB] rounded-xl mb-4">
						<svg
							className="w-7 h-7 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
					<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Admin Panel</h1>
					<p className="text-[#475569] mt-1 text-sm sm:text-base">Taraqqi Hub Administration</p>
				</div>

				{/* Login Card */}
				<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm flex items-start">
							<svg
								className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							<span>{error}</span>
						</div>
					)}

					{router.query.error === "permission_denied" && !error && (
						<div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6 text-sm">
							Your session has expired or you don&apos;t have permission. Please
							login again.
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-6">
							Sign In
						</h2>

						<div className="mb-4">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-[#0F172A] mb-2"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="admin@example.com"
								className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
								required
							/>
						</div>

						<div className="mb-6">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-[#0F172A] mb-2"
							>
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition pr-12"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading || !email || !password}
							className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin h-5 w-5 mr-2"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
											fill="none"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										/>
									</svg>
									Signing in...
								</span>
							) : (
								"Sign In"
							)}
						</button>
					</form>

					<div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center">
						<p className="text-xs text-[#64748B]">
							This is a restricted area. Only authorized administrators can access
							this panel.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
