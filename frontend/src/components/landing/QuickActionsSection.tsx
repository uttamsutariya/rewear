import { Link } from "react-router-dom";
import { ArrowRight, Package, Search, Plus } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-react";

export function QuickActionsSection() {
	const { user } = useAuth();

	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started in 3 Easy Steps</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Join thousands of users who are already swapping clothes and building a sustainable wardrobe
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{/* Start Swapping */}
					<Link
						to="/browse"
						className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center hover:scale-105"
					>
						<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
							<ArrowRight className="h-8 w-8 text-primary-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Start Swapping</h3>
						<p className="text-gray-600 mb-4">
							Discover amazing pre-loved items from our community and start your sustainable fashion journey
						</p>
						<span className="inline-flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all">
							Get Started
							<ArrowRight className="h-4 w-4" />
						</span>
					</Link>

					{/* Browse Items */}
					<Link
						to="/browse"
						className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center hover:scale-105"
					>
						<div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors">
							<Search className="h-8 w-8 text-secondary-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Items</h3>
						<p className="text-gray-600 mb-4">
							Explore thousands of quality items in various categories, sizes, and styles to find your perfect match
						</p>
						<span className="inline-flex items-center gap-2 text-secondary-600 font-medium group-hover:gap-3 transition-all">
							Browse Now
							<ArrowRight className="h-4 w-4" />
						</span>
					</Link>

					{/* List an Item */}
					<Link
						to={user ? "/dashboard" : "/login"}
						className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center hover:scale-105"
					>
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
							<Plus className="h-8 w-8 text-green-600" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">List an Item</h3>
						<p className="text-gray-600 mb-4">
							Share your pre-loved clothes with the community and earn points for every item you give away
						</p>
						<span className="inline-flex items-center gap-2 text-green-600 font-medium group-hover:gap-3 transition-all">
							Start Listing
							<ArrowRight className="h-4 w-4" />
						</span>
					</Link>
				</div>

				{/* Additional CTA */}
				<div className="text-center mt-12">
					<p className="text-gray-600 mb-4">Ready to join the sustainable fashion revolution?</p>
					{!user && (
						<Link
							to="/signup"
							className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
						>
							Create Your Account
							<ArrowRight className="h-5 w-5" />
						</Link>
					)}
				</div>
			</div>
		</section>
	);
}
