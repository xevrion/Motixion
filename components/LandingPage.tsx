import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  Trophy, 
  LineChart, 
  Sparkles, 
  TrendingUp, 
  Target,
  Zap,
  BarChart3,
  CheckCircle2,
  Star,
  Github
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const handleEnter = () => {
    window.location.href = '/login';
  };

  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.3 });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Animated Background Gradient */}
      <motion.div
        style={{ y: backgroundY, opacity }}
        className="fixed inset-0 -z-10 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] md:w-[1200px] md:h-[600px] bg-emerald-500/20 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[200px] md:w-[800px] md:h-[400px] bg-teal-500/10 rounded-full blur-[60px] md:blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[150px] md:w-[600px] md:h-[300px] bg-blue-500/10 rounded-full blur-[50px] md:blur-[80px]" />
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-zinc-900/50 backdrop-blur-xl bg-zinc-950/80 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 text-sm sm:text-base"
            >
              M
            </motion.div>
            <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Motixion
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              className="text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 sm:gap-2"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-24 md:pb-32 overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 md:space-y-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-900/80 border border-emerald-500/20 text-xs sm:text-sm font-medium text-emerald-400 backdrop-blur-sm max-w-full">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex-shrink-0"
            >
              <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" fill="currentColor" />
            </motion.div>
            <span className="whitespace-nowrap">Open Source • Free Forever</span>
            <span className="hidden sm:inline whitespace-nowrap">• Built for High Performers</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1] px-2"
          >
            <span className="block text-white">Forge Your</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 animate-gradient">
              Focus. Gamify
            </span>
            <span className="block text-white">Your Growth.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed px-2"
          >
            The minimal accountability tracker for high-performers. Log habits, earn points, compete with friends, and redeem real rewards.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base sm:text-lg shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 sm:gap-3 group"
            >
              Get Started Free
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={18} className="sm:w-5 sm:h-5" />
              </motion.div>
            </motion.button>
            <motion.a
              href="https://github.com/xevrion/motixion" 
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm"
            >
              <Github size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">View on GitHub</span>
              <span className="sm:hidden">GitHub</span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 md:mt-24 max-w-7xl mx-auto px-4 sm:px-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl sm:rounded-2xl bg-zinc-900/80 border border-zinc-800/50 p-2 sm:p-3 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl"
          >
            <div className="rounded-lg sm:rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative aspect-[16/9] md:aspect-[21/9]">
              <div className="absolute inset-0 flex">
                <div className="w-48 sm:w-64 border-r border-zinc-900 bg-zinc-950/80 hidden lg:flex flex-col p-4 sm:p-6 gap-3 sm:gap-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500/20 rounded-lg animate-pulse"></div>
                    <div className="h-3 sm:h-4 w-16 sm:w-24 bg-zinc-800 rounded"></div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-8 sm:h-10 w-full bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                  ></motion.div>
                  <div className="space-y-1.5 sm:space-y-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        className="h-6 sm:h-8 w-full bg-zinc-900 rounded-lg"
                      ></motion.div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 content-start">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className={`h-24 sm:h-28 md:h-32 bg-zinc-900/50 rounded-lg sm:rounded-xl border border-zinc-800 flex flex-col justify-between p-3 sm:p-4 ${i === 4 ? 'col-span-2 md:col-span-2' : ''}`}
                    >
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 ${i % 2 === 0 ? 'bg-emerald-500/20' : 'bg-orange-500/20'} rounded-lg mb-1 sm:mb-2`}></div>
                      <div className="h-6 sm:h-8 bg-zinc-800 rounded"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        variants={containerVariants}
        className="py-12 sm:py-16 md:py-20 bg-zinc-900/30 border-y border-zinc-900/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { icon: Users, value: "100%", label: "Free & Open Source" },
              { icon: Trophy, value: "∞", label: "Unlimited Rewards" },
              { icon: TrendingUp, value: "24/7", label: "Always Available" },
              { icon: Star, value: "100%", label: "Privacy First" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-emerald-500/30 transition-all backdrop-blur-sm"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4"
                >
                  <stat.icon className="text-emerald-400 w-5 h-5 sm:w-6 sm:h-6" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={statsInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs sm:text-sm text-zinc-400 leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 sm:py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={featuresInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-3 sm:mb-4"
            >
              <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">Features</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Stay Accountable
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto px-2">
              Built for those who refuse to settle for mediocrity.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          >
            {[
              {
                icon: Users,
                title: "Radical Accountability",
                desc: "Link accounts with a friend. See their dashboard. If you slack off, they'll know instantly. No hiding.",
                iconBg: "bg-emerald-500/10",
                iconBorder: "border-emerald-500/20",
                iconColor: "text-emerald-400",
                hoverBorder: "group-hover:border-emerald-500/50",
              },
              {
                icon: Trophy,
                title: "Real Stakes Rewards",
                desc: "Set point costs for real-world treats like movies or cheat meals. Earn your leisure time.",
                iconBg: "bg-orange-500/10",
                iconBorder: "border-orange-500/20",
                iconColor: "text-orange-400",
                hoverBorder: "group-hover:border-orange-500/50",
              },
              {
                icon: LineChart,
                title: "Data-Driven Insights",
                desc: "Track wake times, deep work hours, and task completion rates with beautiful, instant analytics.",
                iconBg: "bg-blue-500/10",
                iconBorder: "border-blue-500/20",
                iconColor: "text-blue-400",
                hoverBorder: "group-hover:border-blue-500/50",
              },
              {
                icon: Target,
                title: "Streak Tracking",
                desc: "Build consistency with daily streaks. Watch your current streak grow and beat your personal best.",
                iconBg: "bg-purple-500/10",
                iconBorder: "border-purple-500/20",
                iconColor: "text-purple-400",
                hoverBorder: "group-hover:border-purple-500/50",
              },
              {
                icon: BarChart3,
                title: "Leaderboards",
                desc: "Compete with friends on daily and total points. See who's on top and push yourself harder.",
                iconBg: "bg-teal-500/10",
                iconBorder: "border-teal-500/20",
                iconColor: "text-teal-400",
                hoverBorder: "group-hover:border-teal-500/50",
              },
              {
                icon: Zap,
                title: "Instant Notifications",
                desc: "Get daily reminders to log your activity. Never miss a day with smart push notifications.",
                iconBg: "bg-yellow-500/10",
                iconBorder: "border-yellow-500/20",
                iconColor: "text-yellow-400",
                hoverBorder: "group-hover:border-yellow-500/50",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={featureVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-6 sm:p-7 md:p-8 rounded-xl sm:rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all backdrop-blur-sm"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.iconBg} rounded-lg sm:rounded-xl ${feature.iconBorder} flex items-center justify-center mb-4 sm:mb-6 ${feature.hoverBorder} transition-all`}
                >
                  <feature.icon className={`${feature.iconColor} w-6 h-6 sm:w-7 sm:h-7`} />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        ref={ctaRef}
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        variants={containerVariants}
        className="py-16 sm:py-24 md:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div variants={itemVariants}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4 sm:mb-6"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Sparkles className="text-emerald-400 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
            </motion.div>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 px-2"
          >
            Ready to Level Up?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto px-2"
          >
            Join high-performers who are already using Motixion to stay accountable and achieve their goals.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base sm:text-lg shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 sm:gap-3 group"
            >
              Start Your Journey
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={18} className="sm:w-5 sm:h-5" />
              </motion.div>
            </motion.button>
            <motion.a
              href="https://github.com/xevrion/motixion"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm"
            >
              <Github size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Star on GitHub</span>
              <span className="sm:hidden">GitHub</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-zinc-900/50 py-8 sm:py-10 md:py-12 bg-zinc-950/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded flex items-center justify-center font-bold text-zinc-950 text-xs">
              M
            </div>
            <span className="text-zinc-500 font-medium text-sm sm:text-base">
              Motixion &copy; {new Date().getFullYear()}
            </span>
          </motion.div>
          <div className="flex gap-6 sm:gap-8 text-xs sm:text-sm text-zinc-500">
            {/* <motion.a
              href="#"
              whileHover={{ scale: 1.1, color: "#10b981" }}
              className="hover:text-emerald-400 transition-colors"
            >
              Privacy
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1, color: "#10b981" }}
              className="hover:text-emerald-400 transition-colors"
            >
              Terms
            </motion.a> */}
            <motion.a
              href="https://github.com/xevrion/motixion"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, color: "#10b981" }}
              className="hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              <Github size={16} />
              GitHub
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};




