import React from 'react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import SocialProofSection from './SocialProofSection';
import FeaturesGrid from './FeaturesGrid';
import HowItWorksSection from './HowItWorksSection';
import ComparisonSection from './ComparisonSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import Footer from './Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <SocialProofSection />
        <FeaturesGrid />
        <HowItWorksSection />
        <ComparisonSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};
