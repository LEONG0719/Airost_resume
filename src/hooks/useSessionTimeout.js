import { useEffect, useRef, useState } from 'react';

function useSessionTimeout(onTimeout, warnAt = 25 * 60 * 1000, timeoutAt = 30 * 60 * 1000) {
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef(null);
  const logoutTimer = useRef(null);

  const clearTimers = () => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  const resetTimers = () => {
    clearTimers();
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
    }, warnAt);
    logoutTimer.current = setTimeout(() => {
      setShowWarning(false);
      onTimeout();
    }, timeoutAt);
  };

  const extendSession = () => {
    setShowWarning(false);
    resetTimers();
  };

  useEffect(() => {
    resetTimers();
    return clearTimers;
  }, []);

  return { showWarning, extendSession };
}

export default useSessionTimeout;
