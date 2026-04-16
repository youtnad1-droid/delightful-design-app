import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Play, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const mockChannels = [
  { id: "1", name: "AFG| AREZO HD", category: "AFG | AFGHANISTAN", isFavorite: false },
  { id: "2", name: "AFG| AREZO TV HD", category: "AFG | AFGHANISTAN", isFavorite: false },
  { id: "3", name: "AFG| ARIANA NEWS", category: "AFG | AFGHANISTAN", isFavorite: false },
  { id: "4", name: "AFG| ATN", category: "AFG | AFGHANISTAN", isFavorite: false },
  { id: "5", name: "AFG| ATN NEWS", category: "AFG | AFGHANISTAN", isFavorite: true },
  { id: "6", name: "AFG| ATN USA", category: "AFG | AFGHANISTAN", isFavorite: false },
  { id: "7", name: "AFG| ATN WORLD", category: "AFG | AFGHANISTAN", isFavorite: false },
  { id: "8", name: "AFG| BAHAR TV", category: "AFG | AFGHANISTAN", isFavorite: false },
  { id: "9", name: "US| ESPN HD", category: "US | SPORTS", isFavorite: true },
  { id: "10", name: "US| CNN", category: "US | NEWS", isFavorite: false },
];

const categories = ["All", "AFG | AFGHANISTAN", "US | SPORTS", "US | NEWS"];

const LiveTV = () => {
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(mockChannels[4]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(mockChannels.filter((c) => c.isFavorite).map((c) => c.id))
  );

  const filtered = mockChannels.filter((ch) => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || ch.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <PageLayout title="LIVE TV">
      <div className="h-full flex flex-col md:flex-row gap-3">
        {/* Channel List */}
        <div className="md:w-[340px] shrink-0 flex flex-col gap-2">
          {/* Category Picker */}
          <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-foreground text-xs outline-none flex-1"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-background">{c}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search channels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-foreground placeholder:text-muted-foreground text-xs outline-none flex-1"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[50vh] md:max-h-[65vh] pr-1 scrollbar-thin">
            {filtered.map((ch) => (
              <motion.div
                key={ch.id}
                onClick={() => setSelectedChannel(ch)}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  selectedChannel?.id === ch.id
                    ? "glass-card border border-primary/30"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="w-10 h-7 rounded bg-muted/30 flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-xs font-medium truncate">{ch.name}</p>
                  <p className="text-muted-foreground text-[10px]">{ch.category}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleFav(ch.id); }}>
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      favorites.has(ch.id) ? "text-primary fill-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Player Area */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 glass-card rounded-2xl overflow-hidden flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <Play className="w-12 h-12 text-primary/50 mx-auto mb-2" />
              <p className="text-foreground text-sm font-medium">{selectedChannel?.name ?? "Select a channel"}</p>
              <p className="text-primary text-xs mt-1">Currently Live: Stream</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {[
              { icon: SkipBack, label: "BACK" },
              { icon: Play, label: "START", primary: true },
              { icon: SkipForward, label: "NEXT" },
              { icon: Volume2, label: "VOL UP" },
              { icon: VolumeX, label: "VOL DOWN" },
            ].map(({ icon: Icon, label, primary }) => (
              <button
                key={label}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  primary ? "glass-card border border-primary/20" : "glass hover:border-primary/20"
                }`}
              >
                <Icon className={`w-5 h-5 ${primary ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-[9px] text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 mt-2 text-muted-foreground text-[10px] overflow-x-auto">
        {["Favorite list", "Hant list", "Legend list", "Others"].map((item) => (
          <span key={item} className="whitespace-nowrap">{item}</span>
        ))}
      </div>
    </PageLayout>
  );
};

export default LiveTV;
