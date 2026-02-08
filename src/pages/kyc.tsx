/**
 * KYC Review Queue Page
 * Approve or reject by user; reject requires a clear reason (user is notified)
 */

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";

interface KycRecord {
	id: string;
	userId: string;
	documentType: string;
	documentNumber: string;
	documentUrl: string;
	documentBackUrl?: string;
	selfieUrl?: string;
	status: string;
	rejectionReason?: string | null;
	createdAt: string;
	userName?: string | null;
	userEmail?: string | null;
	userPhone?: string | null;
	userType: string;
}

export default function KycQueuePage() {
	const [records, setRecords] = useState<KycRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("pending");
	const [rejectModal, setRejectModal] = useState<{
		record: KycRecord;
		reason: string;
		submitting: boolean;
	} | null>(null);

	useEffect(() => {
		loadRecords();
	}, [statusFilter]);

	const loadRecords = async () => {
		setLoading(true);
		try {
			const response = await api.get(`/admin/kyc?status=${statusFilter}`);
			setRecords(response.data?.records ?? []);
		} catch (err) {
			console.error("Failed to load KYC records", err);
			setRecords([]);
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (record: KycRecord) => {
		if (!confirm(`Approve verification for ${record.userEmail || record.userPhone || record.userId}? They will be notified.`)) return;
		try {
			await api.post(`/admin/kyc/${record.userId}/approve`);
			loadRecords();
		} catch (err: any) {
			alert(err.response?.data?.error || "Approval failed");
		}
	};

	const openRejectModal = (record: KycRecord) => {
		setRejectModal({ record, reason: "", submitting: false });
	};

	const closeRejectModal = () => {
		if (!rejectModal?.submitting) setRejectModal(null);
	};

	const handleReject = async () => {
		if (!rejectModal || rejectModal.reason.trim().length < 10) return;
		setRejectModal((m) => m ? { ...m, submitting: true } : null);
		try {
			await api.post(`/admin/kyc/${rejectModal.record.userId}/reject`, {
				reason: rejectModal.reason.trim(),
			});
			closeRejectModal();
			loadRecords();
		} catch (err: any) {
			alert(err.response?.data?.error || "Rejection failed");
			setRejectModal((m) => m ? { ...m, submitting: false } : null);
		}
	};

	return (
		<AdminLayout>
			<div className="max-w-6xl mx-auto">
				<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-2">KYC Review Queue</h1>
				<p className="text-[#64748B] text-sm mb-6">
					Approve or reject verification by user. Rejection sends a clear email with your reason.
				</p>

				{/* Filter */}
				<div className="mb-6 flex gap-2 overflow-x-auto pb-2">
					{["pending", "approved", "rejected"].map((status) => (
						<button
							key={status}
							onClick={() => setStatusFilter(status)}
							className={`px-3 sm:px-4 py-2 rounded-md capitalize text-sm whitespace-nowrap ${
								statusFilter === status
									? "bg-[#2563EB] text-white"
									: "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
							}`}
						>
							{status}
						</button>
					))}
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto" />
					</div>
				) : records.length > 0 ? (
					<div className="space-y-4">
						{records.map((record) => (
							<div
								key={record.id}
								className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0]"
							>
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
									<div className="flex-1 min-w-0">
										<div className="flex flex-wrap items-center gap-2 mb-2">
											<span className="text-[#0F172A] font-medium capitalize">
												{record.documentType.replace(/_/g, " ")}
											</span>
											<span
												className={`px-2 py-0.5 text-xs rounded capitalize ${
													record.status === "pending"
														? "bg-yellow-100 text-yellow-700"
														: record.status === "approved"
														? "bg-green-100 text-green-700"
														: "bg-red-100 text-red-700"
												}`}
											>
												{record.status}
											</span>
										</div>
										<p className="text-[#64748B] text-sm">
											User: {record.userName || record.userEmail || record.userPhone || record.userId} ({record.userType})
										</p>
										<p className="text-[#64748B] text-sm">
											Doc #: {record.documentNumber}
										</p>
										{record.status === "rejected" && record.rejectionReason && (
											<div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-800">
												<strong>Rejection reason:</strong> {record.rejectionReason}
											</div>
										)}
										<p className="text-[#94A3B8] text-xs mt-2">
											Submitted: {new Date(record.createdAt).toLocaleString()}
										</p>
										<div className="mt-2 flex flex-wrap gap-2">
											{record.documentUrl && (
												<a
													href={record.documentUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-[#2563EB] text-sm hover:underline"
												>
													View document →
												</a>
											)}
											{record.documentBackUrl && (
												<a
													href={record.documentBackUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-[#2563EB] text-sm hover:underline"
												>
													View back →
												</a>
											)}
											{record.selfieUrl && (
												<a
													href={record.selfieUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-[#2563EB] text-sm hover:underline"
												>
													View selfie →
												</a>
											)}
										</div>
									</div>

									{record.status === "pending" && (
										<div className="flex gap-2 flex-shrink-0">
											<button
												onClick={() => handleApprove(record)}
												className="px-3 sm:px-4 py-2 bg-[#16A34A] text-white rounded-md text-sm hover:bg-[#15803D]"
											>
												Approve
											</button>
											<button
												onClick={() => openRejectModal(record)}
												className="px-3 sm:px-4 py-2 bg-[#DC2626] text-white rounded-md text-sm hover:bg-[#B91C1C]"
											>
												Reject
											</button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-white rounded-lg border border-[#E2E8F0]">
						<p className="text-[#64748B]">No {statusFilter} KYC records</p>
					</div>
				)}
			</div>

			{/* Reject reason modal */}
			{rejectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h2 className="text-lg font-semibold text-[#0F172A] mb-2">Reject verification</h2>
						<p className="text-sm text-[#64748B] mb-4">
							User: {rejectModal.record.userEmail || rejectModal.record.userPhone || rejectModal.record.userId}.
							They will receive an email with the reason below.
						</p>
						<label className="block text-sm font-medium text-[#0F172A] mb-2">
							Reason (min 10 characters) *
						</label>
						<textarea
							value={rejectModal.reason}
							onChange={(e) =>
								setRejectModal((m) => (m ? { ...m, reason: e.target.value } : null))
							}
							placeholder="e.g. Document image is blurry. Please resubmit a clear photo of your ID."
							rows={4}
							className="w-full px-3 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
						/>
						<div className="flex gap-3 mt-6">
							<button
								onClick={closeRejectModal}
								disabled={rejectModal.submitting}
								className="flex-1 py-2 px-4 border border-[#E2E8F0] text-[#475569] rounded-md text-sm hover:bg-[#F8FAFC] disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleReject}
								disabled={
									rejectModal.submitting ||
									rejectModal.reason.trim().length < 10
								}
								className="flex-1 py-2 px-4 bg-[#DC2626] text-white rounded-md text-sm hover:bg-[#B91C1C] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{rejectModal.submitting ? "Rejecting..." : "Reject & notify"}
							</button>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
