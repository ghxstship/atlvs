'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 2,
  prefix = '',
  suffix = ''
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

interface PricingCardAnimationProps {
  children: React.ReactNode;
  index: number;
  isPopular?: boolean;
}

export const PricingCardAnimation: React.FC<PricingCardAnimationProps> = ({
  children,
  index,
  isPopular = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: isPopular ? -8 : -4,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

interface FeatureListAnimationProps {
  children: React.ReactNode;
  delay?: number;
}

export const FeatureListAnimation: React.FC<FeatureListAnimationProps> = ({
  children,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        delay: delay + 0.3,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

interface SectionAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionAnimation: React.FC<SectionAnimationProps> = ({
  children,
  className = ''
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

interface TestimonialAnimationProps {
  children: React.ReactNode;
  index: number;
}

export const TestimonialAnimation: React.FC<TestimonialAnimationProps> = ({
  children,
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut'
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

interface FAQAnimationProps {
  children: React.ReactNode;
  index: number;
}

export const FAQAnimation: React.FC<FAQAnimationProps> = ({
  children,
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      whileHover={{
        x: 4,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

interface PulseAnimationProps {
  children: React.ReactNode;
  delay?: number;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut'
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredListAnimationProps {
  children: React.ReactNode[];
  className?: string;
}

export const StaggeredListAnimation: React.FC<StaggeredListAnimationProps> = ({
  children,
  className = ''
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{
            duration: 0.4,
            ease: 'easeOut'
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
