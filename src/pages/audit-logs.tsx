/**
 * Audit Logs Page
 * Minimalistic, mobile-responsive design
 */

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api";

interface AuditLog {
	id: string;
	action: string;
	entityType: string;
	entityId: string;
	description: string;
	ipAddress: string;
	userId: string;
	createdAt: string;
}

export default function AuditLogsPage() {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [entityType, setEntityType] = useState("");

	useEffect(() => {
		loadLogs();
	}, [entityType]);

	const loadLogs = async () => {
		setLoading(true);
		try {
			const params = entityType ? `?entityType=${entityType}` : "";
			const response = await api.get(`/admin/audit-logs${params}`);
			setLogs(response.data.logs || []);
		} catch (err) {
			console.error("Failed to load audit logs", err);
		} finally {
			setLoading(false);
		}
	};

	const handleExport = async () => {
		try {
			const response = await api.get("/admin/audit-logs/export", {
				responseType: "blob",
			});
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `audit-logs-${Date.now()}.csv`);
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (err) {
			alert("Export failed");
		}
	};

	const entityTypes = [
		"",
		"kyc",
		"job_moderation",
		"employer_verification",
		"config",
		"admin_user",
		"wallet_topup",
		"wallet_deduction",
	];

	return (
		<AdminLayout>
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
					<h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Audit Logs</h1>
					<button
						onClick={handleExport}
						className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1E40AF] text-sm self-start sm:self-auto"
					>
						Export CSV
					</button>
				</div>

				{/* Filter */}
				<div className="mb-6 flex gap-2 flex-wrap">
					{entityTypes.map((type) => (
						<button
							key={type}
							onClick={() => setEntityType(type)}
							className={`px-3 py-1.5 rounded-md text-sm ${
								entityType === type
									? "bg-[#2563EB] text-white"
									: "bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]"
							}`}
						>
							{type || "All"}
						</button>
					))}
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
					</div>
				) : logs.length > 0 ? (
					<>
						{/* Desktop Table */}
						<div className="hidden md:block bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden">
							<table className="w-full">
								<thead className="bg-[#F8FAFC]">
									<tr>
										<th className="px-4 py-3 text-left text-xs text-[#64748B] uppercase font-medium">
											Action
										</th>
										<th className="px-4 py-3 text-left text-xs text-[#64748B] uppercase font-medium">
											Entity
										</th>
										<th className="px-4 py-3 text-left text-xs text-[#64748B] uppercase font-medium">
											Description
										</th>
										<th className="px-4 py-3 text-left text-xs text-[#64748B] uppercase font-medium">
											IP
										</th>
										<th className="px-4 py-3 text-left text-xs text-[#64748B] uppercase font-medium">
											Date
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#E2E8F0]">
									{logs.map((log) => (
										<tr key={log.id} className="hover:bg-[#F8FAFC]">
											<td className="px-4 py-3 text-[#0F172A] text-sm">{log.action}</td>
											<td className="px-4 py-3 text-[#64748B] text-sm">
												{log.entityType}
												{log.entityId && ` #${log.entityId}`}
											</td>
											<td className="px-4 py-3 text-[#64748B] text-sm max-w-xs truncate">
												{log.description}
											</td>
											<td className="px-4 py-3 text-[#94A3B8] text-sm">{log.ipAddress}</td>
											<td className="px-4 py-3 text-[#94A3B8] text-sm">
												{new Date(log.createdAt).toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Cards */}
						<div className="md:hidden space-y-3">
							{logs.map((log) => (
								<div key={log.id} className="bg-white rounded-lg p-4 shadow-sm border border-[#E2E8F0]">
									<div className="flex justify-between items-start mb-2">
										<span className="text-[#0F172A] font-medium text-sm">{log.action}</span>
										<span className="text-[#94A3B8] text-xs">
											{new Date(log.createdAt).toLocaleDateString()}
										</span>
									</div>
									<p className="text-[#64748B] text-sm mb-1">
										{log.entityType}{log.entityId && ` #${log.entityId}`}
									</p>
									<p className="text-[#64748B] text-sm truncate">{log.description}</p>
									<p className="text-[#94A3B8] text-xs mt-2">IP: {log.ipAddress}</p>
								</div>
							))}
						</div>
					</>
				) : (
					<div className="text-center py-12 bg-white rounded-lg border border-[#E2E8F0]">
						<p className="text-[#64748B]">No audit logs found</p>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
