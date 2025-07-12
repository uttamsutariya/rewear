import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ArrowRight, Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api-client";
import type { ApiResponse, FeaturedItem } from "../../types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function FeaturedItems() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["featured-items"],
		queryFn: async () => {
			const response = await api.items.getFeatured();
			return response.data as ApiResponse<FeaturedItem[]>;
		},
	});

	if (isLoading) {
		return (
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-center h-96">
						<Loader2 className="w-8 h-8 animate-spin text-primary-600" />
					</div>
				</div>
			</section>
		);
	}

	if (error || !data?.data || data.data.length === 0) {
		return null;
	}

	const items = data.data;

	return (
		<section className="py-20 bg-gray-50">
			<div className="container mx-auto px-4">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">
						Featured <span className="gradient-text">Items</span>
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Discover handpicked pre-loved fashion pieces from our community
					</p>
				</div>

				{/* Carousel */}
				<div className="relative">
					<Swiper
						modules={[Navigation, Pagination, Autoplay]}
						spaceBetween={24}
						slidesPerView={1}
						navigation={{
							prevEl: ".swiper-button-prev",
							nextEl: ".swiper-button-next",
						}}
						pagination={{
							clickable: true,
							dynamicBullets: true,
						}}
						autoplay={{
							delay: 5000,
							disableOnInteraction: false,
						}}
						breakpoints={{
							640: {
								slidesPerView: 2,
							},
							768: {
								slidesPerView: 3,
							},
							1024: {
								slidesPerView: 4,
							},
						}}
						className="pb-12"
					>
						{items.map((item) => (
							<SwiperSlide key={item.id}>
								<Link to={`/items/${item.id}`} className="block group">
									<div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
										{/* Image */}
										<div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
											{item.images[0] ? (
												<img
													src={item.images[0]}
													alt={item.title}
													className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
											)}

											{/* Wishlist Button */}
											<button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
												<Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
											</button>

											{/* Size Badge */}
											<div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
												Size {item.size}
											</div>
										</div>

										{/* Content */}
										<div className="p-4">
											<h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{item.title}</h3>
											<p className="text-sm text-gray-600">by {item.user.name}</p>
										</div>
									</div>
								</Link>
							</SwiperSlide>
						))}
					</Swiper>

					{/* Custom Navigation Buttons */}
					<button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow z-10">
						<ArrowRight className="w-5 h-5 rotate-180 text-gray-700" />
					</button>
					<button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow z-10">
						<ArrowRight className="w-5 h-5 text-gray-700" />
					</button>
				</div>

				{/* CTA */}
				<div className="text-center mt-12">
					<Link to="/browse" className="btn-primary inline-flex items-center group">
						View All Items
						<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Link>
				</div>
			</div>
		</section>
	);
}
