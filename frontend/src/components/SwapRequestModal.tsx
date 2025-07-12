import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Package, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { api } from "../lib/api-client";
import { cn } from "../lib/utils";
import type { Item } from "../types";

interface SwapRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	targetItem: Item;
}

export function SwapRequestModal({ isOpen, onClose, targetItem }: SwapRequestModalProps) {
	const queryClient = useQueryClient();
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const [message, setMessage] = useState("");

	// Fetch user's available items
	const { data: userItemsData, isLoading: loadingItems } = useQuery({
		queryKey: ["user-available-items"],
		queryFn: async () => {
			// First get the user profile to get their ID
			const profileResponse = await api.users.profile();
			const userId = profileResponse.data.id;

			// Then fetch their available items
			const itemsResponse = await api.items.list({
				limit: 100,
			});

			// Filter to only user's available items
			return {
				...itemsResponse,
				data: {
					...itemsResponse.data,
					items: itemsResponse.data.items.filter((item) => item.userId === userId && item.status === "AVAILABLE"),
				},
			};
		},
		enabled: isOpen,
	});

	// Create swap request mutation
	const createSwapMutation = useMutation({
		mutationFn: (data: { itemId: string; offeredItemId: string; message?: string }) => api.swaps.createRequest(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			onClose();
			alert("Swap request sent successfully!");
		},
		onError: (error: any) => {
			alert(error.response?.data?.message || "Failed to create swap request");
		},
	});

	const handleSubmit = () => {
		if (!selectedItemId) {
			alert("Please select an item to offer");
			return;
		}

		createSwapMutation.mutate({
			itemId: targetItem.id,
			offeredItemId: selectedItemId,
			message: message.trim() || undefined,
		});
	};

	if (!isOpen) return null;

	const userItems = userItemsData?.data?.items || [];

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-gray-900">Request Swap</h2>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 overflow-auto">
					{/* Target Item */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-3">You want:</h3>
						<div className="bg-gray-50 rounded-lg p-4">
							<div className="flex gap-4">
								<img src={targetItem.images[0]} alt={targetItem.title} className="w-20 h-20 object-cover rounded-lg" />
								<div>
									<h4 className="font-semibold">{targetItem.title}</h4>
									<p className="text-sm text-gray-600">
										{targetItem.category} • {targetItem.type} • Size {targetItem.size}
									</p>
									<p className="text-sm text-gray-500">Condition: {targetItem.condition}</p>
								</div>
							</div>
						</div>
					</div>

					{/* User's Items */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-3">Select an item to offer:</h3>

						{loadingItems ? (
							<div className="flex justify-center py-8">
								<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
							</div>
						) : userItems.length === 0 ? (
							<div className="text-center py-8">
								<Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
								<p className="text-gray-600">You don't have any available items to offer.</p>
								<p className="text-sm text-gray-500 mt-1">Upload some items first to start swapping!</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
								{userItems.map((item) => (
									<div
										key={item.id}
										onClick={() => setSelectedItemId(item.id)}
										className={cn(
											"border rounded-lg p-4 cursor-pointer transition-all",
											selectedItemId === item.id
												? "border-primary-600 bg-primary-50"
												: "border-gray-200 hover:border-gray-300",
										)}
									>
										<div className="flex gap-3">
											<img src={item.images[0]} alt={item.title} className="w-16 h-16 object-cover rounded" />
											<div className="flex-1">
												<h5 className="font-medium line-clamp-1">{item.title}</h5>
												<p className="text-sm text-gray-600">
													Size {item.size} • {item.condition}
												</p>
												{selectedItemId === item.id && (
													<div className="flex items-center gap-1 mt-1">
														<CheckCircle className="h-4 w-4 text-primary-600" />
														<span className="text-xs text-primary-600">Selected</span>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Message */}
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">Add a message (optional)</label>
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Tell them why you'd love to swap..."
							rows={3}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
							maxLength={500}
						/>
						<p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
					</div>

					{/* Preview */}
					{selectedItemId && (
						<div className="bg-blue-50 rounded-lg p-4 mb-6">
							<p className="text-sm text-blue-800 font-medium mb-2">Swap Preview:</p>
							<div className="flex items-center gap-4">
								<div className="text-center">
									<p className="text-xs text-blue-600 mb-1">You offer</p>
									<p className="font-medium text-blue-900">{userItems.find((i) => i.id === selectedItemId)?.title}</p>
								</div>
								<ArrowRight className="h-5 w-5 text-blue-600" />
								<div className="text-center">
									<p className="text-xs text-blue-600 mb-1">You receive</p>
									<p className="font-medium text-blue-900">{targetItem.title}</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="sticky bottom-0 bg-white border-t p-6 flex gap-4">
					<button
						onClick={onClose}
						className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={!selectedItemId || createSwapMutation.isPending}
						className={cn(
							"flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
							selectedItemId
								? "bg-primary-600 text-white hover:bg-primary-700"
								: "bg-gray-300 text-gray-500 cursor-not-allowed",
						)}
					>
						{createSwapMutation.isPending ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin" />
								Sending Request...
							</>
						) : (
							"Send Swap Request"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
