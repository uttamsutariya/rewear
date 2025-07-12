import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Recycle } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-react";

export function HeroSection() {
	const { user } = useAuth();

	return (
		<section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
			{/* Background Gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />

			{/* Floating Elements */}
			<div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-float" />
			<div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl animate-float-delay" />

			<div className="container mx-auto px-4 relative z-10">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Content */}
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-primary-700 shadow-sm">
							<Sparkles className="h-4 w-4" />
							Sustainable Fashion Exchange
						</div>

						<h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
							Give Your Clothes a <span className="gradient-text">Second Life</span>
						</h1>

						<p className="text-xl text-gray-600 leading-relaxed">
							Join our community of conscious fashion lovers. Swap, share, and discover pre-loved clothing while earning
							points for every item you give away.
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4">
							{user ? (
								<>
									<Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
										Go to Dashboard
										<ArrowRight className="h-5 w-5" />
									</Link>
									<Link to="/browse" className="btn-outline inline-flex items-center gap-2">
										Browse Items
									</Link>
								</>
							) : (
								<>
									<Link to="/signup" className="btn-primary inline-flex items-center gap-2">
										Start Swapping
										<ArrowRight className="h-5 w-5" />
									</Link>
									<Link to="/browse" className="btn-outline inline-flex items-center gap-2">
										Browse Items
									</Link>
								</>
							)}
						</div>

						{/* Stats */}
						<div className="flex gap-8 pt-8">
							<div>
								<div className="flex items-center gap-2 text-gray-900">
									<Users className="h-5 w-5 text-primary-600" />
									<span className="text-3xl font-bold">5K+</span>
								</div>
								<p className="text-sm text-gray-600">Active Users</p>
							</div>
							<div>
								<div className="flex items-center gap-2 text-gray-900">
									<Recycle className="h-5 w-5 text-primary-600" />
									<span className="text-3xl font-bold">15K+</span>
								</div>
								<p className="text-sm text-gray-600">Items Swapped</p>
							</div>
						</div>
					</div>

					{/* Visual Element */}
					<div className="relative">
						<div className="relative grid grid-cols-2 gap-4">
							{/* Item Cards Mock */}
							<div className="space-y-4">
								<div className="bg-white rounded-2xl shadow-xl p-4 transform rotate-3 hover:rotate-0 transition-transform">
									<div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3" />
									<h3 className="font-semibold">Vintage Denim</h3>
									<p className="text-sm text-gray-600">Size M • Like New</p>
									<div className="mt-2 flex items-center gap-1">
										<span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">30 points</span>
									</div>
								</div>
								<div className="bg-white rounded-2xl shadow-xl p-4 transform -rotate-2 hover:rotate-0 transition-transform">
									<div className="aspect-square bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-3" />
									<h3 className="font-semibold">Summer Dress</h3>
									<p className="text-sm text-gray-600">Size S • Good</p>
									<div className="mt-2 flex items-center gap-1">
										<span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">25 points</span>
									</div>
								</div>
							</div>
							<div className="space-y-4 pt-8">
								<div className="bg-white rounded-2xl shadow-xl p-4 transform -rotate-3 hover:rotate-0 transition-transform">
									<div className="aspect-square bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg mb-3" />
									<h3 className="font-semibold">Leather Boots</h3>
									<p className="text-sm text-gray-600">Size 39 • New</p>
									<div className="mt-2 flex items-center gap-1">
										<span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">50 points</span>
									</div>
								</div>
								<div className="bg-white rounded-2xl shadow-xl p-4 transform rotate-2 hover:rotate-0 transition-transform">
									<div className="aspect-square bg-gradient-to-br from-red-100 to-pink-100 rounded-lg mb-3" />
									<h3 className="font-semibold">Cozy Sweater</h3>
									<p className="text-sm text-gray-600">Size L • Fair</p>
									<div className="mt-2 flex items-center gap-1">
										<span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">20 points</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
