import React from "react";

// Example component demonstrating the use of new theme utilities
export const ThemeExamples = () => {
  return (
    <div className="space-y-8">
      {/* Example 1: Dark theme section with typography */}
      <section className="theme-dark prose p-8 font-inter rounded-lg">
        <h1>Welcome to LogYourBody</h1>
        <h2>Track Your Progress</h2>
        <h3>Body Composition Analysis</h3>
        <p>
          Monitor your body fat percentage, muscle mass, and weight trends with
          our advanced tracking system. Our app uses scientific methods to help
          you achieve your fitness goals.
        </p>
      </section>

      {/* Example 2: Light theme section */}
      <section className="theme-light prose p-8 font-inter rounded-lg shadow-lg">
        <h2>Your Health Journey</h2>
        <p>
          Start tracking your body metrics today and see how your body
          composition changes over time. Our intuitive interface makes it easy
          to log your measurements.
        </p>
      </section>

      {/* Example 3: Using custom colors directly */}
      <div className="bg-magic-blue text-mercury-white p-6 rounded-lg font-inter">
        <h3 className="text-2xl font-bold mb-4">Premium Features</h3>
        <p className="text-mercury-white/90">
          Unlock advanced analytics, HealthKit integration, and unlimited
          tracking with our premium subscription.
        </p>
      </div>

      {/* Example 4: Card with custom styling */}
      <div className="bg-mercury-white text-nordic-gray p-6 rounded-lg shadow-md font-inter">
        <h3 className="text-xl font-semibold mb-2">Daily Metrics</h3>
        <p className="text-text-secondary">
          Log your weight and body fat percentage daily to see trends and
          patterns in your health journey.
        </p>
        <button className="mt-4 bg-magic-blue text-mercury-white px-4 py-2 rounded hover:bg-magic-blue/90 transition-colors">
          Add Today's Measurement
        </button>
      </div>

      {/* Example 5: Mixed usage with responsive design */}
      <section className="theme-light md:theme-dark prose p-4 md:p-8 font-inter rounded-lg transition-all">
        <h2>Responsive Design</h2>
        <p>
          This section switches from light theme on mobile to dark theme on
          desktop. Try resizing your browser to see the effect.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-magic-blue/10 p-4 rounded">
            <h3 className="text-magic-blue">Feature 1</h3>
            <p>Track weight changes over time</p>
          </div>
          <div className="bg-magic-blue/10 p-4 rounded">
            <h3 className="text-magic-blue">Feature 2</h3>
            <p>Analyze body composition trends</p>
          </div>
        </div>
      </section>

      {/* Example 6: Using Inter font with different weights */}
      <div className="bg-nordic-gray text-mercury-white p-6 rounded-lg font-inter">
        <h2 className="text-3xl font-extrabold mb-2">Font Weights</h2>
        <p className="font-normal mb-1">Normal weight (400)</p>
        <p className="font-medium mb-1">Medium weight (500)</p>
        <p className="font-semibold mb-1">Semibold weight (600)</p>
        <p className="font-bold">Bold weight (700)</p>
      </div>

      {/* Example 7: Complex layout with all utilities combined */}
      <article className="theme-dark prose font-inter p-8 rounded-xl">
        <header className="border-b border-mercury-white/20 pb-4 mb-6">
          <h1 className="text-mercury-white">Your Body Metrics</h1>
          <p className="text-text-secondary mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
          <div className="bg-mercury-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-mercury-white mb-2">Weight</h3>
            <p className="text-2xl font-bold text-magic-blue">175 lbs</p>
            <p className="text-text-secondary text-sm mt-1">-2.5 lbs this week</p>
          </div>
          
          <div className="bg-mercury-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-mercury-white mb-2">Body Fat</h3>
            <p className="text-2xl font-bold text-magic-blue">18.5%</p>
            <p className="text-text-secondary text-sm mt-1">-0.8% this month</p>
          </div>
          
          <div className="bg-mercury-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-mercury-white mb-2">Muscle Mass</h3>
            <p className="text-2xl font-bold text-magic-blue">142 lbs</p>
            <p className="text-text-secondary text-sm mt-1">+1.2 lbs this month</p>
          </div>
        </div>
        
        <footer className="mt-8 pt-4 border-t border-mercury-white/20">
          <p className="text-text-secondary text-sm">
            Keep up the great work! Your consistency is paying off.
          </p>
        </footer>
      </article>
    </div>
  );
};