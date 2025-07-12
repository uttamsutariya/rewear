import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Upload,
	X,
	Plus,
	Loader2,
	CheckCircle,
	AlertCircle,
	ChevronRight,
	ChevronLeft,
	Shirt,
	Package,
	Sparkles,
	Tag,
} from "lucide-react";
import { api } from "../../lib/api-client";
import { cn } from "../../lib/utils";

interface FormData {
	title: string;
	description: string;
	category: string;
	type: string;
	size: string;
	condition: string;
	tags: string[];
	images: string[];
}

// Static options for the form - matching backend schema
const CATEGORIES = ["Men", "Women", "Kids", "Unisex"];

const TYPES = ["Shirt", "Pants", "Dress", "Jacket", "Shoes", "Accessories", "Other"];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

// Helper to determine which types are suitable for each category
const getTypesForCategory = (category: string): string[] => {
	switch (category) {
		case "Men":
			return ["Shirt", "Pants", "Jacket", "Shoes", "Accessories", "Other"];
		case "Women":
			return ["Shirt", "Pants", "Dress", "Jacket", "Shoes", "Accessories", "Other"];
		case "Kids":
			return ["Shirt", "Pants", "Dress", "Jacket", "Shoes", "Accessories", "Other"];
		case "Unisex":
			return ["Shirt", "Pants", "Jacket", "Accessories", "Other"];
		default:
			return TYPES;
	}
};

