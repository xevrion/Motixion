import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 border-t border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Ready to{" "}
            <span className="text-gradient">dominate</span>
            {" "}your day?
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
            Join thousands of high-performers who've already forged their focus. 
            It's free, open source, and built for people like you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary text-base px-8 py-4"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="https://github.com/xevrion/motixion"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary text-base px-8 py-4"
            >
              <Github className="w-5 h-5" />
              Contribute on GitHub
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

