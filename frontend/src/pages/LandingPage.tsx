import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { HeroSection } from "../components/landing/HeroSection";
import { QuickActionsSection } from "../components/landing/QuickActionsSection";
import { FeaturedItems } from "../components/landing/FeaturedItems";
import { HowItWorks } from "../components/landing/HowItWorks";
import { CTASection } from "../components/landing/CTASection";
import { useAuth } from "@workos-inc/authkit-react";

export function LandingPage() {
	const { user } = useAuth();
	console.log("user ::", user);

	return (
		<div className="min-h-screen bg-white">
			<Header />
			<main>
				<HeroSection />
				<QuickActionsSection />
				<FeaturedItems />
				<HowItWorks />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
