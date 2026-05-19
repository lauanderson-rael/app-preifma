const NETWORK_ERROR_MESSAGE =
  'Sem conexao com a internet. Verifique sua rede e tente novamente.';

function readFirstMessage(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0];
  }
  return null;
}

function isNetworkError(error: any): boolean {
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.message === 'Network Error' ||
    (!error?.response && !!error?.request)
  );
}

export function getFriendlyErrorMessage(error: any, fallback: string): string {
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  const data = error?.response?.data;
  const apiMessage =
    readFirstMessage(data?.detail) ||
    readFirstMessage(data?.message) ||
    readFirstMessage(data?.error) ||
    readFirstMessage(data?.email) ||
    readFirstMessage(data?.username) ||
    readFirstMessage(data?.password);

  if (apiMessage) {
    return apiMessage;
  }

  const message = typeof error?.message === 'string' ? error.message : '';
  if (message && message !== 'Network Error') {
    return message;
  }

  return fallback;
}
