import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Play, SkipBack, SkipForward, Volume2, ChevronDown, RefreshCw, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import VideoPlayer from "@/components/VideoPlayer";
import { useProfiles } from "@/hooks/useProfiles";
import { useLiveChannels, useReloadPlaylist } from "@/hooks/useXtreamData";
import { useFavorites } from "@/hooks/useFavorites";
import type { Channel } from "@/types/xtream";
import { Link } from "react-router-dom";

const LiveTV = () => {
  const { activeProfile } = useProfiles();
  const { data: channels = [], isLoading, error } = useLiveChannels(activeProfile);
  const reload = useReloadPlaylist();
  const { isFavorite, toggle } = useFavorites(activeProfile?.id, "live");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showFavOnly, setShowFavOnly] = useState(false);

  const categories = ["All", ...Array.from(new Set(channels.map((c) => c.category)))];

  const filtered = channels.filter((ch) => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || ch.category === selectedCategory;
    const matchFav = !showFavOnly || isFavorite(ch.id);
    return matchSearch && matchCat && matchFav;
  });

  const current = selectedChannel ?? filtered[0] ?? null;

  if (!activeProfile) {
    return (
      <PageLayout title="LIVE TV">
        <div className="h-full flex items-center justify-center">
          <div className="glass-card rounded-2xl p-6 text-center max-w-sm">
            <p className="text-foreground text-sm mb-3">No active server.</p>
            <Link to="/account" className="text-primary text-xs underline">Add a profile</Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="LIVE TV">
      <div className="h-full flex flex-col md:flex-row gap-3">
        {/* Channel List */}
        <div className="md:w-[340px] shrink-0 flex flex-col gap-2">
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
            <button onClick={() => reload(activeProfile.id)} title="Reload">
              <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>

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

          <div className="flex-1 overflow-y-auto space-y-1 max-h-[50vh] md:max-h-[65vh] pr-1">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
            {error && <p className="text-destructive text-xs px-2">Failed to load. Check credentials.</p>}
            {!isLoading && filtered.length === 0 && (
              <p className="text-muted-foreground text-xs text-center py-6">No channels found.</p>
            )}
            {filtered.slice(0, 200).map((ch) => (
              <motion.div
                key={ch.id}
                onClick={() => setSelectedChannel(ch)}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  current?.id === ch.id ? "glass-card border border-primary/30" : "hover:bg-white/5"
                }`}
              >
                <div className="w-10 h-7 rounded bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {ch.logoUrl ? (
                    <img src={ch.logoUrl} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                  ) : (
                    <Play className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-xs font-medium truncate">{ch.name}</p>
                  <p className="text-muted-foreground text-[10px] truncate">{ch.category}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggle(ch.id); }}>
                  <Star className={`w-4 h-4 ${isFavorite(ch.id) ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Player Area */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 glass-card rounded-2xl overflow-hidden flex items-center justify-center min-h-[240px] relative">
            {current ? (
              <VideoPlayer src={current.streamUrl} poster={current.logoUrl} isLive />
            ) : (
              <div className="text-center">
                <Play className="w-12 h-12 text-primary/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">Select a channel</p>
              </div>
            )}
          </div>

          {current && (
            <div className="text-center">
              <p className="text-foreground text-sm font-medium">{current.name}</p>
              <p className="text-muted-foreground text-[10px]">{current.category}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            {[
              { icon: SkipBack, label: "PREV" },
              { icon: Play, label: "PLAY", primary: true },
              { icon: SkipForward, label: "NEXT" },
              { icon: Volume2, label: "VOL" },
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

      <div className="flex items-center gap-4 mt-2 text-muted-foreground text-[10px] overflow-x-auto">
        <button onClick={() => setShowFavOnly((v) => !v)} className={showFavOnly ? "text-primary" : ""}>
          Favorite list
        </button>
        <span>{channels.length} channels</span>
      </div>
    </PageLayout>
  );
};

export default LiveTV;
