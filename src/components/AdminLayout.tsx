/**
 * Admin Protected Layout Component
 * Minimalistic, mobile-responsive design matching frontend
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAdminAuthStore } from "@/store/authStore";
import { 
	LayoutDashboard, 
	Users, 
	UserCheck, 
	Building2, 
	Briefcase, 
	FileText, 
	UserCog 
} from "lucide-react";

interface AdminLayoutProps {
	children: React.ReactNode;
	requiredPermission?: string;
}

export default function AdminLayout({
	children,
	requiredPermission,
}: AdminLayoutProps) {
	const router = useRouter();
	const { user, isAuthenticated, isLoading, checkAuth, hasPermission, logout } =
		useAdminAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
		}
	}, [isLoading, isAuthenticated, router]);

	// Check admin status
	useEffect(() => {
		if (!isLoading && isAuthenticated && user) {
			if (user.userType !== "admin" && user.userType !== "super_admin") {
				logout().then(() => {
					router.replace("/login?error=permission_denied");
				});
			}
		}
	}, [isLoading, isAuthenticated, user, logout, router]);

	// Check permission
	useEffect(() => {
		if (!isLoading && isAuthenticated && requiredPermission) {
			if (!hasPermission(requiredPermission)) {
				router.replace("/unauthorized");
			}
		}
	}, [isLoading, isAuthenticated, requiredPermission, hasPermission, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2563EB]"></div>
					<p className="text-[#64748B] mt-4 text-sm">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated || !user || (user.userType !== "admin" && user.userType !== "super_admin")) {
		return null;
	}


	const navItems = [
		{ href: "/", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/users", label: "Users", icon: Users },
		{ href: "/kyc", label: "KYC Queue", icon: UserCheck },
		{ href: "/employers", label: "Employers", icon: Building2 },
		{ href: "/jobs", label: "Jobs", icon: Briefcase },
		{ href: "/audit-logs", label: "Audit Logs", icon: FileText },
		// Only show Admin Management for super_admin
		...(user.userType === "super_admin"
			? [{ href: "/admin-management", label: "Admin Management", icon: UserCog }]
			: []),
	];

	return (
		<div className="min-h-screen bg-[#F8FAFC]">
			{/* Admin Header */}
			<header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-14 sm:h-16">
						<div className="flex items-center">
							<div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center mr-3">
								<svg
									className="w-5 h-5 text-white"
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
							<span className="text-[#0F172A] font-semibold hidden sm:inline">Taraqqi Admin</span>
							<span className="text-[#0F172A] font-semibold sm:hidden">Admin</span>
						</div>

						<div className="flex items-center space-x-2 sm:space-x-4">
							<span className="text-[#475569] text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
								{user.email || user.phone}
							</span>
							<button
								onClick={() => logout()}
								className="px-2 sm:px-3 py-1.5 text-sm text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</header>

			<div className="flex">
				{/* Sidebar - Hidden on mobile */}
				<aside className="w-64 bg-white border-r border-[#E2E8F0] min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] hidden md:block">
					<nav className="p-4 space-y-1">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition ${
									router.pathname === item.href
										? "bg-blue-50 text-[#2563EB]"
										: "text-[#475569] hover:bg-[#F8FAFC]"
								}`}
							>
								<item.icon className="w-5 h-5 mr-3" />
								{item.label}
							</Link>
						))}
					</nav>
				</aside>

				{/* Mobile Bottom Nav */}
				<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] md:hidden z-50">
					<div className="flex justify-around py-2">
						{navItems.slice(0, 4).map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`flex flex-col items-center px-3 py-1 text-xs ${
									router.pathname === item.href
										? "text-[#2563EB]"
										: "text-[#64748B]"
								}`}
							>
								<item.icon className="w-5 h-5 mb-0.5" />
								<span>{item.label.split(" ")[0]}</span>
							</Link>
						))}
					</div>
				</nav>

				{/* Main Content */}
				<main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">{children}</main>
			</div>
		</div>
	);
}
