type NetworkStatusListener = (isOffline: boolean) => void;

let isOffline = false;
const listeners = new Set<NetworkStatusListener>();

export function getNetworkStatus(): boolean {
  return isOffline;
}

export function setNetworkStatus(nextIsOffline: boolean): void {
  if (isOffline === nextIsOffline) return;
  isOffline = nextIsOffline;
  listeners.forEach((listener) => listener(isOffline));
}

export function markNetworkAvailable(): void {
  setNetworkStatus(false);
}

export function markNetworkUnavailable(): void {
  setNetworkStatus(true);
}

export function subscribeNetworkStatus(listener: NetworkStatusListener): () => void {
  listeners.add(listener);
  listener(isOffline);

  return () => {
    listeners.delete(listener);
  };
}
