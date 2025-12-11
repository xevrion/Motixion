import { motion } from "framer-motion";
import { Clock, Gift, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Clock,
    title: "Plan & Execute",
    description: "Set your missions for the day. Activate Focus Mode with integrated Pomodoro timers to lock in deep work sessions.",
    visual: (
      <div className="relative w-full max-w-xs mx-auto">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-32 h-32 mx-auto rounded-full border-4 border-emerald-500 flex items-center justify-center relative mb-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">24:58</span>
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-emerald-500"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              style={{ clipPath: "polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)" }}
            />
          </div>
          <p className="text-sm text-zinc-400">Deep Work Session</p>
        </div>
      </div>
    ),
  },
  {
    icon: Gift,
    title: "Verify & Reward",
    description: "Complete your missions and earn XP. Redeem points for real-life treats—guilt-free pizza nights, movies, and more.",
    visual: (
      <div className="w-full max-w-xs mx-auto">
        <div className="glass rounded-2xl p-4 space-y-3">
          {[
            { name: "Pizza Night 🍕", points: 500, available: true },
            { name: "Movie Break 🎬", points: 300, available: true },
            { name: "Sleep In Day 😴", points: 750, available: false },
          ].map((reward, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl ${
                reward.available
                  ? "bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer"
                  : "bg-zinc-900/50 opacity-50"
              } transition-colors`}
            >
              <span className="text-sm text-zinc-300">{reward.name}</span>
              <span className={`text-sm font-medium ${reward.available ? "text-emerald-500" : "text-zinc-600"}`}>
                {reward.points} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Analyze & Adapt",
    description: "Track your patterns. See your wake times, task completion rates, and productivity trends over time.",
    visual: (
      <div className="w-full max-w-xs mx-auto">
        <div className="glass rounded-2xl p-4">
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {[40, 65, 55, 80, 70, 90, 85].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${height}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500/50 to-emerald-500"
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 px-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
              <span key={i} className="text-xs text-zinc-500">{day}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-heading mb-4">
            The Productivity Loop
          </h2>
          <p className="section-subheading mx-auto">
            A simple system designed to turn your chaos into conquest.
          </p>
        </motion.div>

        <div className="space-y-24 md:space-y-32">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-12 md:gap-20`}
            >
              {/* Text Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-emerald-500">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-lg text-zinc-400 max-w-md">
                  {step.description}
                </p>
              </div>

              {/* Visual */}
              <div className="flex-1 w-full">{step.visual}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

