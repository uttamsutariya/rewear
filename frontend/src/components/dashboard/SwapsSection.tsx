import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Package, Loader2, CheckCircle, XCircle, Clock, AlertCircle, Coins } from "lucide-react";
import { api } from "../../lib/api-client";
import { cn } from "../../lib/utils";
import { formatDate } from "../../lib/utils";
import type { SwapRequestListItem } from "../../types";

export function SwapsSection() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<"sent" | "received">("received");
	const [selectedRequest, setSelectedRequest] = useState<SwapRequestListItem | null>(null);
	const [showRespondModal, setShowRespondModal] = useState(false);
	const [respondAction, setRespondAction] = useState<"accept" | "reject" | null>(null);

	// Fetch swap requests
	const { data, isLoading } = useQuery({
		queryKey: ["swap-requests", activeTab],
		queryFn: () => api.swaps.listRequests({ type: activeTab, limit: 20 }),
	});

	// Accept/Reject mutation
	const respondMutation = useMutation({
		mutationFn: (data: { id: string; action: "accept" | "reject" }) => api.swaps.respond(data.id, data.action),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["swap-requests"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["points-balance"] });
			setShowRespondModal(false);
			setSelectedRequest(null);
			alert(respondAction === "accept" ? "Swap request accepted!" : "Swap request rejected.");
		},
		onError: (error: any) => {
			alert(error.response?.data?.message || "Failed to respond to request");
		},
	});

	// Cancel request mutation
	const cancelMutation = useMutation({
		mutationFn: (id: string) => api.swaps.cancel(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["swap-requests"] });
			alert("Request cancelled successfully");
		},
		onError: (error: any) => {
			alert(error.response?.data?.message || "Failed to cancel request");
		},
	});

	const requests = data?.data?.requests || [];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
						<Clock className="h-3 w-3" />
						Pending
					</span>
				);
			case "ACCEPTED":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
						<CheckCircle className="h-3 w-3" />
						Accepted
					</span>
				);
			case "REJECTED":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
						<XCircle className="h-3 w-3" />
						Rejected
					</span>
				);
			case "CANCELLED":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
						<XCircle className="h-3 w-3" />
						Cancelled
					</span>
				);
			default:
				return null;
		}
	};

	const handleRespond = (request: SwapRequestListItem, action: "accept" | "reject") => {
		setSelectedRequest(request);
		setRespondAction(action);
		setShowRespondModal(true);
	};

	const confirmRespond = () => {
		if (selectedRequest && respondAction) {
			respondMutation.mutate({ id: selectedRequest.id, action: respondAction });
		}
	};

	return (
		<div>
			{/* Tabs */}
			<div className="flex gap-4 mb-6 border-b">
				<button
					onClick={() => setActiveTab("received")}
					className={cn(
						"pb-3 px-1 font-medium transition-colors relative",
						activeTab === "received" ? "text-primary-600" : "text-gray-500 hover:text-gray-700",
					)}
				>
					Received Requests
					{activeTab === "received" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
				</button>
				<button
					onClick={() => setActiveTab("sent")}
					className={cn(
						"pb-3 px-1 font-medium transition-colors relative",
						activeTab === "sent" ? "text-primary-600" : "text-gray-500 hover:text-gray-700",
					)}
				>
					Sent Requests
					{activeTab === "sent" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />}
				</button>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
				</div>
			) : requests.length === 0 ? (
				<div className="text-center py-12">
					<Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
					<p className="text-gray-600">No {activeTab} swap requests yet</p>
				</div>
			) : (
				<div className="space-y-4">
					{requests.map((request) => (
						<div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									{getStatusBadge(request.status)}
									<span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
									{request.isPointRedemption && (
										<span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
											<Coins className="h-3 w-3" />
											Point Redemption
										</span>
									)}
								</div>
							</div>

							{/* Items Display */}
							<div className="grid md:grid-cols-2 gap-6">
								{/* Requested Item */}
								<div>
									<p className="text-sm text-gray-600 mb-2">{activeTab === "sent" ? "You want" : "They want"}</p>
									<div className="bg-gray-50 rounded-lg p-4">
										<div className="flex gap-3">
											<img
												src={request.item.images[0]}
												alt={request.item.title}
												className="w-16 h-16 object-cover rounded"
											/>
											<div>
												<h4 className="font-medium">{request.item.title}</h4>
												<p className="text-sm text-gray-600">
													Size {request.item.size} • {request.item.condition}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Offered Item or Points */}
								<div>
									<p className="text-sm text-gray-600 mb-2">{activeTab === "sent" ? "You offer" : "They offer"}</p>
									{request.isPointRedemption ? (
										<div className="bg-purple-50 rounded-lg p-4">
											<div className="flex items-center gap-3">
												<Coins className="h-10 w-10 text-purple-600" />
												<div>
													<p className="font-medium">Points Redemption</p>
													<p className="text-sm text-purple-600">Using points to redeem this item</p>
												</div>
											</div>
										</div>
									) : request.offeredItem ? (
										<div className="bg-gray-50 rounded-lg p-4">
											<div className="flex gap-3">
												<img
													src={request.offeredItem.images[0]}
													alt={request.offeredItem.title}
													className="w-16 h-16 object-cover rounded"
												/>
												<div>
													<h4 className="font-medium">{request.offeredItem.title}</h4>
													<p className="text-sm text-gray-600">
														Size {request.offeredItem.size} • {request.offeredItem.condition}
													</p>
												</div>
											</div>
										</div>
									) : (
										<div className="bg-gray-50 rounded-lg p-4">
											<p className="text-gray-500">No item offered</p>
										</div>
									)}
								</div>
							</div>

							{/* Requester Info */}
							<div className="mt-4 pt-4 border-t">
								<p className="text-sm text-gray-600">
									{activeTab === "sent" ? "Request to" : "Request from"}:{" "}
									<span className="font-medium text-gray-900">
										{activeTab === "sent" ? request.item.user.name : request.requester.name}
									</span>
								</p>
							</div>

							{/* Actions */}
							{request.status === "PENDING" && (
								<div className="mt-4 pt-4 border-t">
									{activeTab === "received" ? (
										<div className="flex gap-3">
											<button
												onClick={() => handleRespond(request, "accept")}
												disabled={respondMutation.isPending}
												className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
											>
												Accept
											</button>
											<button
												onClick={() => handleRespond(request, "reject")}
												disabled={respondMutation.isPending}
												className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
											>
												Reject
											</button>
										</div>
									) : (
										<button
											onClick={() => {
												if (confirm("Are you sure you want to cancel this request?")) {
													cancelMutation.mutate(request.id);
												}
											}}
											disabled={cancelMutation.isPending}
											className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
										>
											Cancel Request
										</button>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Response Confirmation Modal */}
			{showRespondModal && selectedRequest && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl max-w-md w-full p-6">
						<h3 className="text-xl font-semibold mb-4">
							{respondAction === "accept" ? "Accept Swap Request?" : "Reject Swap Request?"}
						</h3>

						{respondAction === "accept" ? (
							<div>
								<p className="text-gray-600 mb-4">By accepting this request:</p>
								<ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-6">
									{selectedRequest.isPointRedemption ? (
										<>
											<li>You'll receive points for your item</li>
											<li>The requester will receive your item</li>
											<li>Your item will be marked as swapped</li>
										</>
									) : (
										<>
											<li>
												You'll receive: <strong>{selectedRequest.offeredItem?.title}</strong>
											</li>
											<li>
												They'll receive: <strong>{selectedRequest.item.title}</strong>
											</li>
											<li>Both items will be marked as swapped</li>
										</>
									)}
								</ul>
							</div>
						) : (
							<p className="text-gray-600 mb-6">
								Are you sure you want to reject this swap request? The requester will be notified.
							</p>
						)}

						<div className="flex gap-3">
							<button
								onClick={() => setShowRespondModal(false)}
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={confirmRespond}
								disabled={respondMutation.isPending}
								className={cn(
									"flex-1 px-4 py-2 rounded-lg text-white disabled:bg-gray-300",
									respondAction === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700",
								)}
							>
								{respondMutation.isPending
									? "Processing..."
									: respondAction === "accept"
									? "Accept Swap"
									: "Reject Request"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
