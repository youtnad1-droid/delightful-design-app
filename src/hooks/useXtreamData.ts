import { useQuery, useQueryClient } from "@tanstack/react-query";
import { xtreamApi } from "@/lib/xtream";
import type { XtreamProfile } from "@/types/xtream";

export const useLiveChannels = (profile: XtreamProfile | null) =>
  useQuery({
    queryKey: ["xtream", profile?.id, "live"],
    queryFn: () => xtreamApi.getLiveStreams(profile!),
    enabled: !!profile,
    staleTime: 1000 * 60 * 10,
  });

export const useMovies = (profile: XtreamProfile | null) =>
  useQuery({
    queryKey: ["xtream", profile?.id, "movies"],
    queryFn: () => xtreamApi.getMovies(profile!),
    enabled: !!profile,
    staleTime: 1000 * 60 * 10,
  });

export const useSeries = (profile: XtreamProfile | null) =>
  useQuery({
    queryKey: ["xtream", profile?.id, "series"],
    queryFn: () => xtreamApi.getSeries(profile!),
    enabled: !!profile,
    staleTime: 1000 * 60 * 10,
  });

export const useReloadPlaylist = () => {
  const qc = useQueryClient();
  return (profileId: string) => qc.invalidateQueries({ queryKey: ["xtream", profileId] });
};
