/**
 * User Management Page
 * List platform users (Individuals & Employers), deactivate with reason and notification
 */

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";

interface PlatformUser {
	id: string;
	uuid: string;
	name: string | null;
	email: string | null;
	phone: string | null;
	userType: string;
	verificationStatus: string;
	isActive: boolean;
	createdAt: string;
	lastLoginAt: string | null;
	profileSummary: string | null;
}

export default function UsersPage() {
	const [users, setUsers] = useState<PlatformUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [userType, setUserType] = useState<"all" | "individual" | "employer">("all");
	const [search, setSearch] = useState("");
	const [deactivateModal, setDeactivateModal] = useState<{
		user: PlatformUser;
		reason: string;
		submitting: boolean;
	} | null>(null);

	useEffect(() => {
		loadUsers();
	}, [userType]);

	const loadUsers = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (userType !== "all") params.set("userType", userType);
			if (search.trim()) params.set("search", search.trim());
			const response = await api.get(`/admin/platform-users?${params.toString()}`);
			setUsers(response.data?.users ?? []);
			setTotal(response.data?.pagination?.total ?? 0);
		} catch (err) {
			console.error("Failed to load users", err);
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		loadUsers();
	};

	const openDeactivateModal = (user: PlatformUser) => {
		setDeactivateModal({
			user,
			reason: "",
			submitting: false,
		});
	};

	const closeDeactivateModal = () => {
		if (!deactivateModal?.submitting) setDeactivateModal(null);
	};

	const handleDeactivate = async () => {
		if (!deactivateModal || deactivateModal.reason.trim().length < 10) return;
		setDeactivateModal((m) => m ? { ...m, submitting: true } : null);
		try {
			await api.patch(`/admin/platform-users/${deactivateModal.user.id}/deactivate`, {
				reason: deactivateModal.reason.trim(),
			});
			closeDeactivateModal();
			loadUsers();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to deactivate");
			setDeactivateModal((m) => m ? { ...m, submitting: false } : null);
		}
	};

	const handleActivate = async (user: PlatformUser) => {
		if (!confirm(`Reactivate ${user.name || user.email || user.id}?`)) return;
		try {
			await api.patch(`/admin/platform-users/${user.id}/activate`);
			loadUsers();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to reactivate");
		}
	};

	return (
		<AdminLayout>
			<div className="max-w-6xl mx-auto">
				<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">
					User Management
				</h1>
				<p className="text-[#64748B] text-sm mb-6">
					View and manage platform users. Deactivating sends a clear, professional
					notification with the reason you provide.
				</p>

				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="flex gap-2">
						{(["all", "individual", "employer"] as const).map((type) => (
							<button
								key={type}
								onClick={() => setUserType(type)}
								className={`px-3 sm:px-4 py-2 rounded-md capitalize text-sm ${
									userType === type
										? "bg-[#2563EB] text-white"
										: "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
								}`}
							>
								{type === "all" ? "All" : type === "individual" ? "Individuals" : "Employers"}
							</button>
						))}
					</div>
					<form onSubmit={handleSearch} className="flex-1 flex gap-2">
						<input
							type="search"
							placeholder="Search by name, email, or phone..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="flex-1 min-w-0 px-3 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
						/>
						<button
							type="submit"
							className="px-4 py-2 bg-[#2563EB] text-white rounded-md text-sm hover:bg-[#1E40AF]"
						>
							Search
						</button>
					</form>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto" />
					</div>
				) : users.length > 0 ? (
					<div className="space-y-4">
						<p className="text-sm text-[#64748B]">
							{total} user{total !== 1 ? "s" : ""} found
						</p>
						{users.map((user) => (
							<div
								key={user.id}
								className={`bg-white rounded-lg p-4 sm:p-5 shadow-sm border ${
									user.isActive ? "border-[#E2E8F0]" : "border-amber-200 bg-amber-50/50"
								}`}
							>
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-medium text-[#0F172A]">
												{user.name || user.email || user.phone || `User #${user.id}`}
											</span>
											<span
												className={`px-2 py-0.5 text-xs rounded capitalize ${
													user.userType === "employer"
														? "bg-blue-100 text-blue-700"
														: "bg-slate-100 text-slate-700"
												}`}
											>
												{user.userType}
											</span>
											{!user.isActive && (
												<span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700">
													Deactivated
												</span>
											)}
											<span className="px-2 py-0.5 text-xs rounded capitalize text-[#64748B]">
												{user.verificationStatus}
											</span>
										</div>
										<p className="text-sm text-[#64748B] mt-1 truncate">
											{user.email || user.phone || "—"}
										</p>
										{user.profileSummary && (
											<p className="text-sm text-[#94A3B8] mt-0.5">
												{user.userType === "employer" ? "Company: " : ""}
												{user.profileSummary}
											</p>
										)}
										<p className="text-xs text-[#94A3B8] mt-2">
											Joined {new Date(user.createdAt).toLocaleDateString()}
											{user.lastLoginAt &&
												` · Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`}
										</p>
									</div>
									{user.isActive ? (
										<button
											onClick={() => openDeactivateModal(user)}
											className="px-3 sm:px-4 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-md text-sm hover:bg-[#FEE2E2] border border-[#FECACA] flex-shrink-0"
										>
											Deactivate
										</button>
									) : (
										<button
											onClick={() => handleActivate(user)}
											className="px-3 sm:px-4 py-2 bg-[#DCFCE7] text-[#16A34A] rounded-md text-sm hover:bg-[#BBF7D0] border border-[#BBF7D0] flex-shrink-0"
										>
											Reactivate
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-white rounded-lg border border-[#E2E8F0]">
						<p className="text-[#64748B]">
							{search || userType !== "all"
								? "No users match your filters."
								: "No platform users yet."}
						</p>
					</div>
				)}
			</div>

			{/* Deactivate modal */}
			{deactivateModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h2 className="text-lg font-semibold text-[#0F172A] mb-2">
							Deactivate user account
						</h2>
						<p className="text-sm text-[#64748B] mb-4">
							{deactivateModal.user.name || deactivateModal.user.email || deactivateModal.user.phone}{" "}
							({deactivateModal.user.userType}). They will receive an email with the reason below.
						</p>
						<label className="block text-sm font-medium text-[#0F172A] mb-2">
							Reason (min 10 characters) *
						</label>
						<textarea
							value={deactivateModal.reason}
							onChange={(e) =>
								setDeactivateModal((m) =>
									m ? { ...m, reason: e.target.value } : null
								)
							}
							placeholder="e.g. Inactive account per policy. Contact support to reactivate."
							rows={4}
							className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
						/>
						<div className="flex gap-3 mt-6">
							<button
								onClick={closeDeactivateModal}
								disabled={deactivateModal.submitting}
								className="flex-1 py-2 px-4 border border-[#E2E8F0] text-[#475569] rounded-md text-sm hover:bg-[#F8FAFC] disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleDeactivate}
								disabled={
									deactivateModal.submitting ||
									deactivateModal.reason.trim().length < 10
								}
								className="flex-1 py-2 px-4 bg-[#DC2626] text-white rounded-md text-sm hover:bg-[#B91C1C] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{deactivateModal.submitting ? "Deactivating..." : "Deactivate & notify"}
							</button>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
