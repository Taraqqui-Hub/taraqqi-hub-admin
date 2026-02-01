/**
 * KYC Review Queue Page
 * Minimalistic, mobile-responsive design
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
	status: string;
	createdAt: string;
	userEmail: string;
	userPhone: string;
	userType: string;
}

export default function KycQueuePage() {
	const [records, setRecords] = useState<KycRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("pending");

	useEffect(() => {
		loadRecords();
	}, [statusFilter]);

	const loadRecords = async () => {
		setLoading(true);
		try {
			const response = await api.get(`/admin/kyc?status=${statusFilter}`);
			setRecords(response.data.records || []);
		} catch (err) {
			console.error("Failed to load KYC records", err);
		} finally {
			setLoading(false);
		}
	};

	const handleReview = async (id: string, action: "approve" | "reject") => {
		if (!confirm(`Are you sure you want to ${action} this KYC?`)) return;

		try {
			await api.patch(`/admin/kyc/${id}`, { action });
			loadRecords();
		} catch (err: any) {
			alert(err.response?.data?.error || "Action failed");
		}
	};

	return (
		<AdminLayout>
			<div className="max-w-6xl mx-auto">
				<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">KYC Review Queue</h1>

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
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
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
											<span className="text-[#0F172A] font-medium">
												{record.documentType}
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
											Doc #: {record.documentNumber}
										</p>
										<p className="text-[#64748B] text-sm truncate">
											User: {record.userEmail || record.userPhone} ({record.userType})
										</p>
										<p className="text-[#94A3B8] text-xs mt-2">
											Submitted: {new Date(record.createdAt).toLocaleString()}
										</p>
										{record.documentUrl && (
											<a
												href={record.documentUrl}
												target="_blank"
												className="mt-2 inline-block text-[#2563EB] text-sm hover:underline"
											>
												View Document →
											</a>
										)}
									</div>

									{record.status === "pending" && (
										<div className="flex gap-2 flex-shrink-0">
											<button
												onClick={() => handleReview(record.id, "approve")}
												className="px-3 sm:px-4 py-2 bg-[#16A34A] text-white rounded-md text-sm hover:bg-[#15803D]"
											>
												Approve
											</button>
											<button
												onClick={() => handleReview(record.id, "reject")}
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
		</AdminLayout>
	);
}
