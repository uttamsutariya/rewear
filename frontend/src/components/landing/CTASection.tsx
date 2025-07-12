import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
	return (
		<section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 relative overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-4xl mx-auto text-center">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
						<Sparkles className="w-4 h-4" />
						Join the Movement
					</div>

					{/* Heading */}
					<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Wardrobe?</h2>

					{/* Description */}
					<p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
						Start swapping today and be part of a community that's changing fashion, one piece at a time. Your first
						swap is just a click away!
					</p>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							to="/signup"
							className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 inline-flex items-center justify-center group"
						>
							Get Started Free
							<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Link>
						<Link
							to="/browse"
							className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 hover:scale-105 transform transition-all duration-200 shadow-lg"
						>
							Start Exploring
							<ArrowRight className="h-5 w-5" />
						</Link>
					</div>

					{/* Trust Indicators */}
					<div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80 text-sm">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span>No hidden fees</span>
						</div>
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span>Secure swaps</span>
						</div>
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							<span>Join 5000+ members</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
