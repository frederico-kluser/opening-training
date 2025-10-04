/**
 * Formata milissegundos em formato mm:ss
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calcula tempo decorrido desde uma data
 */
export const getElapsedTime = (startTime: Date): number => {
  return Date.now() - startTime.getTime();
};