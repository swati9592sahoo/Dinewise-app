import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Restaurant {
  name: string;
  rating: number;
  priceLevel: string;
  cuisine: string;
  address: string;
  bestDishes: string[];
  discounts: {
    platform: string;
    offer: string;
  }[];
  mapsUrl: string;
  maxSpendForTwo: string;
  openTimings: string;
  distance: string;
  minWaitTime: string;
  crowdLevel: string;
}

export async function getNearbyRestaurants(
  area: string,
  cuisine: string,
  budget: string,
  location?: { lat: number; lng: number }
): Promise<{ restaurants: Restaurant[]; rawResponse: string }> {
  const prompt = `Find the best ${cuisine} restaurants in ${area} with a budget of ${budget}. 
  For each restaurant, provide:
  1. Name
  2. Rating
  3. Price Level ($, $$, $$$, $$$$)
  4. Signature/Best Dishes
  5. Table booking discounts available on platforms like Zomato, Dineout, EazyDiner, or Swiggy SteppinOut.
  6. Maximum spend amount for 2 people (e.g., "₹2500")
  7. Restaurant open timings (e.g., "11:00 AM - 11:30 PM")
  8. Distance from ${area} or current location (e.g., "2.5 km")
  9. Minimum wait time (e.g., "15-20 mins")
  10. Crowd gathering status (e.g., "Overcrowded", "Normal Crowded", "Quiet")
  
  Format the output as a JSON array of objects with keys: name, rating, priceLevel, cuisine, address, bestDishes (array), discounts (array of {platform, offer}), mapsUrl, maxSpendForTwo, openTimings, distance, minWaitTime, crowdLevel.`;

  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng,
        },
      },
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config,
  });

  // Extract JSON from response.text
  const text = response.text || "";
  let restaurants: Restaurant[] = [];
  
  try {
    // Try to find JSON block
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      restaurants = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse restaurants JSON", e);
  }

  return { restaurants, rawResponse: text };
}
