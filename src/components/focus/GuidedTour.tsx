"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";

export const TOUR_STEPS = [
  {
    target: "#tour-timer",
    title: "Draggable Timer",
    description: "This is your core focus engine. Click the numbers to set a custom time, and drag it anywhere on the screen!",
  },
  {
    target: "#tour-dock",
    title: "Productivity Dock",
    description: "Access your Notes, Tasks, Music, and Friends here without leaving your study space.",
  },
  {
    target: "#tour-header",
    title: "Your Account",
    description: "Log in here to save your coins, unlock marketplace themes, and study with friends.",
  }
];

export function GuidedTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [bounds, setBounds] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isActive, setIsActive] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only show once
    const hasSeenTour = localStorage.getItem("promodo_tour_seen");
    if (!hasSeenTour) {
      // Slight delay to let UI render
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (!isActive || !isMounted) return;

    const updateBounds = () => {
      const step = TOUR_STEPS[currentStep];
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setBounds({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [currentStep, isActive]);

  const endTour = () => {
    setIsActive(false);
    localStorage.setItem("promodo_tour_seen", "true");
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  if (!isActive || !isMounted) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* Overlay with a hole. Using SVG for crisp cut-out */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              animate={{
                x: bounds.left - 16,
                y: bounds.top - 16,
                width: bounds.width + 32,
                height: bounds.height + 32,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              fill="black"
              rx="24"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tour-mask)" />
      </svg>

      {/* Tooltip Dialog */}
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bg-white text-black p-6 rounded-2xl shadow-2xl max-w-sm pointer-events-auto"
          style={{
            // Position it intelligently based on the target position
            top: bounds.top > window.innerHeight / 2 ? bounds.top - 200 : bounds.top + bounds.height + 40,
            left: Math.max(20, Math.min(bounds.left, window.innerWidth - 400)),
          }}
        >
          <button onClick={endTour} className="absolute top-4 right-4 text-gray-400 hover:text-black">
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
            Tip {currentStep + 1} of {TOUR_STEPS.length}
          </div>
          <h3 className="text-lg font-bold mb-2">{step.title}</h3>
          <p className="text-sm text-gray-600 mb-6">{step.description}</p>
          
          <button 
            onClick={nextStep}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {currentStep === TOUR_STEPS.length - 1 ? "Get Started" : "Next"} <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
