import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Recycle } from "lucide-react";

export function HeroSection() {
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
					<div className="space-y-8">
						<div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
							<Sparkles className="w-4 h-4" />
							Sustainable Fashion Exchange
						</div>

						<h1 className="text-5xl lg:text-6xl font-bold leading-tight">
							Give Your Clothes a <span className="gradient-text">Second Life</span>
						</h1>

						<p className="text-xl text-gray-600 leading-relaxed">
							Join the sustainable fashion revolution. Swap, share, and discover pre-loved clothing while earning points
							for every item you give away.
						</p>

						{/* CTAs */}
						<div className="flex flex-col sm:flex-row gap-4">
							<Link to="/signup" className="btn-primary inline-flex items-center justify-center group">
								Start Swapping
								<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
							</Link>
							<Link to="/browse" className="btn-outline inline-flex items-center justify-center">
								Browse Items
							</Link>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-8 pt-8">
							<div className="text-center sm:text-left">
								<div className="text-3xl font-bold text-primary-600">5K+</div>
								<div className="text-sm text-gray-600">Active Users</div>
							</div>
							<div className="text-center sm:text-left">
								<div className="text-3xl font-bold text-primary-600">15K+</div>
								<div className="text-sm text-gray-600">Items Swapped</div>
							</div>
							<div className="text-center sm:text-left">
								<div className="text-3xl font-bold text-primary-600">95%</div>
								<div className="text-sm text-gray-600">Happy Swappers</div>
							</div>
						</div>
					</div>

					{/* Visual */}
					<div className="relative lg:block hidden">
						<div className="relative w-full h-[600px]">
							{/* Mockup Cards */}
							<div className="absolute top-0 right-0 w-64 h-80 bg-white rounded-2xl shadow-2xl p-4 transform rotate-6 hover:rotate-3 transition-transform">
								<div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4" />
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded w-3/4" />
									<div className="h-3 bg-gray-100 rounded w-1/2" />
								</div>
							</div>

							<div className="absolute top-20 left-0 w-64 h-80 bg-white rounded-2xl shadow-2xl p-4 transform -rotate-6 hover:-rotate-3 transition-transform">
								<div className="h-48 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg mb-4" />
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded w-3/4" />
									<div className="h-3 bg-gray-100 rounded w-1/2" />
								</div>
							</div>

							<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-80 bg-white rounded-2xl shadow-2xl p-4 transform hover:scale-105 transition-transform">
								<div className="h-48 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-lg mb-4" />
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded w-3/4" />
									<div className="h-3 bg-gray-100 rounded w-1/2" />
								</div>
							</div>

							{/* Feature Badges */}
							<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white rounded-full p-3 shadow-lg">
								<Users className="w-6 h-6 text-primary-600" />
							</div>
							<div className="absolute bottom-10 -right-4 bg-white rounded-full p-3 shadow-lg">
								<Recycle className="w-6 h-6 text-secondary-600" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
