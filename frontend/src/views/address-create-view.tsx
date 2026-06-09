import React, { useState } from 'react';
import { AddressService } from "@/services/gym-service";
import { useLocation } from "wouter";

export default function AddressCreateView() {
  const [address, setAddress] = useState({ city: '', street: '', building_number: '', postal_code: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [, setLocation] = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    const payload = {
      ...address,
      building_number: parseInt(address.building_number, 10) || 0 
    };

    try {
      await AddressService.add(payload);
      
      setMessage({ type: 'success', text: 'Address created successfully!' });
      setAddress({ city: '', street: '', building_number: '', postal_code: '' });
      setLocation("/addresses");
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save address.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Address</h2>
      
      {message.text && (
        <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4">
        {/* City Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleChange}
            required
            placeholder="e.g., Warsaw"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Street Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Street</label>
          <input
            type="text"
            name="street"
            value={address.street}
            onChange={handleChange}
            required
            placeholder="e.g., Pulawska"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Building Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Building Number</label>
          <input
            type="number"
            name="building_number"
            value={address.building_number}
            onChange={handleChange}
            required
            placeholder="e.g., 1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Postal code input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code</label>
          <input
            type="text"
            name="postal_code"
            value={address.postal_code}
            onChange={handleChange}
            required
            placeholder="e.g., 00-000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition duration-200 ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md'
          }`}
        >
          {loading ? 'Saving to Database...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}