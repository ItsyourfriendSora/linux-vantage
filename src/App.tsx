import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Layout from "./main/Layout";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-green-500 mb-8">
        It works! (Tailwind v4 in React)
      </h1>
      
      <div className="flex justify-center gap-4 mb-8">
        <a href="https://vite.dev" target="_blank" className="hover:text-blue-400">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" className="hover:text-blue-400">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:text-blue-400">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p className="mb-8 text-gray-300">Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="flex justify-center gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          className="rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 outline-none focus:border-blue-500"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit" className="rounded-md border border-transparent bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition font-medium">
          Greet
        </button>
      </form>
      {greetMsg && (
        <p className="text-lg text-blue-300 mt-4 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          {greetMsg}
        </p>
      )}
    </Layout>
  );
}

export default App;
