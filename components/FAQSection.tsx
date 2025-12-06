import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. Motixion follows a local-first philosophy. Your data stays on your device unless you explicitly choose to sync it. We don't track, analyze, or sell your data. Ever.",
  },
  {
    question: "How does the friend linking work?",
    answer:
      "You can add accountability partners by sharing a unique link. Once connected, you'll see each other's progress, streaks, and missed sessions. It's social pressure, but the good kind.",
  },
  {
    question: "Can I self-host this?",
    answer:
      "Yes! Motixion is 100% open source under the MIT license. Clone the repo, configure your environment, and run it on your own infrastructure. Full documentation is available on GitHub.",
  },
  {
    question: "What happens if I break my streak?",
    answer:
      "Your accountability partners get notified, and you lose streak bonus XP. But don't worry—the goal is progress, not perfection. Every day is a chance to start fresh.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Not yet, but it's on the roadmap! The web app is fully responsive and works great on mobile browsers. PWA support is coming soon for an app-like experience.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-heading mb-4">
            Questions?
          </h2>
          <p className="section-subheading mx-auto">
            Everything you need to know about Motixion.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass rounded-xl overflow-hidden glass-hover"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

