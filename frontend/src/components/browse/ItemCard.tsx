import { Link } from "react-router-dom";
import { Heart, Eye, Coins, User } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Item } from "../../types";

interface ItemCardProps {
	item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
	const pointsMap: Record<string, number> = {
		New: 50,
		"Like New": 40,
		Good: 30,
		Fair: 20,
		Poor: 10,
	};

	const points = pointsMap[item.condition] || 0;

	return (
		<div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
			{/* Image */}
			<div className="relative aspect-square overflow-hidden bg-gray-100">
				{item.images && item.images.length > 0 ? (
					<>
						<img
							src={item.images[0]}
							alt={item.title}
							className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
						/>
						{item.images.length > 1 && (
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<img src={item.images[1]} alt={item.title} className="w-full h-full object-cover" />
							</div>
						)}
					</>
				) : (
					<div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
				)}

				{/* Quick Actions */}
				<div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors">
						<Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
					</button>
					<Link
						to={`/items/${item.id}`}
						className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
					>
						<Eye className="h-5 w-5 text-gray-600" />
					</Link>
				</div>

				{/* Badges */}
				<div className="absolute top-4 left-4 flex flex-col gap-2">
					<span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
						{item.category}
					</span>
				</div>

				{/* Points Badge */}
				<div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
					<Coins className="h-4 w-4 text-yellow-600" />
					<span className="text-sm font-semibold text-gray-900">{points} pts</span>
				</div>
			</div>

			{/* Content */}
			<div className="p-4">
				<h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
					{item.title}
				</h3>

				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<span className="font-medium">{item.size}</span>
						<span className="text-gray-400">•</span>
						<span>{item.condition}</span>
					</div>
					<span className="text-sm text-gray-500">{item.type}</span>
				</div>

				{/* User Info */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
							<User className="h-3 w-3 text-gray-600" />
						</div>
						<span className="text-sm text-gray-600">{item.user.name}</span>
					</div>

					<Link
						to={`/items/${item.id}`}
						className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
					>
						View Details →
					</Link>
				</div>
			</div>
		</div>
	);
}
