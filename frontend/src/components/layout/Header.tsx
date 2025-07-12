import { Link } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="fixed top-0 left-0 right-0 z-50 glass-effect">
			<nav className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2">
						<Leaf className="h-8 w-8 text-primary-600" />
						<span className="text-2xl font-bold gradient-text">ReWear</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-8">
						<Link to="/browse" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
							Browse Items
						</Link>
						<Link to="/how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
							How It Works
						</Link>
						<Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
							About
						</Link>
						<Link to="/login" className="btn-outline">
							Sign In
						</Link>
						<Link to="/signup" className="btn-primary">
							Get Started
						</Link>
					</div>

					{/* Mobile Menu Toggle */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
					>
						{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>

				{/* Mobile Navigation */}
				<div
					className={cn(
						"md:hidden transition-all duration-300 overflow-hidden",
						isMenuOpen ? "max-h-96 mt-4" : "max-h-0",
					)}
				>
					<div className="flex flex-col space-y-4 pb-4">
						<Link
							to="/browse"
							className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
							onClick={() => setIsMenuOpen(false)}
						>
							Browse Items
						</Link>
						<Link
							to="/how-it-works"
							className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
							onClick={() => setIsMenuOpen(false)}
						>
							How It Works
						</Link>
						<Link
							to="/about"
							className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
							onClick={() => setIsMenuOpen(false)}
						>
							About
						</Link>
						<Link to="/login" className="btn-outline text-center" onClick={() => setIsMenuOpen(false)}>
							Sign In
						</Link>
						<Link to="/signup" className="btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
							Get Started
						</Link>
					</div>
				</div>
			</nav>
		</header>
	);
}
