
import React, { useState, useEffect } from 'react';
import { AppTab, LocationData } from './types';
import { searchLocation, getElevationAtCoords } from './services/geminiService';
import StatusBar from './components/StatusBar';
import TopBar from './components/TopBar';
import MapDisplay from './components/MapDisplay';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.KAART);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData>({
    elevation: 15.3,
    name: "Assen",
    region: "Drenthe",
    coords: { lat: 52.99, lng: 6.57 }
  });
  const [pinPos, setPinPos] = useState<{ x: number, y: number } | null>({ x: 65, y: 35 });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const data = await searchLocation(searchQuery);
    if (data) {
      updateLocationState(data);
    }
    setLoading(false);
  };

  const updateLocationState = (data: LocationData) => {
    setLocation(data);
    const x = ((data.coords.lng - 3.3) / (7.2 - 3.3)) * 100;
    const y = (1 - (data.coords.lat - 50.7) / (53.5 - 50.7)) * 100;
    setPinPos({ x, y });
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setLoading(true);
    const x = ((lng - 3.3) / (7.2 - 3.3)) * 100;
    const y = (1 - (lat - 50.7) / (53.5 - 50.7)) * 100;
    setPinPos({ x, y });

    const data = await getElevationAtCoords(lat, lng);
    if (data) {
      setLocation(data);
    }
    setLoading(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation wordt niet ondersteund door je browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const data = await getElevationAtCoords(latitude, longitude);
      if (data) {
        updateLocationState(data);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      alert("Kon je locatie niet ophalen.");
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center sm:p-4 md:p-8">
      {/* Smartphone Frame - Alleen zichtbaar op grotere schermen (>640px) */}
      <div className="relative w-full h-screen sm:w-[375px] sm:h-[812px] bg-black sm:rounded-[60px] shadow-2xl overflow-hidden sm:border-[8px] border-black sm:ring-4 ring-gray-900 ring-inset transition-all duration-500">
        
        {/* Notch Area - Alleen op desktop-view om de 'phone' look te behouden */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-[100] items-center justify-end px-6">
           <div className="w-12 h-1 bg-gray-900 rounded-full mr-1"></div>
        </div>

        {/* App Main Body */}
        <div className="flex flex-col h-full bg-white relative">
          {/* Status bar is leuk voor de mock, op mobiel vult de echte OS bar dit in */}
          <div className="sm:block hidden"><StatusBar /></div>
          {/* Extra padding bovenop voor mobiel ivm iOS status bar */}
          <div className="sm:hidden h-10 bg-white"></div>
          
          <TopBar />

          {/* Search Bar Container */}
          <div className="px-5 py-3 bg-white/60 backdrop-blur-md flex gap-2">
            <form onSubmit={handleSearch} className="relative group flex-1">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek locatie..."
                className="w-full bg-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border-none"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
            <button 
              onClick={useCurrentLocation}
              className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-transform"
              title="Mijn Locatie"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Map Section */}
          <MapDisplay onMapClick={handleMapClick} selectedPos={pinPos} />

          {/* Loading Indicator Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-3xl shadow-2xl flex items-center space-x-3">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-gray-700">NAP Hoogte ophalen...</span>
              </div>
            </div>
          )}

          {/* Information Card */}
          <div className="absolute bottom-24 left-5 right-5 z-40">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                    <span className="text-blue-600">{location.elevation > 0 ? '+' : ''}{location.elevation.toFixed(1)} M</span> NAP
                  </h2>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      {location.name}, {location.region}
                    </p>
                    <p className="text-xs font-mono text-gray-400">
                      {location.coords.lat.toFixed(4)}° N, {location.coords.lng.toFixed(4)}° O
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${location.elevation < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {location.elevation < 0 ? 'ONDER NAP' : 'BOVEN NAP'}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="bg-white border-t border-gray-100 flex items-center justify-around pb-safe pt-3 px-4 z-50">
            {[
              { id: AppTab.KAART, label: 'Kaart', icon: 'M9 20l-5.447-2.724A2 2 0 013 15.485V6.414m12.922 13.586L21 17.276A2 2 0 0022 15.485V6.414m-11.078 13.586l-1.922-1.28A2 2 0 019 18.33V6.414' },
              { id: AppTab.PROFIEL, label: 'Profiel', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: AppTab.INSTELLINGEN, label: 'Instellingen', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 px-4 py-1 transition-all duration-300 ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-200 rounded-full z-50 opacity-20 sm:block hidden"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
