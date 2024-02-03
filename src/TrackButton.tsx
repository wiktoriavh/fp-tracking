import { useState } from "react";
import { tracking } from "./lib/tracking";

export const TrackButton = () => {
  const [author, setName] = useState("");
  const track = tracking.createAddPendingEvent();

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
