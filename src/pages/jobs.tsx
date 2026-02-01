/**
 * Job Moderation Page
 * Minimalistic, mobile-responsive design
 */

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";

interface Job {
	id: string;
	uuid: string;
	title: string;
	city: string;
	jobType: string;
	status: string;
	isFeatured: boolean;
	viewsCount: number;
	applicationsCount: number;
	companyName: string;
	employerVerified: boolean;
	createdAt: string;
}

export default function JobModerationPage() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("");

	useEffect(() => {
		loadJobs();
	}, [statusFilter]);

	const loadJobs = async () => {
		setLoading(true);
		try {
			const params = statusFilter ? `?status=${statusFilter}` : "";
			const response = await api.get(`/admin/jobs${params}`);
			setJobs(response.data.jobs || []);
		} catch (err) {
			console.error("Failed to load jobs", err);
		} finally {
			setLoading(false);
		}
	};

	const handleModerate = async (jobId: string, action: string) => {
		if (!confirm(`Are you sure you want to ${action} this job?`)) return;

		try {
			await api.patch(`/admin/jobs/${jobId}/moderate`, { action });
			loadJobs();
		} catch (err: any) {
			alert(err.response?.data?.error || "Action failed");
		}
	};

	return (
		<AdminLayout>
			<div className="max-w-6xl mx-auto">
				<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">Job Moderation</h1>

				{/* Filter */}
				<div className="mb-6 flex gap-2 overflow-x-auto pb-2">
					{["", "active", "draft", "paused", "closed"].map((status) => (
						<button
							key={status}
							onClick={() => setStatusFilter(status)}
							className={`px-3 sm:px-4 py-2 rounded-md capitalize text-sm whitespace-nowrap ${
								statusFilter === status
									? "bg-[#2563EB] text-white"
									: "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
							}`}
						>
							{status || "All"}
						</button>
					))}
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
					</div>
				) : jobs.length > 0 ? (
					<div className="space-y-4">
						{jobs.map((job) => (
							<div
								key={job.id}
								className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0]"
							>
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
									<div className="flex-1 min-w-0">
										<div className="flex flex-wrap items-center gap-2 mb-2">
											<span className="text-[#0F172A] font-medium">{job.title}</span>
											<span
												className={`px-2 py-0.5 text-xs rounded capitalize ${
													job.status === "active"
														? "bg-green-100 text-green-700"
														: job.status === "draft"
														? "bg-gray-100 text-gray-600"
														: job.status === "paused"
														? "bg-yellow-100 text-yellow-700"
														: "bg-red-100 text-red-700"
												}`}
											>
												{job.status}
											</span>
											{job.isFeatured && (
												<span className="px-2 py-0.5 text-xs bg-blue-100 text-[#2563EB] rounded">
													Featured
												</span>
											)}
										</div>
										<p className="text-[#64748B] text-sm">
											{job.companyName || "Unknown Company"}
											{!job.employerVerified && (
												<span className="ml-2 text-yellow-600">(Unverified)</span>
											)}
										</p>
										<p className="text-[#94A3B8] text-xs mt-1">
											{job.city} • {job.jobType?.replace("-", " ")} • {job.applicationsCount} applications
										</p>
									</div>

									<div className="flex flex-wrap gap-2 flex-shrink-0">
										{job.status !== "closed" && (
											<button
												onClick={() => handleModerate(job.id, "block")}
												className="px-3 py-1.5 bg-[#DC2626] text-white rounded-md text-sm hover:bg-[#B91C1C]"
											>
												Block
											</button>
										)}
										{job.status === "closed" && (
											<button
												onClick={() => handleModerate(job.id, "unblock")}
												className="px-3 py-1.5 bg-[#16A34A] text-white rounded-md text-sm hover:bg-[#15803D]"
											>
												Unblock
											</button>
										)}
										{!job.isFeatured ? (
											<button
												onClick={() => handleModerate(job.id, "feature")}
												className="px-3 py-1.5 bg-[#2563EB] text-white rounded-md text-sm hover:bg-[#1E40AF]"
											>
												Feature
											</button>
										) : (
											<button
												onClick={() => handleModerate(job.id, "unfeature")}
												className="px-3 py-1.5 bg-[#64748B] text-white rounded-md text-sm hover:bg-[#475569]"
											>
												Unfeature
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-white rounded-lg border border-[#E2E8F0]">
						<p className="text-[#64748B]">No jobs found</p>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
