import { Button } from "@/components/ui/button"
import Link from "next/link"
import React, { useState, useEffect, useRef } from 'react'

/**
 * 1. REUSABLE ANIMATION COMPONENT
 * This wrapper triggers the fade-in/slide-up animation 
 * when the element enters the viewport.
 */
const RevealOnScroll = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Only animate once
        }
      },
      { threshold: 0.1 } // Trigger when 10% is visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function LandingPage({ onLoginClick }: {onLoginClick: () => void }) {
  return (
    <div className="min-h-screen w-full">

      <div className="relative w-full min-h-screen bg-gradient-to-br from-sky-100 via-emerald-50 to-slate-100 overflow-hidden">

        {/* 2. ANIMATED BACKGROUND BLOBS 
           Added 'animate-pulse' to make them breathe slowly.
        */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute -top-24 left-10 h-48 w-48 md:h-72 md:w-72 rounded-full bg-sky-200 opacity-40 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <span className="absolute top-1/3 right-0 h-60 w-60 md:h-80 md:w-80 rounded-full bg-emerald-200 opacity-40 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <span className="absolute bottom-0 left-1/3 h-48 w-48 md:h-64 md:w-64 rounded-full bg-indigo-200 opacity-30 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          <span className="absolute -bottom-20 -right-10 h-56 w-56 md:h-72 md:w-72 rounded-full bg-purple-200 opacity-30 blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        </div>

        <div className="relative z-10 flex flex-col">

          {/* 3. HERO SECTION (Wrapped in RevealOnScroll) */}
          <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-8 text-center text-black">
            <RevealOnScroll>
              <img src="/images/logo.png" alt="Ceros Logo" className="mx-auto mb-4 max-w-[150px] md:max-w-none hover:scale-105 transition-transform duration-300" />
              
              <div className="text-5xl md:text-8xl font-semibold">Ceros</div>
              
              <div className="text-xl md:text-4xl font-medium mt-4 md:mt-2 px-4">
                The chat-based solution for RONR meetings
              </div>

              <div className="flex flex-col md:flex-row justify-center items-center mt-10 gap-4 md:gap-6 w-full">
                <Button className="h-16 md:h-20 w-full md:w-48 text-xl md:text-2xl bg-green-200 hover:bg-green-300 hover:-translate-y-1 transition-all text-black rounded-3xl shadow-lg" onClick={onLoginClick}>
                  Get Started
                </Button>
                <Link href={`/docs/api`}>
                  <Button className="h-16 md:h-20 w-full md:w-52 text-xl md:text-2xl bg-gray-300 hover:bg-gray-400 hover:-translate-y-1 transition-all text-black rounded-3xl shadow-lg">
                    Documentation
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>
          </section>

          {/* 4. COMMITTEE SECTION (Wrapped in RevealOnScroll) */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-10 text-black">
            <RevealOnScroll>
              <h1 className="text-3xl md:text-5xl mb-8 md:mb-12 font-medium px-2">
                Add friends and create committees for online meetings.
              </h1>
            </RevealOnScroll>
            
            <RevealOnScroll delay={200}>
              <div className="min-w-full md:min-w-[80%] max-w-7xl backdrop-blur-md border rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-center md:p-0 gap-6 md:gap-10 hover:shadow-3xl transition-shadow duration-500 bg-white/30">
        
                <img src="/images/committee.png" className="w-full max-w-[200px] md:max-w-[80%] md:max-h-[70%] md:ml-auto mb-6 md:mb-0 object-contain hover:scale-105 transition-transform duration-500" alt="Construction" />
                
                <div className="flex flex-col justify-center w-full md:w-[40%] md:mr-4 md:ml-auto text-center md:text-left">
                  <h2 className="text-xl md:text-3xl font-medium">
                    Connect with friends, bring your team together, and effortlessly create committees…
                  </h2>
                </div>
              </div>
            </RevealOnScroll>
          </section>

          {/* 5. TOOLS SECTION (Wrapped in RevealOnScroll) */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-10 text-black">
            <RevealOnScroll>
              <h1 className="text-3xl md:text-5xl mb-8 md:mb-12 font-medium px-2">
                Collaboration Tools for Every Kind of Discussion
              </h1>
            </RevealOnScroll>

            <RevealOnScroll delay={200}>
              <div className="min-w-full md:min-w-[80%] max-w-7xl backdrop-blur-md border rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-center md:p-0 gap-6 md:gap-10 hover:shadow-3xl transition-shadow duration-500 bg-white/30">
                <img src="/images/chat.png" className="w-full max-w-[200px] md:max-w-[80%] md:max-h-[70%] md:ml-auto mb-6 md:mb-0 object-contain hover:scale-105 transition-transform duration-500" alt="Construction" />
                <div className="flex flex-col justify-center w-full md:w-[40%] md:mr-4 md:ml-auto text-center md:text-left">
                  <h2 className="text-xl md:text-3xl font-medium">
                    Streamline your committee work with motion creation, discussions, and voting…
                  </h2>
                </div>
              </div>
            </RevealOnScroll>
          </section>

          {/* 6. COMMUNITY SECTION (Wrapped in RevealOnScroll) */}
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center py-10 text-black">
            <RevealOnScroll>
              <h1 className="text-3xl md:text-5xl mb-8 md:mb-12 font-medium px-2">
                Join the Ceros Community!
              </h1>
            </RevealOnScroll>
            
            <RevealOnScroll delay={200}>
              <div className="min-w-full md:min-w-[80%] max-w-7xl backdrop-blur-md border rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-center md:p-0 gap-6 md:gap-10 hover:shadow-3xl transition-shadow duration-500 bg-white/30">
                <img src="/images/group-chat.png" className="w-full max-w-[200px] md:max-w-[80%] md:max-h-[70%] md:ml-auto mb-6 md:mb-0 object-contain hover:scale-105 transition-transform duration-500" alt="Construction" />
                <div className="flex flex-col justify-center w-full md:w-[40%] md:mr-4 md:ml-auto text-center md:text-left">
                  <h2 className="text-xl md:text-3xl font-medium">
                    Connect instantly with friends through fast, private direct messaging…
                  </h2>
                </div>
              </div>
            </RevealOnScroll>
          </section>

        </div>
      </div>
    </div>
  )
}