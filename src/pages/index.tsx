/**
 * Admin Dashboard Page
 * Minimalistic, mobile-responsive design
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";
import { 
	Users, 
	User, 
	Building2, 
	Briefcase, 
	FileText, 
	IndianRupee, 
	UserCheck 
} from "lucide-react";

interface Metrics {
	users: {
		total: number;
		employers: number;
		jobseekers: number;
		admins: number;
		newThisMonth: number;
	};
	jobs: {
		total: number;
		active: number;
		draft: number;
		newThisMonth: number;
	};
	applications: {
		total: number;
		pending: number;
		hired: number;
		newThisMonth: number;
	};
	revenue: {
		totalInRupees: number;
		thisMonthInRupees: number;
	};
	pending: {
		kyc: number;
		employers: number;
	};
}

export default function AdminDashboard() {
	const [metrics, setMetrics] = useState<Metrics | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadMetrics();
	}, []);

	const loadMetrics = async () => {
		try {
			const response = await api.get("/admin/dashboard");
			console.log("Dashboard API Response:", response.data);
			
			// Handle both wrapped and unwrapped responses defensively
			const data = response.data;
			if (data && typeof data === "object" && "payload" in data) {
				setMetrics(data.payload as Metrics);
			} else {
				setMetrics(data as Metrics);
			}
		} catch (err) {
			console.error("Failed to load metrics", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AdminLayout>
			<div className="max-w-7xl mx-auto">
				<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">Dashboard</h1>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
					</div>
				) : !metrics ? (
					<div className="bg-white rounded-lg p-6 shadow-sm border border-[#E2E8F0] text-center">
						<p className="text-red-600">Failed to load dashboard data</p>
					</div>
				) : (
					<>
						{/* Primary KPIs */}
						<div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-4">
							<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
								<div className="flex justify-between items-start">
									<p className="text-xs sm:text-sm text-[#64748B]">Total Users</p>
									<Users className="w-4 h-4 text-[#64748B]" />
								</div>
								<p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
									{metrics.users.total}
								</p>
								<p className="text-xs sm:text-sm text-[#16A34A] mt-2">
									+{metrics.users.newThisMonth} this month
								</p>
							</div>
							<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
								<div className="flex justify-between items-start">
									<p className="text-xs sm:text-sm text-[#64748B]">Individuals</p>
									<User className="w-4 h-4 text-[#64748B]" />
								</div>
								<p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
									{metrics.users.jobseekers}
								</p>
								<p className="text-xs sm:text-sm text-[#64748B] mt-2">Job seekers</p>
							</div>
							<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
								<div className="flex justify-between items-start">
									<p className="text-xs sm:text-sm text-[#64748B]">Total Employers</p>
									<Building2 className="w-4 h-4 text-[#64748B]" />
								</div>
								<p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
									{metrics.users.employers}
								</p>
								<p className="text-xs sm:text-sm text-[#64748B] mt-2">Companies</p>
							</div>
							<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
								<div className="flex justify-between items-start">
									<p className="text-xs sm:text-sm text-[#64748B]">Active Jobs</p>
									<Briefcase className="w-4 h-4 text-[#64748B]" />
								</div>
								<p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
									{metrics.jobs.active}
								</p>
								<p className="text-xs sm:text-sm text-[#64748B] mt-2">
									{metrics.jobs.total} total
								</p>
							</div>
						</div>
						<div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
							<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
								<div className="flex justify-between items-start">
									<p className="text-xs sm:text-sm text-[#64748B]">Applications</p>
									<FileText className="w-4 h-4 text-[#64748B]" />
								</div>
								<p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
									{metrics.applications.total}
								</p>
								<p className="text-xs sm:text-sm text-[#D97706] mt-2">
									{metrics.applications.pending} pending
								</p>
							</div>
							<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:shadow-md transition-all">
								<div className="flex justify-between items-start">
									<p className="text-xs sm:text-sm text-[#64748B]">Revenue</p>
									<IndianRupee className="w-4 h-4 text-[#64748B]" />
								</div>
								<p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
									₹{metrics.revenue.totalInRupees.toLocaleString()}
								</p>
								<p className="text-xs sm:text-sm text-[#16A34A] mt-2">
									₹{metrics.revenue.thisMonthInRupees.toLocaleString()} this month
								</p>
							</div>
						</div>

						{/* Pending Items */}
						<div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mb-6 sm:mb-8">
							<Link href="/kyc" className="block">
								<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all overflow-hidden relative group">
									<div className="flex justify-between items-center relative z-10">
										<div>
											<p className="text-sm text-[#64748B]">Pending KYC Reviews</p>
											<p className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">
												{metrics.pending.kyc}
											</p>
										</div>
										<UserCheck className="w-10 h-10 text-[#2563EB]/20 group-hover:text-[#2563EB] transition-colors" />
									</div>
								</div>
							</Link>

							<Link href="/employers" className="block">
								<div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all overflow-hidden relative group">
									<div className="flex justify-between items-center relative z-10">
										<div>
											<p className="text-sm text-[#64748B]">Pending Employer Verifications</p>
											<p className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">
												{metrics.pending.employers}
											</p>
										</div>
										<Building2 className="w-10 h-10 text-[#2563EB]/20 group-hover:text-[#2563EB] transition-colors" />
									</div>
								</div>
							</Link>
						</div>

						{/* Quick Links - Desktop only, mobile has bottom nav */}
						<div className="hidden md:block bg-white rounded-lg p-6 shadow-sm border border-[#E2E8F0]">
							<h2 className="text-lg font-semibold text-[#0F172A] mb-4">Quick Actions</h2>
							<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
								<Link
									href="/kyc"
									className="px-4 py-3 bg-[#F8FAFC] text-[#0F172A] rounded-lg text-center hover:bg-[#F1F5F9] border border-[#E2E8F0] transition"
								>
									KYC Queue
								</Link>
								<Link
									href="/users"
									className="px-4 py-3 bg-[#F8FAFC] text-[#0F172A] rounded-lg text-center hover:bg-[#F1F5F9] border border-[#E2E8F0] transition"
								>
									User Management
								</Link>
								<Link
									href="/employers"
									className="px-4 py-3 bg-[#F8FAFC] text-[#0F172A] rounded-lg text-center hover:bg-[#F1F5F9] border border-[#E2E8F0] transition"
								>
									Employers
								</Link>
								<Link
									href="/jobs"
									className="px-4 py-3 bg-[#F8FAFC] text-[#0F172A] rounded-lg text-center hover:bg-[#F1F5F9] border border-[#E2E8F0] transition"
								>
									Jobs
								</Link>
								<Link
									href="/audit-logs"
									className="px-4 py-3 bg-[#F8FAFC] text-[#0F172A] rounded-lg text-center hover:bg-[#F1F5F9] border border-[#E2E8F0] transition"
								>
									Audit Logs
								</Link>
							</div>
						</div>
					</>
				)}
			</div>
		</AdminLayout>
	);
}
