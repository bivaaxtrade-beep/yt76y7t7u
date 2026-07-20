import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Carlos Mendez",
    role: "Professional Trader",
    location: "Madrid, Spain",
    text: "Bivaax has completely transformed my trading workflow. The dynamic range indicators are incredibly precise, and the execution speed is the best I've experienced in 5 years of retail trading.",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Lawson",
    role: "Full-time Investor",
    location: "London, UK",
    text: "What sets Bivaax apart is the transparency. Withdrawals are processed almost instantly, which is rare these days. The mobile terminal is slick and never lags during high volatility.",
    rating: 5
  },
  {
    id: 3,
    name: "Jiaxing Wang",
    role: "Part-time Trader",
    location: "Singapore",
    text: "As someone who works full-time, the copy trading feature is a lifesaver. I can follow professional strategies with just a few clicks. My portfolio has grown 15% in just two months.",
    rating: 4
  },
  {
    id: 4,
    name: "Elena Petrov",
    role: "Day Trader",
    location: "Berlin, Germany",
    text: "The educational resources on Bivaax are top-notch. I went from a complete novice to understanding complex Fibonacci retracements in weeks. Highly recommended for beginners.",
    rating: 5
  }
];

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevStep = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const testimonial = testimonials[index];

  return (
    <section className="bg-[#111216] py-24 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffcf00]/5 blur-[120px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ffcf00]/5 blur-[120px] rounded-full -ml-64 -mb-64" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#ffcf00]/10 px-4 py-1.5 rounded-full border border-[#ffcf00]/20 text-[#ffcf00] mb-4 text-xs font-semibold uppercase tracking-wider">
            <Star size={14} className="fill-[#ffcf00]" />
            Success Stories
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Trusted by <span className="text-[#ffcf00]">thousands</span> of traders.
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
            Real feedback from professional and retail traders who have found their edge using Bivaax's advanced terminal.
          </p>
        </div>

        <div className="relative min-h-[400px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={testimonial.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full"
            >
              <div className="bg-[#1c1d22] border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative">
                <Quote className="absolute top-8 left-8 text-[#ffcf00]/10" size={80} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        className={i < testimonial.rating ? "text-[#ffcf00] fill-[#ffcf00]" : "text-gray-600"} 
                      />
                    ))}
                  </div>

                  <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8 italic">
                    "{testimonial.text}"
                  </blockquote>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#ffcf00] rounded-2xl flex items-center justify-center mb-4 text-[#1c1d22] font-black text-xl shadow-lg shadow-[#ffcf00]/20">
                      {testimonial.name.charAt(0)}
                    </div>
                    <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-16 z-20">
            <button
              onClick={prevStep}
              className="w-12 h-12 rounded-full bg-[#1c1d22] border border-white/5 flex items-center justify-center text-white hover:text-[#ffcf00] hover:border-[#ffcf00]/30 transition-all shadow-xl"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-16 z-20">
            <button
              onClick={nextStep}
              className="w-12 h-12 rounded-full bg-[#1c1d22] border border-white/5 flex items-center justify-center text-white hover:text-[#ffcf00] hover:border-[#ffcf00]/30 transition-all shadow-xl"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-[#ffcf00]" : "w-2 bg-white/10 hover:bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
