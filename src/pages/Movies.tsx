import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Play, ChevronDown } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const mockMovies = [
  { id: "1", name: "The Dark Knight", category: "Action", year: "2008", rating: "9.0" },
  { id: "2", name: "Inception", category: "Sci-Fi", year: "2010", rating: "8.8" },
  { id: "3", name: "Interstellar", category: "Sci-Fi", year: "2014", rating: "8.6" },
  { id: "4", name: "The Godfather", category: "Drama", year: "1972", rating: "9.2" },
  { id: "5", name: "Pulp Fiction", category: "Crime", year: "1994", rating: "8.9" },
  { id: "6", name: "Fight Club", category: "Drama", year: "1999", rating: "8.8" },
  { id: "7", name: "The Matrix", category: "Sci-Fi", year: "1999", rating: "8.7" },
  { id: "8", name: "Gladiator", category: "Action", year: "2000", rating: "8.5" },
  { id: "9", name: "Joker", category: "Drama", year: "2019", rating: "8.4" },
  { id: "10", name: "Avengers: Endgame", category: "Action", year: "2019", rating: "8.4" },
  { id: "11", name: "Parasite", category: "Thriller", year: "2019", rating: "8.5" },
  { id: "12", name: "Dune", category: "Sci-Fi", year: "2021", rating: "8.0" },
];

const categories = ["All", "Action", "Sci-Fi", "Drama", "Crime", "Thriller"];

const Movies = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filtered = mockMovies.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "All" || m.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <PageLayout title="MOVIES">
      <div className="flex flex-col gap-3 h-full">
        {/* Top Bar */}
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
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-foreground placeholder:text-muted-foreground text-xs outline-none flex-1"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-2">
          {filtered.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl overflow-hidden cursor-pointer group hover:border-primary/30 transition-all"
            >
              <div className="aspect-[2/3] bg-muted/20 flex items-center justify-center relative">
                <Play className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                <button
                  onClick={() => setFavorites((prev) => {
                    const next = new Set(prev);
                    next.has(movie.id) ? next.delete(movie.id) : next.add(movie.id);
                    return next;
                  })}
                  className="absolute top-2 right-2"
                >
                  <Star className={`w-4 h-4 ${favorites.has(movie.id) ? "text-primary fill-primary" : "text-muted-foreground/40"}`} />
                </button>
                {movie.rating && (
                  <span className="absolute top-2 left-2 text-[10px] bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded">
                    ★ {movie.rating}
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-foreground text-xs font-medium truncate">{movie.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground text-[10px]">{movie.category}</span>
                  <span className="text-muted-foreground text-[10px]">{movie.year}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Movies;
