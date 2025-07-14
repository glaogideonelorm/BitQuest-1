"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles, Gift } from "lucide-react";

interface HeroProps {
  onStartQuest: (e: React.MouseEvent) => void;
}

export default function Hero({ onStartQuest }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary-dark)] via-[var(--primary)] to-[var(--primary-light)] py-24 sm:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent"
        />
      </div>

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">New Adventure Awaits</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              Discover Digital{" "}
              <span className="text-[var(--accent)]">Treasures</span> in the
              Real World
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-white/80 mb-8 max-w-xl"
            >
              Embark on an exciting AR treasure hunt. Find virtual chests,
              collect rewards, and earn real Bitrefill gift cards!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={onStartQuest}
                className="btn-primary bg-white !text-[var(--primary)] hover:bg-white/90"
              >
                <MapPin className="w-5 h-5" />
                <span>Start Quest</span>
              </button>
              <a
                href="#rewards"
                className="btn-secondary !border-white/20 !text-white hover:!bg-white/20"
              >
                <Gift className="w-5 h-5" />
                <span>View Rewards</span>
              </a>
            </motion.div>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-12 grid sm:grid-cols-3 gap-6"
            >
              {[
                { title: "Real Rewards", desc: "Gift cards & more" },
                { title: "AR Experience", desc: "Immersive hunting" },
                { title: "Daily Quests", desc: "New treasures daily" },
              ].map((feature, i) => (
                <div key={i} className="glass-card p-4 text-center hover-lift">
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* 3D/Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square rounded-full bg-gradient-to-br from-white/20 to-transparent p-8">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-white/10 to-transparent p-8 animate-spin-slow">
                <div className="w-full h-full rounded-full bg-white/5 backdrop-blur-lg flex items-center justify-center">
                  <img
                    src="/images/chest.png"
                    alt="Treasure Chest"
                    className="w-2/3 h-2/3 object-contain hover-lift"
                  />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute top-1/4 right-1/4 w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1,
              }}
              className="absolute bottom-1/4 left-1/4 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
