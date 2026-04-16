import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Clapperboard, ChevronDown } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const mockSeries = [
  { id: "1", name: "Breaking Bad", category: "Drama", seasons: 5, rating: "9.5" },
  { id: "2", name: "Game of Thrones", category: "Fantasy", seasons: 8, rating: "9.3" },
  { id: "3", name: "Stranger Things", category: "Sci-Fi", seasons: 4, rating: "8.7" },
  { id: "4", name: "The Witcher", category: "Fantasy", seasons: 3, rating: "8.2" },
  { id: "5", name: "Dark", category: "Sci-Fi", seasons: 3, rating: "8.8" },
  { id: "6", name: "Money Heist", category: "Crime", seasons: 5, rating: "8.2" },
  { id: "7", name: "The Mandalorian", category: "Sci-Fi", seasons: 3, rating: "8.7" },
  { id: "8", name: "Peaky Blinders", category: "Drama", seasons: 6, rating: "8.8" },
  { id: "9", name: "Wednesday", category: "Comedy", seasons: 1, rating: "8.1" },
  { id: "10", name: "The Last of Us", category: "Drama", seasons: 2, rating: "8.8" },
  { id: "11", name: "Squid Game", category: "Thriller", seasons: 2, rating: "8.0" },
  { id: "12", name: "House of Dragon", category: "Fantasy", seasons: 2, rating: "8.4" },
];

const categories = ["All", "Drama", "Sci-Fi", "Fantasy", "Crime", "Thriller", "Comedy"];

const SeriesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = mockSeries.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || s.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <PageLayout title="SERIES">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex gap-2">
          <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 w-32">
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
          <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search series..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-foreground placeholder:text-muted-foreground text-xs outline-none flex-1"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-2">
          {filtered.map((series, i) => (
            <motion.div
              key={series.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl overflow-hidden cursor-pointer group hover:border-primary/30 transition-all"
            >
              <div className="aspect-[2/3] bg-muted/20 flex items-center justify-center relative">
                <Clapperboard className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                <button
                  onClick={() => setFavorites((prev) => {
                    const next = new Set(prev);
                    next.has(series.id) ? next.delete(series.id) : next.add(series.id);
                    return next;
                  })}
                  className="absolute top-2 right-2"
                >
                  <Star className={`w-4 h-4 ${favorites.has(series.id) ? "text-primary fill-primary" : "text-muted-foreground/40"}`} />
                </button>
                {series.rating && (
                  <span className="absolute top-2 left-2 text-[10px] bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded">
                    ★ {series.rating}
                  </span>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] glass px-1.5 py-0.5 rounded text-foreground">
                  {series.seasons} Season{series.seasons > 1 ? "s" : ""}
                </span>
              </div>
              <div className="p-2.5">
                <p className="text-foreground text-xs font-medium truncate">{series.name}</p>
                <span className="text-muted-foreground text-[10px]">{series.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default SeriesPage;
