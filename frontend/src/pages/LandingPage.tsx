import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/landing/HeroSection";
import { FeaturedItems } from "../components/landing/FeaturedItems";
import { HowItWorks } from "../components/landing/HowItWorks";
import { CTASection } from "../components/landing/CTASection";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			<Header />
			<main>
				<HeroSection />
				<FeaturedItems />
				<HowItWorks />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
