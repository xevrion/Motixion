import { motion } from "framer-motion";
import { ArrowRight, Github, Star, Flame, Trophy } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Notification Pill */}
          <motion.a
            href="https://github.com/xevrion/motixion"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-hover text-sm text-zinc-400 mb-8 group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            v2.0 is now live on GitHub
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6"
          >
            <span className="text-gradient">Forge Your Focus. Gamify Your Growth.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 text-balance"
          >
            The minimal accountability tracker for high-performers. Log habits, earn points, compete with friends, and redeem real rewards.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="/login" className="btn-primary text-base px-8 py-4">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/xevrion/motixion"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base px-8 py-4"
            >
              <Github className="w-5 h-5" />
              Star on GitHub
            </a>
          </motion.div>
        </div>

        {/* 3D Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 12 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-16 perspective-1000"
          style={{ perspective: '1000px' }}
        >
          <div 
            className="relative animate-float"
            style={{ transform: 'rotateX(8deg)' }}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent blur-3xl scale-110 -z-10" />
            
            {/* Dashboard Card */}
            <div className="glass rounded-2xl p-6 md:p-8 glow-emerald-subtle">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-zinc-950">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">John Doe</p>
                    <p className="text-sm text-zinc-500">Level 24</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <Flame className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-500">5-Day Streak</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Tasks Crushed", value: "147", icon: Trophy },
                  { label: "XP Earned", value: "2,450", icon: Star },
                  { label: "Focus Hours", value: "86h", icon: Flame },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-800/50 border border-white/5">
                    <stat.icon className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Daily Progress</span>
                  <span className="text-emerald-500 font-medium">78%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1.2, delay: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

