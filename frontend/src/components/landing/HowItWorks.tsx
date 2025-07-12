import { Upload, Search, ArrowLeftRight, Coins } from "lucide-react";

const steps = [
	{
		icon: Upload,
		title: "List Your Items",
		description: "Upload photos of clothes you no longer wear. Set them free to find a new home!",
		color: "primary",
	},
	{
		icon: Search,
		title: "Browse & Discover",
		description: "Explore a curated collection of pre-loved fashion from our community members.",
		color: "secondary",
	},
	{
		icon: ArrowLeftRight,
		title: "Swap or Redeem",
		description: "Trade directly with others or use your earned points to get items you love.",
		color: "primary",
	},
	{
		icon: Coins,
		title: "Earn Points",
		description: "Every item you give away earns you points based on its condition and desirability.",
		color: "secondary",
	},
];

export function HowItWorks() {
	return (
		<section className="py-20 bg-white">
			<div className="container mx-auto px-4">
				{/* Section Header */}
				<div className="text-center mb-16">
					<h2 className="text-4xl font-bold mb-4">
						How <span className="gradient-text">ReWear</span> Works
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Join thousands who are already giving their clothes a second chance
					</p>
				</div>

				{/* Steps Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{steps.map((step, index) => {
						const Icon = step.icon;
						const isPrimary = step.color === "primary";

						return (
							<div key={index} className="relative group">
								{/* Connector Line (except last item) */}
								{index < steps.length - 1 && (
									<div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-100 -translate-x-1/2" />
								)}

								<div className="text-center space-y-4">
									{/* Icon */}
									<div className="relative inline-flex">
										<div
											className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
												isPrimary
													? "bg-primary-100 group-hover:bg-primary-200"
													: "bg-secondary-100 group-hover:bg-secondary-200"
											}`}
										>
											<Icon className={`w-12 h-12 ${isPrimary ? "text-primary-600" : "text-secondary-600"}`} />
										</div>

										{/* Step Number */}
										<div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center font-bold text-gray-700">
											{index + 1}
										</div>
									</div>

									{/* Content */}
									<div className="space-y-2">
										<h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
										<p className="text-gray-600 leading-relaxed">{step.description}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Visual Divider */}
				<div className="mt-20 mb-16 relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-200" />
					</div>
					<div className="relative flex justify-center">
						<span className="bg-white px-6 text-sm text-gray-500">It's that simple!</span>
					</div>
				</div>

				{/* Benefits Grid */}
				<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					<div className="text-center">
						<div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
						<div className="text-gray-600">Sustainable Fashion</div>
					</div>
					<div className="text-center">
						<div className="text-4xl font-bold text-secondary-600 mb-2">0</div>
						<div className="text-gray-600">Transaction Fees</div>
					</div>
					<div className="text-center">
						<div className="text-4xl font-bold text-primary-600 mb-2">∞</div>
						<div className="text-gray-600">Wardrobe Possibilities</div>
					</div>
				</div>
			</div>
		</section>
	);
}
