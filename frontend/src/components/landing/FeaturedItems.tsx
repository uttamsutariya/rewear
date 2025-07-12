import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ArrowRight, Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api-client";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function FeaturedItems() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["featured-items"],
		queryFn: async () => {
			const response = await api.items.getFeatured();
			return response;
		},
	});

	if (isLoading) {
		return (
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-primary-600" />
					</div>
				</div>
			</section>
		);
	}

	if (error || !data?.data) {
		return null;
	}

	const items = data.data;

	return (
		<section className="py-20 bg-gray-50">
			<div className="container mx-auto px-4">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">Featured Items</h2>
					<p className="text-xl text-gray-600">Discover amazing pieces from our community</p>
				</div>

				{/* Carousel */}
				<div className="relative">
					<Swiper
						modules={[Navigation, Pagination, Autoplay]}
						spaceBetween={30}
						slidesPerView={1}
						navigation
						pagination={{ clickable: true }}
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
						className="featured-swiper"
					>
						{items.map((item) => (
							<SwiperSlide key={item.id}>
								<Link to={`/items/${item.id}`} className="block group">
									<div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
										{/* Image */}
										<div className="relative aspect-square overflow-hidden">
											<img
												src={item.images[0]}
												alt={item.title}
												className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
											/>
											<button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
												<Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
											</button>
										</div>

										{/* Content */}
										<div className="p-4">
											<h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.title}</h3>
											<p className="text-sm text-gray-600 mb-2">Size: {item.size}</p>
											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-500">by {item.user.name}</span>
												<ArrowRight className="h-4 w-4 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
											</div>
										</div>
									</div>
								</Link>
							</SwiperSlide>
						))}
					</Swiper>
				</div>

				{/* Browse All Button */}
				<div className="text-center mt-12">
					<Link to="/browse" className="btn-primary inline-flex items-center gap-2">
						Browse All Items
						<ArrowRight className="h-5 w-5" />
					</Link>
				</div>
			</div>
		</section>
	);
}
