import React from 'react';

// src/pages/Home.jsx

const Home = () => {
  return (
    <section className="w-full min-h-screen flex items-start justify-center px-4 md:px-16 pt-4 font-sans overflow-hidden bg-white">
      <div className="w-full flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto h-auto md:h-[calc(100vh-64px)]">
        {/* Text Content */}
        <div className="max-w-xl space-y-8 text-left w-full md:w-1/2 md:pl-8 mt-0 md:mt-4">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900 mb-6">
            Technologically<br />
            driven <span className="text-black">Mental Health</span><br />
            Solution with AI
          </h1>
          <p className="text-base md:text-lg text-gray-500 mb-8 pl-2 md:pl-8">
            Streamlines interventions by consolidating them<br />
            within one platform, reducing the need for multiple point solutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="bg-black text-white px-7 py-3 rounded-full shadow-lg hover:bg-gray-900 transition font-semibold text-lg">
              Request Demo
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Approved by</span>
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                NHS
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom right content - smaller font and right aligned */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end space-y-1">
        <p className="text-xs text-gray-600 text-right">Towards a New<br />Holistic Healthstyle</p>
        <button className="text-xs text-gray-700 font-medium flex items-center gap-1 hover:underline">
          Explore Pillars →
        </button>
      </div>
    </section>
  );
};

export default Home;
