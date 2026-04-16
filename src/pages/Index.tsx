import { motion } from "framer-motion";
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
    featured: true,
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
  featured,
  index,
}: {
  title: string;
  count: string;
  icon: React.ElementType;
  lastUpdate: string;
  featured?: boolean;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
    whileHover={{ scale: 1.05, y: -4 }}
    className={`glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
      featured ? "w-72 h-52 z-10" : "w-60 h-44"
    } flex flex-col justify-between relative overflow-hidden group`}
  >
    {featured && (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
    )}
    <div className="flex items-start justify-between relative z-10">
      <div>
        <h3 className="text-foreground text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{count}</p>
      </div>
      <Icon
        className={`w-12 h-12 ${
          featured
            ? "text-primary gold-glow animate-glow-pulse"
            : "text-muted-foreground/50"
        } group-hover:text-primary transition-colors`}
        strokeWidth={1.2}
      />
    </div>
    <div className="flex items-center gap-1.5 text-muted-foreground text-xs relative z-10">
      <Clock className="w-3 h-3" />
      <span>{lastUpdate}</span>
    </div>
  </motion.div>
);

const Index = () => {
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
          <div className="w-16 h-16 rounded-xl glass overflow-hidden">
            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
              <Tv className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl tracking-[0.3em] gold-text"
          >
            NADIBOX
          </motion.h1>

          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full glass flex items-center justify-center hover:border-primary/40 transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-primary/50 overflow-hidden glass flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Main Cards */}
        <main className="flex-1 flex items-center justify-center px-8">
          <div className="flex items-center gap-6">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.title} {...cat} index={i} />
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
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-primary" />
              <span className="text-foreground text-xl font-light">{currentTime}</span>
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
