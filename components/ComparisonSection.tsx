import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const features = [
  { name: "Cloud Sync", generic: true, motixion: true },
  { name: "Multiplayer Mode", generic: false, motixion: true },
  { name: "Gamification & XP", generic: false, motixion: true },
  { name: "Accountability Partners", generic: false, motixion: true },
  { name: "Real Rewards System", generic: false, motixion: true },
  { name: "Privacy First", generic: false, motixion: true },
  { name: "Open Source", generic: false, motixion: true },
  { name: "Cost", generic: "$10/mo", motixion: "Free Forever" },
];

const ComparisonSection = () => {
  return (
    <section id="compare" className="py-24 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-heading mb-4">
            Why Motixion?
          </h2>
          <p className="section-subheading mx-auto">
            See how we stack up against generic to-do apps.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/5">
            <div className="text-sm font-medium text-zinc-400">Feature</div>
            <div className="text-sm font-medium text-zinc-400 text-center">Generic Apps</div>
            <div className="text-sm font-medium text-emerald-500 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Motixion
            </div>
          </div>

          {/* Features */}
          {features.map((feature, i) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`grid grid-cols-3 gap-4 p-6 ${
                i !== features.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <div className="text-sm text-zinc-300">{feature.name}</div>
              <div className="flex justify-center">
                {typeof feature.generic === "boolean" ? (
                  feature.generic ? (
                    <Check className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <X className="w-5 h-5 text-zinc-600" />
                  )
                ) : (
                  <span className="text-sm text-zinc-500">{feature.generic}</span>
                )}
              </div>
              <div className="flex justify-center">
                {typeof feature.motixion === "boolean" ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-emerald-500">
                    {feature.motixion}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;

