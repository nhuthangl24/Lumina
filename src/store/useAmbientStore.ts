import { create } from "zustand";

interface AmbientState {
  rainVolume: number;
  cafeVolume: number;
  fireVolume: number;
  officeVolume: number;
  oceanVolume: number;
  setVolume: (type: "rain" | "cafe" | "fire" | "office" | "ocean", volume: number) => void;
  spotifyId: string;
  setSpotifyId: (id: string) => void;
}

export const useAmbientStore = create<AmbientState>((set) => ({
  rainVolume: 0,
  cafeVolume: 0,
  fireVolume: 0,
  officeVolume: 0,
  oceanVolume: 0,
  setVolume: (type, volume) => set((state) => ({ ...state, [`${type}Volume`]: volume })),
  spotifyId: "37i9dQZF1DWWQRwui0ExPn", // Default lofi
  setSpotifyId: (id) => set({ spotifyId: id }),
}));
