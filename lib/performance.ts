/**
 * Performance monitoring utilities
 * Simple helpers for measuring performance in development
 */

export function measurePerformance(label: string) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    };
  }
  
  // Return no-op function in production
  return () => {};
}

export function measureAsyncPerformance<T>(
  label: string,
  asyncFn: () => Promise<T>
): Promise<T> {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const start = performance.now();
    
    return asyncFn().then((result) => {
      const end = performance.now();
      console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
      return result;
    });
  }
  
  return asyncFn();
}

/**
 * Log Core Web Vitals in development
 */
export function logWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', metric.name, metric.value);
  }
}
