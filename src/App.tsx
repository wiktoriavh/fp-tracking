import "./App.css";
import { TrackButton } from "./TrackButton";

function App() {
  const setParameter = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("utm_content", "functional-programming");
    url.searchParams.set("utm_source", "react");
    url.searchParams.set("utm_medium", "vite");
    url.searchParams.set("date", new Date().toISOString());

    window.history.pushState({}, "", url);
  };

  return (
    <>
      <div>
        <img src={"https://placekitten.com/700/300"} alt="kitty" />
      </div>
      <h1>Functional Programming Tracking</h1>
      <div className="card">
        <button onClick={setParameter}>Set Parameter</button>
      </div>
      <div className="card">
        <TrackButton />
        <p>Please check the console.</p>
      </div>
    </>
  );
}

export default App;
