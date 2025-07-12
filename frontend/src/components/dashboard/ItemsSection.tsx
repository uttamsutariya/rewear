import { Package, Clock, CheckCircle, XCircle, AlertCircle, Eye, Edit, Trash2 } from "lucide-react";
import { formatDate } from "../../lib/utils";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import type { Item } from "../../types";

interface ItemsSectionProps {
	items: Item[];
}

const statusConfig = {
	PENDING: {
		label: "Pending",
		color: "bg-yellow-100 text-yellow-800 border-yellow-200",
		icon: Clock,
	},
	AVAILABLE: {
		label: "Available",
		color: "bg-green-100 text-green-800 border-green-200",
		icon: CheckCircle,
	},
	SWAPPED: {
		label: "Swapped",
		color: "bg-blue-100 text-blue-800 border-blue-200",
		icon: Package,
	},
	REJECTED: {
		label: "Rejected",
		color: "bg-red-100 text-red-800 border-red-200",
		icon: XCircle,
	},
};

export function ItemsSection({ items }: ItemsSectionProps) {
	if (!items || items.length === 0) {
		return (
			<div className="p-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">My Items</h2>

				<div className="text-center py-12">
					<Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No items uploaded yet</h3>
					<p className="text-gray-600 mb-6">Start sharing your pre-loved fashion items with the community!</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">My Items</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{items.map((item) => {
					const status = statusConfig[item.status as keyof typeof statusConfig];
					const StatusIcon = status?.icon || AlertCircle;

					return (
						<div
							key={item.id}
							className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
						>
							{/* Image */}
							<div className="aspect-square relative bg-gray-100">
								{item.images && item.images.length > 0 ? (
									<img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<Package className="h-12 w-12 text-gray-400" />
									</div>
								)}

								{/* Status Badge */}
								<div
									className={cn(
										"absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1",
										status?.color,
									)}
								>
									<StatusIcon className="h-3 w-3" />
									{status?.label}
								</div>
							</div>

							{/* Content */}
							<div className="p-4">
								<h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
								<div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
									<span>{item.category}</span>
									<span>•</span>
									<span>Size {item.size}</span>
									<span>•</span>
									<span>{item.condition}</span>
								</div>
								<p className="text-sm text-gray-500">Listed {formatDate(item.createdAt)}</p>

								{/* Action Buttons */}
								<div className="flex gap-2 mt-4">
									<Link
										to={`/items/${item.id}`}
										className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
									>
										<Eye className="h-4 w-4" />
										View
									</Link>
									{item.status === "AVAILABLE" && (
										<button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
											<Edit className="h-4 w-4" />
											Edit
										</button>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
