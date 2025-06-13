"use client";

import { useState, useEffect } from "react";

export default function CheckoutForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    inmateName: "",
    inmateId: "",
    inmateLocation: "",
    facilityName: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [config, setConfig] = useState({
    price: "20",
    currency: "USD",
    productName: "Direct Connect Access",
  });

  // Fetch configuration on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const configData = await response.json();
          setConfig(configData);
        }
      } catch (err) {
        console.error("Failed to fetch config:", err);
        // Keep default values if fetch fails
      }
    };

    fetchConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe checkout immediately for all customers
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 lock-icon">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Get Started Today
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Complete your information below to begin your secure connection
          service
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Required Fields Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
            <svg
              className="w-4 h-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span>
              <span className="text-red-500 font-medium">*</span> indicates
              required fields
            </span>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-slate-900"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Address */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Connection Details Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inmate Name */}
              <div className="space-y-2">
                <label
                  htmlFor="inmateName"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Inmate Name
                </label>
                <input
                  type="text"
                  id="inmateName"
                  name="inmateName"
                  value={formData.inmateName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                  placeholder="Enter inmate's full name"
                />
              </div>

              {/* Inmate ID */}
              <div className="space-y-2">
                <label
                  htmlFor="inmateId"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Inmate ID
                </label>
                <input
                  type="text"
                  id="inmateId"
                  name="inmateId"
                  value={formData.inmateId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                  placeholder="Enter inmate ID number"
                />
              </div>
            </div>

            {/* Inmate Location */}
            <div className="space-y-2">
              <label
                htmlFor="inmateLocation"
                className="block text-sm font-semibold text-slate-900"
              >
                Inmate Location
              </label>
              <input
                type="text"
                id="inmateLocation"
                name="inmateLocation"
                value={formData.inmateLocation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                placeholder="Enter facility name and location"
              />
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-3 bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full submit-btn text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-[1.02] disabled:scale-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    ></path>
                  </svg>
                  <span>Checkout for ${config.price}</span>
                </div>
              )}
            </button>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-3 text-slate-600 bg-slate-50 rounded-xl p-4">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-sm font-medium">
              Secured by Stripe • 256-bit SSL encryption
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
