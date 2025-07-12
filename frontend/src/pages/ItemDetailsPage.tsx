import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@workos-inc/authkit-react";
import {
	ArrowLeft,
	Heart,
	Share2,
	Flag,
	Coins,
	User,
	Calendar,
	MapPin,
	Package,
	ChevronLeft,
	ChevronRight,
	Loader2,
	AlertCircle,
} from "lucide-react";
import { api } from "../lib/api-client";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

export function ItemDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [showSwapModal, setShowSwapModal] = useState(false);

	// Fetch item details
	const {
		data: itemData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["item", id],
		queryFn: () => api.items.getById(id!),
		enabled: !!id,
	});

	const item = itemData?.data;

	const pointsMap: Record<string, number> = {
		New: 50,
		"Like New": 40,
		Good: 30,
		Fair: 20,
		Poor: 10,
	};

	const points = item ? pointsMap[item.condition] || 0 : 0;

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
			</div>
		);
	}

	if (error || !item) {
		return (
			<div className="min-h-screen">
				<Header />
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
						<p className="text-gray-600">Item not found or error loading item</p>
						<Link to="/browse" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
							← Back to Browse
						</Link>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="pt-20">
				{/* Breadcrumb */}
				<div className="container mx-auto px-4 py-4">
					<Link
						to="/browse"
						className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Browse
					</Link>
				</div>

				<div className="container mx-auto px-4 pb-12">
					<div className="bg-white rounded-xl shadow-lg overflow-hidden">
						<div className="grid lg:grid-cols-2 gap-8 p-8">
							{/* Images Section */}
							<div>
								{/* Main Image */}
								<div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
									{item.images && item.images.length > 0 ? (
										<>
											<img
												src={item.images[currentImageIndex]}
												alt={item.title}
												className="w-full h-full object-cover"
											/>
											{item.images.length > 1 && (
												<>
													<button
														onClick={prevImage}
														className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
													>
														<ChevronLeft className="h-5 w-5" />
													</button>
													<button
														onClick={nextImage}
														className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
													>
														<ChevronRight className="h-5 w-5" />
													</button>
												</>
											)}
										</>
									) : (
										<div className="w-full h-full flex items-center justify-center text-gray-400">
											<Package className="h-16 w-16" />
										</div>
									)}
								</div>

								{/* Thumbnail Images */}
								{item.images && item.images.length > 1 && (
									<div className="grid grid-cols-5 gap-2">
										{item.images.map((image, index) => (
											<button
												key={index}
												onClick={() => setCurrentImageIndex(index)}
												className={cn(
													"aspect-square rounded-lg overflow-hidden border-2 transition-colors",
													currentImageIndex === index
														? "border-primary-600"
														: "border-transparent hover:border-gray-300",
												)}
											>
												<img src={image} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
											</button>
										))}
									</div>
								)}
							</div>

							{/* Details Section */}
							<div>
								{/* Category & Type */}
								<div className="flex items-center gap-2 mb-4">
									<span className="text-sm text-gray-500">{item.category}</span>
									<span className="text-gray-400">•</span>
									<span className="text-sm text-gray-500">{item.type}</span>
								</div>

								{/* Title */}
								<h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

								{/* Points & Condition */}
								<div className="flex items-center gap-6 mb-6">
									<div className="flex items-center gap-2">
										<Coins className="h-6 w-6 text-yellow-600" />
										<span className="text-2xl font-bold text-gray-900">{points} points</span>
									</div>
									<div className="px-4 py-2 bg-gray-100 rounded-full">
										<span className="text-sm font-medium text-gray-700">Condition: {item.condition}</span>
									</div>
								</div>

								{/* Size */}
								<div className="mb-6">
									<span className="text-sm text-gray-600">Size</span>
									<p className="text-lg font-semibold text-gray-900">{item.size}</p>
								</div>

								{/* Description */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
									<p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
								</div>

								{/* Tags */}
								{item.tags && item.tags.length > 0 && (
									<div className="mb-6">
										<div className="flex flex-wrap gap-2">
											{item.tags.map((tag) => (
												<span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
													#{tag}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex gap-4 mb-8">
									{user ? (
										<>
											<button
												className="flex-1 btn-primary flex items-center justify-center gap-2"
												onClick={() => setShowSwapModal(true)}
											>
												Request Swap
											</button>
											<button className="flex-1 btn-secondary flex items-center justify-center gap-2">
												<Coins className="h-5 w-5" />
												Redeem with Points
											</button>
										</>
									) : (
										<Link to="/login" className="flex-1 btn-primary text-center">
											Sign In to Swap or Redeem
										</Link>
									)}
								</div>

								{/* Quick Actions */}
								<div className="flex gap-4 text-sm">
									<button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
										<Heart className="h-4 w-4" />
										Save
									</button>
									<button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
										<Share2 className="h-4 w-4" />
										Share
									</button>
									<button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
										<Flag className="h-4 w-4" />
										Report
									</button>
								</div>
							</div>
						</div>

						{/* User Section */}
						<div className="border-t bg-gray-50 p-8">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">About the Seller</h3>
							<div className="bg-white rounded-lg p-6">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
										{item.user.name.charAt(0).toUpperCase()}
									</div>
									<div className="flex-1">
										<h4 className="text-lg font-semibold text-gray-900">{item.user.name}</h4>
										<div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
											<span className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												Member since {formatDate(item.createdAt)}
											</span>
										</div>
									</div>
									<Link
										to={`/users/${item.user.id}`}
										className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										View Profile
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
