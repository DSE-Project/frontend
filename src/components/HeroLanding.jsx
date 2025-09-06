import React from "react";
import heroCityImage from "../assets/hero_city.jpg"; // Import the image

// Usage: <HeroLanding /> or <HeroLanding bgUrl="/src/assets/hero_city.jpg" />


const HeroLanding = ({
  titleLeft = "Precise forecasts,",
  titleRight = "precisely for you.", 
  cta = "Let's start!",
  bgUrl,
}) => {
  const fallback = heroCityImage; // Use imported image
  const background = bgUrl || fallback;

  return (
    <section className="relative rounded-[28px] overflow-hidden h-[84vh] min-h-[560px] w-full">
      {/* Background (image) */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${background})` }} // Use the background variable
        aria-hidden
      />
      {/* Soft dark overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/45" />

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-white/95 font-semibold leading-tight drop-shadow-md
                       text-4xl sm:text-5xl lg:text-6xl">
          <span>{titleLeft}</span> <span className="text-white">•</span>{" "}
          <span className="whitespace-nowrap">{titleRight}</span>
        </h1>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="mt-7 backdrop-blur-md bg-white/20 hover:bg-white/25 border border-white/30
                     text-white rounded-full px-6 py-3 text-base sm:text-lg font-semibold
                     flex items-center gap-3 transition"
        >
          {cta}
          <span className="h-8 w-8 rounded-full bg-white/30 border border-white/20
                           flex items-center justify-center">➜</span>
        </button>
      </div>
    </section>
  );
};

export default HeroLanding;
