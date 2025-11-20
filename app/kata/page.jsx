"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [words, setWords] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/wordlist.txt");
      const text = await res.text();
      const lines = text.split("\n");

      const fiveLetters = lines
        .map(w => w.trim())
        .filter(w => w.length === 5);

      setWords(fiveLetters);
    }

    load();
  }, []);

  return (
    <div>
      <h1>Kata 5 huruf: {words.length}</h1>
      <pre>{JSON.stringify(words.slice(0, 100), null, 2)}</pre>
    </div>
  );
}
