/**
 * Admin Management Page (SUPER_ADMIN only)
 * Superadmins can create and manage admin accounts
 */

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";
import { useAdminAuthStore } from "@/store/authStore";
import { useRouter } from "next/router";

interface AdminUser {
	id: string;
	uuid: string;
	name: string | null;
	email: string | null;
	phone: string | null;
	userType: string;
	isActive: boolean;
	createdAt: string;
	lastLoginAt: string | null;
}

export default function AdminManagementPage() {
	const router = useRouter();
	const { user } = useAdminAuthStore();
	const [admins, setAdmins] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [createForm, setCreateForm] = useState({
		email: "",
		password: "",
		name: "",
		submitting: false,
		error: "",
	});

	// Redirect if not super_admin
	useEffect(() => {
		if (user && user.userType !== "super_admin") {
			router.replace("/");
		}
	}, [user, router]);

	useEffect(() => {
		if (user?.userType === "super_admin") {
			loadAdmins();
		}
	}, [user]);

	const loadAdmins = async () => {
		setLoading(true);
		try {
			const response = await api.get("/admin/admin-users");
			setAdmins(response.data?.admins ?? []);
		} catch (err) {
			console.error("Failed to load admin users", err);
			setAdmins([]);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateAdmin = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreateForm((f) => ({ ...f, submitting: true, error: "" }));

		try {
			await api.post("/admin/admin-users", {
				email: createForm.email.trim(),
				password: createForm.password,
				name: createForm.name.trim() || undefined,
			});
			setShowCreateModal(false);
			setCreateForm({
				email: "",
				password: "",
				name: "",
				submitting: false,
				error: "",
			});
			loadAdmins();
		} catch (err: any) {
			setCreateForm((f) => ({
				...f,
				submitting: false,
				error: err.response?.data?.error || "Failed to create admin",
			}));
		}
	};

	const handleDeactivate = async (admin: AdminUser) => {
		if (!confirm(`Deactivate ${admin.name || admin.email}?`)) return;
		try {
			await api.patch(`/admin/admin-users/${admin.id}/deactivate`);
			loadAdmins();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to deactivate admin");
		}
	};

	const handleActivate = async (admin: AdminUser) => {
		if (!confirm(`Reactivate ${admin.name || admin.email}?`)) return;
		try {
			await api.patch(`/admin/admin-users/${admin.id}/activate`);
			loadAdmins();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to reactivate admin");
		}
	};

	// Only render if super_admin
	if (!user || user.userType !== "super_admin") {
		return null;
	}

	return (
		<AdminLayout>
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
							Admin Management
						</h1>
						<p className="text-[#64748B] text-sm mt-1">
							Manage admin accounts (Super Admin only)
						</p>
					</div>
					<button
						onClick={() => setShowCreateModal(true)}
						className="mt-4 sm:mt-0 px-4 py-2 bg-[#2563EB] text-white rounded-md text-sm hover:bg-[#1E40AF] flex items-center gap-2"
					>
						<span>➕</span>
						Create Admin
					</button>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto" />
					</div>
				) : admins.length > 0 ? (
					<div className="space-y-4">
						{admins.map((admin) => (
							<div
								key={admin.id}
								className={`bg-white rounded-lg p-4 sm:p-5 shadow-sm border ${
									admin.isActive ? "border-[#E2E8F0]" : "border-amber-200 bg-amber-50/50"
								}`}
							>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-medium text-[#0F172A]">
												{admin.name || admin.email || admin.phone || `Admin #${admin.id}`}
											</span>
											<span
												className={`px-2 py-0.5 text-xs rounded capitalize ${
													admin.userType === "super_admin"
														? "bg-purple-100 text-purple-700"
														: "bg-blue-100 text-blue-700"
												}`}
											>
												{admin.userType === "super_admin" ? "Super Admin" : "Admin"}
											</span>
											{!admin.isActive && (
												<span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700">
													Deactivated
												</span>
											)}
										</div>
										<p className="text-sm text-[#64748B] mt-1 truncate">
											{admin.email || admin.phone || "—"}
										</p>
										<p className="text-xs text-[#94A3B8] mt-2">
											Created {new Date(admin.createdAt).toLocaleDateString()}
											{admin.lastLoginAt &&
												` · Last login ${new Date(admin.lastLoginAt).toLocaleDateString()}`}
										</p>
									</div>
									{admin.userType !== "super_admin" && (
										<div>
											{admin.isActive ? (
												<button
													onClick={() => handleDeactivate(admin)}
													className="px-3 sm:px-4 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-md text-sm hover:bg-[#FEE2E2] border border-[#FECACA] flex-shrink-0"
												>
													Deactivate
												</button>
											) : (
												<button
													onClick={() => handleActivate(admin)}
													className="px-3 sm:px-4 py-2 bg-[#DCFCE7] text-[#16A34A] rounded-md text-sm hover:bg-[#BBF7D0] border border-[#BBF7D0] flex-shrink-0"
												>
													Reactivate
												</button>
											)}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-white rounded-lg border border-[#E2E8F0]">
						<p className="text-[#64748B]">No admin users found.</p>
					</div>
				)}

				{/* Create Admin Modal */}
				{showCreateModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
						<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
							<h2 className="text-lg font-semibold text-[#0F172A] mb-4">
								Create New Admin
							</h2>
							<form onSubmit={handleCreateAdmin} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										Email *
									</label>
									<input
										type="email"
										required
										value={createForm.email}
										onChange={(e) =>
											setCreateForm((f) => ({ ...f, email: e.target.value }))
										}
										className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
										placeholder="admin@example.com"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										Password *
									</label>
									<input
										type="password"
										required
										minLength={8}
										value={createForm.password}
										onChange={(e) =>
											setCreateForm((f) => ({ ...f, password: e.target.value }))
										}
										className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
										placeholder="Min 8 characters"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										Name (optional)
									</label>
									<input
										type="text"
										value={createForm.name}
										onChange={(e) =>
											setCreateForm((f) => ({ ...f, name: e.target.value }))
										}
										className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
										placeholder="Admin Name"
									/>
								</div>

								{createForm.error && (
									<div className="text-sm text-[#DC2626] bg-[#FEF2F2] px-3 py-2 rounded border border-[#FECACA]">
										{createForm.error}
									</div>
								)}

								<div className="flex gap-3 pt-2">
									<button
										type="button"
										onClick={() => {
											setShowCreateModal(false);
											setCreateForm({
												email: "",
												password: "",
												name: "",
												submitting: false,
												error: "",
											});
										}}
										disabled={createForm.submitting}
										className="flex-1 py-2 px-4 border border-[#E2E8F0] text-[#475569] rounded-md text-sm hover:bg-[#F8FAFC] disabled:opacity-50"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={createForm.submitting}
										className="flex-1 py-2 px-4 bg-[#2563EB] text-white rounded-md text-sm hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{createForm.submitting ? "Creating..." : "Create Admin"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
