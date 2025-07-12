import { Link } from "react-router-dom";
import { Menu, X, Leaf, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@workos-inc/authkit-react";
import { cn } from "../../lib/utils";

export function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { user, isLoading, signOut } = useAuth();

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
							Browse
						</Link>
						<Link to="/how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
							How It Works
						</Link>
						<Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
							About
						</Link>
					</div>

					{/* Auth Buttons - Desktop */}
					<div className="hidden md:flex items-center space-x-4">
						{isLoading ? (
							<div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
						) : user ? (
							<div className="flex items-center space-x-4">
								<Link to="/dashboard" className="btn-primary">
									Dashboard
								</Link>
								<div className="relative group">
									<button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
										<div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
											{user.email?.charAt(0).toUpperCase()}
										</div>
									</button>
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
										<Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
											<User className="h-4 w-4 mr-2" />
											My Dashboard
										</Link>
										<button
											onClick={() => signOut()}
											className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50"
										>
											<LogOut className="h-4 w-4 mr-2" />
											Sign Out
										</button>
									</div>
								</div>
							</div>
						) : (
							<>
								<Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
									Sign In
								</Link>
								<Link to="/signup" className="btn-primary">
									Get Started
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
						{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
						<div className="space-y-2">
							<Link
								to="/browse"
								className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							>
								Browse
							</Link>
							<Link
								to="/how-it-works"
								className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							>
								How It Works
							</Link>
							<Link
								to="/about"
								className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
							>
								About
							</Link>
							<hr className="my-2" />
							{user ? (
								<>
									<Link
										to="/dashboard"
										className="block px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
									>
										Dashboard
									</Link>
									<button
										onClick={() => signOut()}
										className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
									>
										Sign Out
									</button>
								</>
							) : (
								<>
									<Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
										Sign In
									</Link>
									<Link
										to="/signup"
										className="block px-4 py-2 bg-primary-600 text-white text-center rounded-lg hover:bg-primary-700"
									>
										Get Started
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