export function UploadItemForm() {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState(1);
	const [uploadedImages, setUploadedImages] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		category: "",
		type: "",
		size: "",
		condition: "",
		tags: [],
		images: [],
	});

	// We can still fetch from API to get the latest options, but use static as fallback
	const { data: constants } = useQuery({
		queryKey: ["item-constants"],
		queryFn: () => api.items.getConstants(),
		staleTime: 5 * 60 * 1000, // Cache for 5 minutes
	});

	// Create item mutation
	const createItemMutation = useMutation({
		mutationFn: (data: FormData) => api.items.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			// Reset form
			setFormData({
				title: "",
				description: "",
				category: "",
				type: "",
				size: "",
				condition: "",
				tags: [],
				images: [],
			});
			setUploadedImages([]);
			setCurrentStep(1);
			alert("Item uploaded successfully! It will be available after admin approval.");
		},
		onError: (error: any) => {
			alert(error.message || "Failed to upload item");
		},
	});

	// Handle image upload
	const handleImageUpload = async (files: FileList) => {
		if (files.length === 0) return;
		if (uploadedImages.length + files.length > 5) {
			alert("Maximum 5 images allowed");
			return;
		}

		setIsUploading(true);
		const formData = new FormData();

		Array.from(files).forEach((file) => {
			formData.append("images", file);
		});

		try {
			const response = await api.upload.images(formData);
			if (response.success) {
				setUploadedImages([...uploadedImages, ...response.data.urls]);
			}
		} catch (error) {
			alert("Failed to upload images");
		} finally {
			setIsUploading(false);
		}
	};

	// Handle form submission
	const handleSubmit = () => {
		createItemMutation.mutate({
			...formData,
			images: uploadedImages,
		});
	};

	// Add tag
	const addTag = () => {
		const trimmedTag = tagInput.trim().toLowerCase();
		if (
			trimmedTag &&
			trimmedTag.length >= 2 &&
			trimmedTag.length <= 20 &&
			!formData.tags.includes(trimmedTag) &&
			formData.tags.length < 10
		) {
			setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
			setTagInput("");
		}
	};

	// Remove tag
	const removeTag = (tagToRemove: string) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const steps = [
		{ number: 1, title: "Images", icon: Upload },
		{ number: 2, title: "Details", icon: Shirt },
		{ number: 3, title: "Category", icon: Package },
		{ number: 4, title: "Review", icon: CheckCircle },
	];

	const isStepValid = (step: number) => {
		switch (step) {
			case 1:
				return uploadedImages.length > 0;
			case 2:
				return formData.title.length >= 3 && formData.description.length >= 10 && formData.tags.length > 0;
			case 3:
				return formData.category && formData.type && formData.size && formData.condition;
			case 4:
				return true;
			default:
				return false;
		}
	};

	const canProceed = isStepValid(currentStep);

	return (
		<div className="p-8">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Item</h2>

			{/* Progress Steps */}
			<div className="flex items-center justify-between mb-8">
				{steps.map((step, index) => (
					<div key={step.number} className="flex items-center">
						<div
							className={cn(
								"flex items-center justify-center w-10 h-10 rounded-full transition-colors",
								currentStep === step.number
									? "bg-primary-600 text-white"
									: currentStep > step.number
									? "bg-green-600 text-white"
									: "bg-gray-200 text-gray-600",
							)}
						>
							{currentStep > step.number ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
						</div>
						<span
							className={cn(
								"ml-2 text-sm font-medium",
								currentStep === step.number ? "text-primary-600" : "text-gray-500",
							)}
						>
							{step.title}
						</span>
						{index < steps.length - 1 && <ChevronRight className="mx-4 h-5 w-5 text-gray-400" />}
					</div>
				))}
			</div>

			{/* Step Content */}
			<div className="bg-gray-50 rounded-lg p-6 mb-6">
				{/* Step 1: Images */}
				{currentStep === 1 && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Upload Images</h3>
						<p className="text-sm text-gray-600 mb-6">
							Add up to 5 photos of your item. The first image will be the main photo.
						</p>

						{/* Upload Area */}
						<div className="mb-6">
							<label
								className={cn(
									"block w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
									isUploading
										? "border-gray-300 bg-gray-100 cursor-not-allowed"
										: "border-gray-300 hover:border-primary-400 hover:bg-primary-50",
								)}
							>
								<input
									type="file"
									multiple
									accept="image/*"
									onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
									className="hidden"
									disabled={isUploading || uploadedImages.length >= 5}
								/>
								{isUploading ? (
									<div className="flex flex-col items-center">
										<Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-2" />
										<span className="text-sm text-gray-600">Uploading...</span>
									</div>
								) : (
									<div className="flex flex-col items-center">
										<Upload className="h-12 w-12 text-gray-400 mb-2" />
										<span className="text-sm text-gray-600">Click or drag images here to upload</span>
										<span className="text-xs text-gray-500 mt-1">{5 - uploadedImages.length} images remaining</span>
									</div>
								)}
							</label>
						</div>

						{/* Uploaded Images */}
						{uploadedImages.length > 0 && (
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
								{uploadedImages.map((url, index) => (
									<div key={index} className="relative group">
										<img src={url} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
										{index === 0 && (
											<span className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
												Main
											</span>
										)}
										<button
											onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
											className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Step 2: Details */}
				{currentStep === 2 && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Item Details</h3>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="e.g., Vintage Denim Jacket"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
									maxLength={100}
								/>
								<p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Describe your item in detail..."
									rows={4}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
									maxLength={1000}
								/>
								<p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Tags *</label>
								<p className="text-xs text-gray-500 mb-2">Add at least one tag (2-20 characters each)</p>
								<div className="flex gap-2 mb-2">
									<input
										type="text"
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
										placeholder="Add tags..."
										className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
										disabled={formData.tags.length >= 10}
										maxLength={20}
									/>
									<button
										onClick={addTag}
										disabled={!tagInput.trim() || tagInput.trim().length < 2 || formData.tags.length >= 10}
										className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
									>
										<Plus className="h-5 w-5" />
									</button>
								</div>
								<div className="flex flex-wrap gap-2">
									{formData.tags.map((tag) => (
										<span
											key={tag}
											className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
										>
											<Tag className="h-3 w-3" />
											{tag}
											<button onClick={() => removeTag(tag)} className="ml-1 hover:text-primary-900">
												<X className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
								{formData.tags.length === 0 && (
									<p className="text-xs text-red-500 mt-1">At least one tag is required</p>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Step 3: Category */}
				{currentStep === 3 && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Category & Specifications</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
								<select
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value, type: "" })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="">Select category</option>
									{CATEGORIES.map((cat) => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
								<select
									value={formData.type}
									onChange={(e) => setFormData({ ...formData, type: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
									disabled={!formData.category}
								>
									<option value="">Select type</option>
									{formData.category &&
										getTypesForCategory(formData.category).map((type) => (
											<option key={type} value={type}>
												{type}
											</option>
										))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
								<select
									value={formData.size}
									onChange={(e) => setFormData({ ...formData, size: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="">Select size</option>
									{SIZES.map((size) => (
										<option key={size} value={size}>
											{size}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
								<select
									value={formData.condition}
									onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="">Select condition</option>
									{CONDITIONS.map((condition) => (
										<option key={condition} value={condition}>
											{condition}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Condition Guide */}
						<div className="mt-6 p-4 bg-blue-50 rounded-lg">
							<h4 className="text-sm font-semibold text-blue-900 mb-2">Condition Guide</h4>
							<ul className="text-xs text-blue-800 space-y-1">
								<li>
									<strong>New:</strong> Never worn, with tags (50 points)
								</li>
								<li>
									<strong>Like New:</strong> Worn once or twice, perfect condition (40 points)
								</li>
								<li>
									<strong>Good:</strong> Gently used, minor signs of wear (30 points)
								</li>
								<li>
									<strong>Fair:</strong> Used with visible wear (20 points)
								</li>
								<li>
									<strong>Poor:</strong> Heavy wear but still usable (10 points)
								</li>
							</ul>
						</div>
					</div>
				)}

				{/* Step 4: Review */}
				{currentStep === 4 && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Review Your Listing</h3>

						<div className="bg-white rounded-lg p-6">
							{/* Images Preview */}
							<div className="mb-6">
								<h4 className="text-sm font-semibold text-gray-700 mb-2">Images</h4>
								<div className="flex gap-2 overflow-x-auto">
									{uploadedImages.map((url, index) => (
										<img
											key={index}
											src={url}
											alt={`Preview ${index + 1}`}
											className="w-20 h-20 object-cover rounded"
										/>
									))}
								</div>
							</div>

							{/* Details */}
							<div className="space-y-3">
								<div>
									<h4 className="text-sm font-semibold text-gray-700">Title</h4>
									<p className="text-gray-900">{formData.title}</p>
								</div>

								<div>
									<h4 className="text-sm font-semibold text-gray-700">Description</h4>
									<p className="text-gray-900">{formData.description}</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<h4 className="text-sm font-semibold text-gray-700">Category</h4>
										<p className="text-gray-900">{formData.category}</p>
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-700">Type</h4>
										<p className="text-gray-900">{formData.type}</p>
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-700">Size</h4>
										<p className="text-gray-900">{formData.size}</p>
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-700">Condition</h4>
										<p className="text-gray-900">{formData.condition}</p>
									</div>
								</div>

								{formData.tags.length > 0 && (
									<div>
										<h4 className="text-sm font-semibold text-gray-700">Tags</h4>
										<div className="flex flex-wrap gap-2 mt-1">
											{formData.tags.map((tag) => (
												<span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
													{tag}
												</span>
											))}
										</div>
									</div>
								)}
							</div>

							<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<div className="flex gap-2">
									<AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
									<div className="text-sm text-yellow-800">
										<p className="font-semibold">Before you submit:</p>
										<ul className="list-disc list-inside mt-1">
											<li>Your item will be reviewed by our admin team</li>
											<li>Once approved, it will be visible to all users</li>
											<li>You'll earn points when someone redeems your item</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Navigation Buttons */}
			<div className="flex justify-between">
				<button
					onClick={() => setCurrentStep(currentStep - 1)}
					disabled={currentStep === 1}
					className={cn(
						"flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
						currentStep === 1
							? "bg-gray-100 text-gray-400 cursor-not-allowed"
							: "bg-gray-200 text-gray-700 hover:bg-gray-300",
					)}
				>
					<ChevronLeft className="h-5 w-5" />
					Previous
				</button>

				{currentStep < 4 ? (
					<button
						onClick={() => setCurrentStep(currentStep + 1)}
						disabled={!canProceed}
						className={cn(
							"flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
							canProceed
								? "bg-primary-600 text-white hover:bg-primary-700"
								: "bg-gray-300 text-gray-500 cursor-not-allowed",
						)}
					>
						Next
						<ChevronRight className="h-5 w-5" />
					</button>
				) : (
					<button
						onClick={handleSubmit}
						disabled={createItemMutation.isPending}
						className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
					>
						{createItemMutation.isPending ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin" />
								Uploading...
							</>
						) : (
							<>
								<Sparkles className="h-5 w-5" />
								Submit Item
							</>
						)}
					</button>
				)}
			</div>
		</div>
	);
}
