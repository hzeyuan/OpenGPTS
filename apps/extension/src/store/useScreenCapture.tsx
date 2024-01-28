import { create } from "zustand";

interface ScreenCaptureState {
    isCapturing: boolean;
    capturedImage: string | null;
    startCapture: () => void;
    processCapture: (imageData: string) => void;
    resetCapture: () => void;
}

export const useScreenCapture = create<ScreenCaptureState>((set) => ({
    isCapturing: false,
    capturedImage: null,

    startCapture: () => set({ isCapturing: true }),
    processCapture: (imageData: string) => set({ isCapturing: false, capturedImage: imageData }),
    resetCapture: () => set({ isCapturing: false, capturedImage: null }),
}));

export default useScreenCapture;
