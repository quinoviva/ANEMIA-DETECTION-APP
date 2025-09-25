
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./firebase.ts"; // This will initialize Firebase
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  