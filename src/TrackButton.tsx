import { useState } from "react";
import { useTracking } from "./lib/useTracking";

export const TrackButton = () => {
  const [author, setName] = useState("");
  const { track } = useTracking();

  const handleClick = () => {
    track({
      price: String(Math.random() * 100),
      currency: ["USD", "EUR", "GBP"][Math.floor(Math.random() * 3)],
      name: author,
    });
  };

  return (
    <div>
      <button onClick={handleClick}>Track</button>
      <input
        type="text"
        placeholder="Enter your name"
        value={author}
        onChange={(event) => setName(event.target.value)}
      />
    </div>
  );
};
