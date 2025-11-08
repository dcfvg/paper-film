// Global type augmentations
type UpdateSW = (reloadPage?: boolean) => Promise<void>;

declare global {
  interface Window {
    updateSW?: UpdateSW;
  }
}

export {};
