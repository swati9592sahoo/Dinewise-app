import React, { useState, useEffect } from 'react';
import { Search, MapPin, Utensils, IndianRupee, Star, Tag, ChevronRight, Loader2, Navigation, Clock, Users, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getNearbyRestaurants, Restaurant } from './services/restaurantService';
import { cn } from './lib/utils';
import Markdown from 'react-markdown';

export default function App() {
  const [area, setArea] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [budget, setBudget] = useState('$$');
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [rawResponse, setRawResponse] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location", error)
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area && !userLocation) return;
    
    setLoading(true);
    try {
      const { restaurants: results, rawResponse: text } = await getNearbyRestaurants(
        area || "my current location",
        cuisine || "any",
        budget,
        userLocation || undefined
      );
      setRestaurants(results);
      setRawResponse(text);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200 pt-8 pb-12 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-2"
          >
            <Utensils size={14} />
            <span>Discover the best eats</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Dine<span className="text-orange-600">Wise</span>
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Find top-rated restaurants, signature dishes, and exclusive table booking deals in your area.
          </p>

          <form onSubmit={handleSearch} className="mt-8 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-xl border border-transparent focus-within:border-orange-200 transition-all">
              <MapPin className="text-slate-400 mr-2 shrink-0" size={18} />
              <input 
                type="text" 
                placeholder="Area (e.g. Indiranagar, Bangalore)" 
                className="bg-transparent w-full outline-none text-slate-700 placeholder:text-slate-400"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-xl border border-transparent focus-within:border-orange-200 transition-all">
              <Utensils className="text-slate-400 mr-2 shrink-0" size={18} />
              <input 
                type="text" 
                placeholder="Cuisine (e.g. Italian, North Indian)" 
                className="bg-transparent w-full outline-none text-slate-700 placeholder:text-slate-400"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
              />
            </div>
            <div className="flex items-center px-4 py-2 bg-slate-50 rounded-xl border border-transparent focus-within:border-orange-200 transition-all">
              <IndianRupee className="text-slate-400 mr-2 shrink-0" size={18} />
              <select 
                className="bg-transparent outline-none text-slate-700 appearance-none cursor-pointer pr-4"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="$">Budget ($)</option>
                <option value="$$">Mid-range ($$)</option>
                <option value="$$$">Fine Dining ($$$)</option>
                <option value="$$$$">Luxury ($$$$)</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              <span>Search</span>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600" size={24} />
              </div>
              <p className="text-slate-500 font-medium animate-pulse">Finding the best spots for you...</p>
            </motion.div>
          ) : restaurants.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {restaurants.map((restaurant, idx) => (
                <RestaurantCard key={idx} restaurant={restaurant} index={idx} />
              ))}
            </motion.div>
          ) : rawResponse ? (
            <motion.div 
              key="markdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 prose prose-slate max-w-none"
            >
              <Markdown>{rawResponse}</Markdown>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={32} />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Ready to explore?</h2>
              <p className="text-slate-500">Enter your preferences above to see recommendations.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="p-6 space-y-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1 text-orange-600 font-semibold">
                <Star size={14} fill="currentColor" />
                {restaurant.rating}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">{restaurant.priceLevel}</span>
              <span>•</span>
              <span>{restaurant.cuisine}</span>
            </div>
          </div>
          <a 
            href={restaurant.mapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
          >
            <Navigation size={20} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock size={14} className="text-orange-500" />
            <span>{restaurant.openTimings}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Ruler size={14} className="text-orange-500" />
            <span>{restaurant.distance} away</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Users size={14} className="text-orange-500" />
            <span className={cn(
              "font-medium",
              restaurant.crowdLevel.toLowerCase().includes('overcrowded') ? "text-red-600" : "text-green-600"
            )}>
              {restaurant.crowdLevel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock size={14} className="text-orange-500" />
            <span>Wait: {restaurant.minWaitTime}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-slate-500">
          <MapPin size={16} className="shrink-0 mt-0.5" />
          <span>{restaurant.address}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <IndianRupee size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. for 2</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{restaurant.maxSpendForTwo}</span>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Utensils size={12} /> Signature Dishes
          </h4>
          <div className="flex flex-wrap gap-2">
            {restaurant.bestDishes.map((dish, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                {dish}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Tag size={12} /> Booking Offers
          </h4>
          <div className="space-y-2">
            {restaurant.discounts.length > 0 ? (
              restaurant.discounts.map((offer, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-orange-600 shadow-sm border border-orange-100 uppercase">
                      {offer.platform.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{offer.platform}</p>
                      <p className="text-xs text-orange-700 font-medium">{offer.offer}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-orange-300" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No specific platform offers found. Check in-store for deals.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
