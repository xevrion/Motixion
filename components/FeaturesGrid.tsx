import { motion } from "framer-motion";
import { MessageCircle, Trophy, Shield, Zap, Target, Users, User, User2 } from "lucide-react";

const FeaturesGrid = () => {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-heading mb-4">
            Built for Dominance
          </h2>
          <p className="section-subheading mx-auto">
            Every feature designed to help you crush procrastination and become unstoppable.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Large Feature Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 lg:col-span-1 lg:row-span-2 glass rounded-2xl p-6 md:p-8 glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Radical Accountability
            </h3>
            <p className="text-zinc-400 mb-6">
              Social Pressure Mechanics. Link accounts with friends. If you slack, they know instantly.
            </p>
            <div className="glass rounded-xl p-4 border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex-shrink-0 flex items-center justify-center">
                  <User2 className="w-6 h-6 text-zinc-300 flex items-center justify-center" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-300">"Bro, did you miss your deep work session again? 😤"</p>
                  <p className="text-xs text-zinc-500">Just now • Alex (Accountability Partner)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gamification Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6 glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Gamification
            </h3>
            <p className="text-zinc-400 mb-4">
              XP & Leveling System. Turn habits into quests.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Level 23</span>
                <span className="text-yellow-500">Level 24</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "75%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Privacy Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6 glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Privacy First
            </h3>
            <p className="text-zinc-400">
              Your data is yours. 100% Local-first philosophy. No tracking. No selling data.
            </p>
          </motion.div>

          {/* Focus Mode Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6 glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Focus Mode
            </h3>
            <p className="text-zinc-400 mb-4">
              Deep work sessions with Pomodoro integration.
            </p>
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                <span className="text-2xl font-bold text-emerald-500">25</span>
                <span className="absolute bottom-2 text-xs text-zinc-500">min</span>
              </div>
            </div>
          </motion.div>

          {/* Streaks Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-2xl p-6 glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Streak System
            </h3>
            <p className="text-zinc-400 mb-4">
              Build momentum. Don't break the chain.
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    day <= 5
                      ? "bg-orange-500/20 text-orange-500 border border-orange-500/30"
                      : "bg-zinc-800 text-zinc-600"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

