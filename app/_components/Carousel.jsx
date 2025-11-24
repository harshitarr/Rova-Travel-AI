"use client";
import { useState, useRef, useId, useEffect } from "react";
import { slideData, overlayContent } from "./constants";

// --- Inline SVG for Arrow Icon (Replaces IconArrowNarrowRight) ---
const ArrowRightSVG = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M5 12l14 0"></path>
    <path d="M15 16l4 -4"></path>
    <path d="M15 8l4 4"></path>
  </svg>
);

// --- Slide Component (Helper) ---
const Slide = ({
  slide,
  index,
  current,
  handleSlideClick,
  onExploreClick
}) => {
  const slideRef = useRef(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      // Update CSS variables for parallax effect
      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event) => {
    const el = slideRef.current;
    if (!el) return;

    // Calculate mouse position relative to the center of the slide
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    // Reset parallax on mouse leave
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, button, title } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[70vmin] h-[70vmin] mx-[4vmin] z-10 cursor-pointer"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          // Apply 3D rotation and scale based on active state
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}>
        <div
          className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-[1%] overflow-hidden transition-all duration-150 ease-out"
          style={{
            // Apply parallax translation to the inner image container
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}>
          <img
            className="absolute inset-0 w-[120%] h-[120%] object-cover opacity-100 transition-opacity duration-600 ease-in-out"
            style={{
              opacity: current === index ? 1 : 0.5,
            }}
            alt={title}
            src={src}
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync" />
          {current === index && (
            <div className="absolute inset-0 bg-black/30 transition-all duration-1000" />
          )}
        </div>

        <article
          className={`relative p-[4vmin] transition-opacity duration-1000 ease-in-out ${
            current === index ? "opacity-100 visible" : "opacity-0 invisible"
          }`}>
          <h2 className="text-lg md:text-2xl lg:text-4xl font-semibold relative drop-shadow-lg">
            {title}
          </h2>
          <div className="flex justify-center">
            <button
              onClick={() => onExploreClick(slide)}
              className="mt-6 px-4 py-2 w-fit mx-auto text-black bg-white h-12 border border-transparent text-xs font-medium flex justify-center items-center rounded-full hover:bg-gray-100 transition duration-200 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.3)]">
              {button}
            </button>
          </div>
        </article>
      </li>
    </div>
  );
};

// --- CarouselControl Component (Helper) ---
const CarouselControl = ({
  type,
  title,
  handleClick
}) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full focus:ring-4 focus:ring-indigo-500 focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}>
      <ArrowRightSVG className="text-neutral-600 dark:text-neutral-200" />
    </button>
  );
};

// --- Carousel Component (Inner Logic) ---
function Carousel({ slides, onExploreClick }) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  // We remove the useId hook here because the heading ID is generated by the parent (InteractiveCarousel)

  return (
    <div
      className="relative w-[70vmin] h-[70vmin] mx-auto"
      // Removed aria-labelledby since the heading is in the parent.
    >
      <ul
        className="absolute flex transition-transform duration-1000 ease-in-out"
        // Dynamic transform to shift the slides list horizontally
        style={{
          width: `${slides.length * 100}%`,
          transform: `translateX(-${(current / slides.length) * 100}%)`,
        }}>
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
            onExploreClick={onExploreClick} />
        ))}
      </ul>
      <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick} />

        <CarouselControl type="next" title="Go to next slide" handleClick={handleNextClick} />
      </div>
    </div>
  );
}

// Export the main component for the page.jsx to import
export function InteractiveCarousel() {
  const [overlayData, setOverlayData] = useState(null);
  
  const handleExploreClick = (slide) => {
    setOverlayData(overlayContent[slide.title] || null);
  };
  
  const closeOverlay = () => {
    setOverlayData(null);
  };

  const id = useId();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center py-20 overflow-x-hidden">
      
      {/* 🌟 OVERALL HEADING PLACEMENT HERE 🌟 */}
      <h2 
        id={`carousel-heading-${id}`} 
        className="text-4xl md:text-5xl font-bold text-center mb-4 dark:text-white text-gray-800"
      >
        Some <span className="text-[#F472B6]">Dream</span> Places to Visit
      </h2>
      <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">Still confused where to go? Take a look at some of these amazing destinations.</p>

      <Carousel slides={slideData} onExploreClick={handleExploreClick} />
      
      {/* Overlay Component */}
      {overlayData && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeOverlay}>
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-3xl font-bold text-gray-800">{overlayData.title}</h3>
              <button 
                onClick={closeOverlay}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            {/* Content Grid */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {overlayData.images.map((item, index) => (
                  <div key={index} className="text-center space-y-4">
                    {/* Heading */}
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">{item.title}</h4>
                    
                    {/* Image */}
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <img 
                        src={item.src} 
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed px-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}