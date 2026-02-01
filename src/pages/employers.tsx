/**
 * Employers Verification Queue
 * Minimalistic, mobile-responsive design
 */

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";

interface Employer {
	id: string;
	userId: string;
	companyName: string;
	companyType: string;
	industry: string;
	city: string;
	gstin: string;
	pan: string;
	isVerified: boolean;
	createdAt: string;
	userEmail: string;
}

export default function EmployersPage() {
	const [employers, setEmployers] = useState<Employer[]>([]);
	const [loading, setLoading] = useState(true);
	const [showVerified, setShowVerified] = useState(false);

	useEffect(() => {
		loadEmployers();
	}, [showVerified]);

	const loadEmployers = async () => {
		setLoading(true);
		try {
			const response = await api.get(`/admin/employers?verified=${showVerified}`);
			setEmployers(response.data.employers || []);
		} catch (err) {
			console.error("Failed to load employers", err);
		} finally {
			setLoading(false);
		}
	};

	const handleVerify = async (id: string, action: "verify" | "reject") => {
		if (!confirm(`Are you sure you want to ${action} this employer?`)) return;

		try {
			await api.patch(`/admin/employers/${id}/verify`, { action });
			loadEmployers();
		} catch (err: any) {
			alert(err.response?.data?.error || "Action failed");
		}
	};

	return (
		<AdminLayout>
			<div className="max-w-6xl mx-auto">
				<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">Employer Verification</h1>

				{/* Filter */}
				<div className="mb-6 flex gap-2">
					<button
						onClick={() => setShowVerified(false)}
						className={`px-3 sm:px-4 py-2 rounded-md text-sm ${
							!showVerified
								? "bg-[#2563EB] text-white"
								: "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
						}`}
					>
						Pending
					</button>
					<button
						onClick={() => setShowVerified(true)}
						className={`px-3 sm:px-4 py-2 rounded-md text-sm ${
							showVerified
								? "bg-[#2563EB] text-white"
								: "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
						}`}
					>
						Verified
					</button>
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
					</div>
				) : employers.length > 0 ? (
					<div className="space-y-4">
						{employers.map((emp) => (
							<div
								key={emp.id}
								className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0]"
							>
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
									<div className="flex-1 min-w-0">
										<h3 className="text-[#0F172A] font-medium text-base sm:text-lg">{emp.companyName}</h3>
										<p className="text-[#64748B] text-sm mt-1">
											{emp.companyType} • {emp.industry} • {emp.city}
										</p>
										<div className="mt-2 text-[#94A3B8] text-sm">
											<p>GSTIN: {emp.gstin || "Not provided"}</p>
											<p>PAN: {emp.pan || "Not provided"}</p>
										</div>
										<p className="text-[#94A3B8] text-xs mt-2">
											Registered: {new Date(emp.createdAt).toLocaleDateString()}
										</p>
									</div>

									{!emp.isVerified ? (
										<div className="flex gap-2 flex-shrink-0">
											<button
												onClick={() => handleVerify(emp.id, "verify")}
												className="px-3 sm:px-4 py-2 bg-[#16A34A] text-white rounded-md text-sm hover:bg-[#15803D]"
											>
												Verify
											</button>
											<button
												onClick={() => handleVerify(emp.id, "reject")}
												className="px-3 sm:px-4 py-2 bg-[#DC2626] text-white rounded-md text-sm hover:bg-[#B91C1C]"
											>
												Reject
											</button>
										</div>
									) : (
										<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex-shrink-0">
											Verified
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-white rounded-lg border border-[#E2E8F0]">
						<p className="text-[#64748B]">
							{showVerified ? "No verified employers" : "No pending verifications"}
						</p>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
