import { useEffect, useRef } from "react";

export function useAutoLoad(getTasks, connected) {
  const getTasksRef = useRef(getTasks);

  useEffect(() => { getTasksRef.current = getTasks; }, [getTasks]);

  useEffect(() => {
    if (!connected) return;

    let intervalId;

    const poll = (silent) => {
      getTasksRef.current?.(silent);
    };

    const startInterval = () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => poll(true), 15_000);
    };

    poll(false);
    startInterval();

    const onVisibility = () => {
      if (!document.hidden) {
        poll(true);
        startInterval();
      } else {
        clearInterval(intervalId);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [connected]);
}
