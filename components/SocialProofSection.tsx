import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Users, Target, Code2 } from "lucide-react";
import { getTotalUserCount } from '../services/userCount';

const techStack = [
  { name: "React", color: "#ffffff" },
  { name: "Supabase", color: "#3ECF8E" },
  { name: "Tailwind", color: "#06B6D4" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Framer Motion", color: "#FF0055" },
];

const SocialProofSection = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);


  useEffect(() => {


    const fetchUserCount = async () => {
      try {
        const count = await getTotalUserCount();
        setTotalUsers(count);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };
    
    fetchUserCount();
  }, []);

  const stats = [
    { label: "Active Users", value: totalUsers > 0 ? totalUsers.toLocaleString() : "0", icon: Users },
    { label: "Tasks Crushed", value: "1000+", icon: Target },
    { label: "Open Source", value: "100%", icon: Code2 },
  ];

  return (
    <section className="py-20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center glass-hover"
            >
              <stat.icon className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </p>
              <p className="text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-zinc-500 mb-6">Built with modern technologies</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredTech(tech.name)}
                onMouseLeave={() => setHoveredTech(null)}
              >
                <span 
                  className="text-lg md:text-xl font-semibold transition-colors duration-200"
                  style={{ 
                    color: hoveredTech === tech.name ? tech.color : 'rgb(82, 82, 91)',
                  } as React.CSSProperties}
                >
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;

