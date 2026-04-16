import { motion, AnimatePresence } from "framer-motion";
import { Film, Tv, Clapperboard, Settings, Clock, CloudSun, User } from "lucide-react";
import { useState } from "react";

const categories = [
  {
    title: "Movies",
    count: "+1200 Movies",
    icon: Film,
    lastUpdate: "Last Update: 2 day ago",
  },
  {
    title: "Live TV's",
    count: "+5000 Channels",
    icon: Tv,
    lastUpdate: "Last Update: 2 day ago",
  },
  {
    title: "Series",
    count: "+500 Series",
    icon: Clapperboard,
    lastUpdate: "Last Update: 2 day ago",
  },
];

const CategoryCard = ({
  title,
  count,
  icon: Icon,
  lastUpdate,
  index,
  isSelected,
  onClick,
}: {
  title: string;
  count: string;
  icon: React.ElementType;
  lastUpdate: string;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 30 }}
    animate={{
      opacity: 1,
      y: 0,
      scale: isSelected ? 1.15 : 0.9,
      zIndex: isSelected ? 10 : 1,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.1 }}
    whileHover={{ scale: isSelected ? 1.18 : 0.95 }}
    whileTap={{ scale: isSelected ? 1.12 : 0.88 }}
    onClick={onClick}
    className="relative cursor-pointer select-none"
    style={{ width: isSelected ? 280 : 220, height: isSelected ? 190 : 160 }}
  >
    {/* Glass card image background */}
    <div className="absolute inset-0 rounded-2xl overflow-hidden">
      <img
        src={glassCardImg}
        alt=""
        className="w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 glass-card rounded-2xl" />
    </div>

    {/* Gold glow on selected */}
    <AnimatePresence>
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -inset-1 rounded-2xl pointer-events-none"
          style={{
            boxShadow: "0 0 30px hsla(40, 80%, 55%, 0.25), inset 0 0 30px hsla(40, 80%, 55%, 0.05)",
            border: "1px solid hsla(40, 80%, 55%, 0.2)",
            borderRadius: "1rem",
          }}
        />
      )}
    </AnimatePresence>

    {/* Content */}
    <div className="relative z-10 h-full flex flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-foreground text-lg font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{count}</p>
        </div>
        <Icon
          className={`transition-all duration-500 ${
            isSelected
              ? "w-14 h-14 text-primary gold-glow animate-glow-pulse"
              : "w-10 h-10 text-muted-foreground/40"
          }`}
          strokeWidth={1.2}
        />
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <Clock className="w-3 h-3" />
        <span>{lastUpdate}</span>
      </div>
    </div>
  </motion.div>
);

const Index = () => {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [currentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/nebula-bg.png')" }}
      />
      <div className="absolute inset-0 bg-background/40" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 pt-6">
          <div className="w-14 h-14 rounded-xl glass overflow-hidden">
            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
              <Tv className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-3xl md:text-4xl tracking-[0.3em] gold-text"
          >
            NADIBOX
          </motion.h1>

          <div className="flex items-center gap-3">
            <button className="w-11 h-11 rounded-full glass flex items-center justify-center hover:border-primary/40 transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-11 h-11 rounded-full border-2 border-primary/50 overflow-hidden glass flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Main Cards */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.title}
                {...cat}
                index={i}
                isSelected={selectedIndex === i}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-between px-8 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-foreground text-sm font-medium">Timeshift</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-4 md:gap-6"
          >
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-primary" />
              <span className="text-foreground text-lg font-light">{currentTime}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-foreground text-sm">Los Angeles</span>
              <CloudSun className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground text-sm">24°</span>
            </div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
