import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Users, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Search, Eye, X } from "lucide-react";
import { api } from "../lib/api-client";
import { cn } from "../lib/utils";

interface PendingItem {
	id: string;
	title: string;
	description: string;
	category: string;
	type: string;
	size: string;
	condition: string;
	tags: string[];
	images: string[];
	status: string;
	createdAt: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

interface AdminStats {
	users: { total: number };
	items: {
		total: number;
		pending: number;
		approved: number;
		rejected: number;
		available: number;
		swapped: number;
	};
}

export function AdminDashboard() {
	const queryClient = useQueryClient();
	const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
	const [rejectReason, setRejectReason] = useState("");
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [page, setPage] = useState(1);

	// Fetch admin stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ["admin-stats"],
		queryFn: () => api.admin.stats(),
	});

	// Fetch pending items
	const { data: pendingData, isLoading: pendingLoading } = useQuery({
		queryKey: ["admin-pending-items", page],
		queryFn: () => api.admin.pendingItems({ page, limit: 10 }),
	});

	// Approve item mutation
	const approveMutation = useMutation({
		mutationFn: (itemId: string) => api.items.approve(itemId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
			queryClient.invalidateQueries({ queryKey: ["admin-pending-items"] });
			setSelectedItem(null);
		},
	});

	// Reject item mutation
	const rejectMutation = useMutation({
		mutationFn: ({ itemId, reason }: { itemId: string; reason: string }) => api.items.reject(itemId, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
			queryClient.invalidateQueries({ queryKey: ["admin-pending-items"] });
			setShowRejectModal(false);
			setRejectReason("");
			setSelectedItem(null);
		},
	});

	const stats = statsData?.data as AdminStats;
	const pendingItems = pendingData?.data?.items as PendingItem[];
	const pagination = pendingData?.data?.pagination;

	const handleApprove = (item: PendingItem) => {
		if (confirm(`Approve "${item.title}"?`)) {
			approveMutation.mutate(item.id);
		}
	};

	const handleReject = (item: PendingItem) => {
		setSelectedItem(item);
		setShowRejectModal(true);
	};

	const submitReject = () => {
		if (selectedItem && rejectReason.trim()) {
			rejectMutation.mutate({ itemId: selectedItem.id, reason: rejectReason });
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					{statsLoading ? (
						<div className="col-span-4 flex justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
						</div>
					) : stats ? (
						<>
							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Total Users</p>
										<p className="text-3xl font-bold text-gray-900">{stats.users.total.toLocaleString()}</p>
									</div>
									<Users className="h-8 w-8 text-blue-600" />
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Total Items</p>
										<p className="text-3xl font-bold text-gray-900">{stats.items.total.toLocaleString()}</p>
									</div>
									<Package className="h-8 w-8 text-green-600" />
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Pending Review</p>
										<p className="text-3xl font-bold text-orange-600">{stats.items.pending}</p>
									</div>
									<Clock className="h-8 w-8 text-orange-600" />
								</div>
							</div>

							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Available Items</p>
										<p className="text-3xl font-bold text-gray-900">{stats.items.available.toLocaleString()}</p>
									</div>
									<CheckCircle className="h-8 w-8 text-purple-600" />
								</div>
							</div>
						</>
					) : null}
				</div>

				{/* Item Stats Breakdown */}
				{stats && (
					<div className="bg-white rounded-xl shadow-sm p-6 mb-8">
						<h2 className="text-xl font-semibold mb-4">Item Status Breakdown</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center">
								<p className="text-2xl font-bold text-green-600">{stats.items.approved}</p>
								<p className="text-sm text-gray-600">Approved</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold text-red-600">{stats.items.rejected}</p>
								<p className="text-sm text-gray-600">Rejected</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold text-blue-600">{stats.items.available}</p>
								<p className="text-sm text-gray-600">Available</p>
							</div>
							<div className="text-center">
								<p className="text-2xl font-bold text-purple-600">{stats.items.swapped}</p>
								<p className="text-sm text-gray-600">Swapped</p>
							</div>
						</div>
					</div>
				)}

				{/* Pending Items Section */}
				<div className="bg-white rounded-xl shadow-sm p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold">Pending Items for Review</h2>
						<div className="flex items-center gap-2 text-sm text-gray-600">
							<Clock className="h-4 w-4" />
							{stats?.items.pending || 0} items pending
						</div>
					</div>

					{pendingLoading ? (
						<div className="flex justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
						</div>
					) : pendingItems && pendingItems.length > 0 ? (
						<>
							<div className="space-y-4">
								{pendingItems.map((item) => (
									<div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
										<div className="flex gap-4">
											{/* Image */}
											<img src={item.images[0]} alt={item.title} className="w-24 h-24 object-cover rounded-lg" />

											{/* Item Details */}
											<div className="flex-1">
												<div className="flex items-start justify-between">
													<div>
														<h3 className="font-semibold text-gray-900">{item.title}</h3>
														<p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
														<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
															<span>{item.category}</span>
															<span>•</span>
															<span>{item.type}</span>
															<span>•</span>
															<span>Size {item.size}</span>
															<span>•</span>
															<span>{item.condition}</span>
														</div>
														<div className="flex items-center gap-2 mt-2">
															{item.tags.map((tag) => (
																<span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
																	{tag}
																</span>
															))}
														</div>
													</div>
													<div className="text-right text-sm text-gray-500">
														<p>Submitted by: {item.user.name}</p>
														<p>{new Date(item.createdAt).toLocaleDateString()}</p>
													</div>
												</div>

												{/* Action Buttons */}
												<div className="flex items-center gap-2 mt-4">
													<button
														onClick={() => setSelectedItem(item)}
														className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
													>
														<Eye className="h-4 w-4" />
														Preview
													</button>
													<button
														onClick={() => handleApprove(item)}
														disabled={approveMutation.isPending}
														className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
													>
														<CheckCircle className="h-4 w-4" />
														Approve
													</button>
													<button
														onClick={() => handleReject(item)}
														disabled={rejectMutation.isPending}
														className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
													>
														<XCircle className="h-4 w-4" />
														Reject
													</button>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Pagination */}
							{pagination && pagination.pages > 1 && (
								<div className="flex justify-center gap-2 mt-6">
									{Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
										<button
											key={pageNum}
											onClick={() => setPage(pageNum)}
											className={cn(
												"px-3 py-1 rounded-lg text-sm font-medium transition-colors",
												page === pageNum ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
											)}
										>
											{pageNum}
										</button>
									))}
								</div>
							)}
						</>
					) : (
						<div className="text-center py-12">
							<CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
							<p className="text-gray-600">No pending items to review!</p>
						</div>
					)}
				</div>
			</div>

			{/* Item Preview Modal */}
			{selectedItem && !showRejectModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
						<div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold">Item Preview</h3>
							<button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-100 rounded-lg">
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="p-6">
							{/* Images */}
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
								{selectedItem.images.map((image, index) => (
									<img
										key={index}
										src={image}
										alt={`${selectedItem.title} ${index + 1}`}
										className="w-full h-40 object-cover rounded-lg"
									/>
								))}
							</div>

							{/* Details */}
							<h4 className="text-xl font-semibold mb-2">{selectedItem.title}</h4>
							<p className="text-gray-600 mb-4">{selectedItem.description}</p>

							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<p className="text-sm text-gray-500">Category</p>
									<p className="font-medium">{selectedItem.category}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Type</p>
									<p className="font-medium">{selectedItem.type}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Size</p>
									<p className="font-medium">{selectedItem.size}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Condition</p>
									<p className="font-medium">{selectedItem.condition}</p>
								</div>
							</div>

							<div className="mb-4">
								<p className="text-sm text-gray-500 mb-1">Tags</p>
								<div className="flex flex-wrap gap-2">
									{selectedItem.tags.map((tag) => (
										<span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
											{tag}
										</span>
									))}
								</div>
							</div>

							<div className="border-t pt-4">
								<p className="text-sm text-gray-500">Submitted by</p>
								<p className="font-medium">{selectedItem.user.name}</p>
								<p className="text-sm text-gray-500">{selectedItem.user.email}</p>
							</div>

							{/* Actions */}
							<div className="flex gap-2 mt-6">
								<button
									onClick={() => handleApprove(selectedItem)}
									disabled={approveMutation.isPending}
									className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
								>
									Approve Item
								</button>
								<button
									onClick={() => handleReject(selectedItem)}
									disabled={rejectMutation.isPending}
									className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
								>
									Reject Item
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Reject Modal */}
			{showRejectModal && selectedItem && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl max-w-md w-full">
						<div className="p-6">
							<h3 className="text-lg font-semibold mb-4">Reject Item</h3>
							<p className="text-gray-600 mb-4">Please provide a reason for rejecting "{selectedItem.title}"</p>
							<textarea
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								placeholder="Enter rejection reason..."
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								rows={4}
							/>
							<div className="flex gap-2 mt-4">
								<button
									onClick={() => {
										setShowRejectModal(false);
										setRejectReason("");
									}}
									className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
								>
									Cancel
								</button>
								<button
									onClick={submitReject}
									disabled={!rejectReason.trim() || rejectMutation.isPending}
									className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
								>
									{rejectMutation.isPending ? "Rejecting..." : "Reject Item"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
