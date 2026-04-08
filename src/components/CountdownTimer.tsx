import { useEffect, useState } from "react";
import { getCountdown } from "../utils/date";

const CountdownTimer = ({ lockTime }: { lockTime: string }) => {
  const [label, setLabel] = useState(() => getCountdown(lockTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setLabel(getCountdown(lockTime));
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, [lockTime]);

  return <span>{label}</span>;
};

export default CountdownTimer;
