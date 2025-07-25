/// <reference types="vite/client" />

// Add custom type declarations
interface Window {
  handleLemonSqueezyWebhook?: (event: any) => Promise<void>;
}

interface Element {
  __REACT_APP_AUTH?: any;
}
