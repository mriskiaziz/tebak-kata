"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import cekKata from "@/lib/logic";
import { IoMdHelpCircleOutline } from "react-icons/io";
import Swal from "sweetalert2";

export default function WordleGame() {
  const ROWS = 6;
  const COLS = 5;

  // ----------- MUAT VALID WORDS DARI FILE TXT ----------- //
  const [validWords, setValidWords] = useState([]);

  useEffect(() => {
    async function loadWords() {
      const res = await fetch("/wordlist.txt");
      const text = await res.text();

      const list = text
        .split("\n")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length === 5)
        .filter((w) => new Set(w).size === 5); // ⬅ semua huruf harus unik


      setValidWords(list);
    }
    loadWords();
  }, []);
  // ------------------------------------------------------- //

  const JAWABAN = useMemo(() => {
    if (validWords.length === 0) return "";
    return validWords[Math.floor(Math.random() * validWords.length)];
  }, [validWords]);

  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(""))
  );
  const [evaluations, setEvaluations] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(""))
  );

  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  const [showModal, setShowModal] = useState(false);

  // ⭐ NEW: warna tombol keyboard
  const [keyColors, setKeyColors] = useState({});

  const inputRefs = useRef([]);

  useEffect(() => {
    focusBox(0, 0);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter") return submitRow();
      if (e.key === "Backspace") return deleteLetter();
      const letter = e.key.toLowerCase();
      if (/^[a-z]$/.test(letter)) insertLetter(letter);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const focusBox = (r, c) => {
    const ref = inputRefs.current[`${r}-${c}`];
    if (ref) ref.focus();
  };

  const insertLetter = (letter) => {
    if (currentCol >= COLS) return;
    const newGrid = [...grid];
    newGrid[currentRow][currentCol] = letter;
    setGrid(newGrid);
    if (currentCol < COLS - 1) {
      setCurrentCol(currentCol + 1);
      focusBox(currentRow, currentCol + 1);
    }
  };

  const deleteLetter = () => {
    if (currentCol === 0 && grid[currentRow][0] === "") return;
    const newGrid = [...grid];
    if (grid[currentRow][currentCol] === "" && currentCol > 0) {
      newGrid[currentRow][currentCol - 1] = "";
      setGrid(newGrid);
      setCurrentCol(currentCol - 1);
      focusBox(currentRow, currentCol - 1);
    } else {
      newGrid[currentRow][currentCol] = "";
      setGrid(newGrid);
    }
  };

  const submitRow = () => {
    const guess = grid[currentRow].join("");

    if (guess.length < 5) {
      alert("Masukkan 5 huruf", "warning");
      return;
    }
    if (!validWords.includes(guess)) {
      alert("Kata tidak ada di KBBI!", "error");
      return;
    }

    const warna = cekKata(JAWABAN, guess);

    const newEval = [...evaluations];
    newEval[currentRow] = warna;
    setEvaluations(newEval);

    // ⭐ UPDATE KEYBOARD COLORS
    setKeyColors((prev) => {
      const updated = { ...prev };

      guess.split("").forEach((letter, index) => {
        const result = warna[index]; // green, yellow, gray

        if (result === "green") {
          updated[letter] = "green";
        } else if (result === "yellow") {
          if (updated[letter] !== "green") {
            updated[letter] = "yellow";
          }
        } else {
          if (!updated[letter]) {
            updated[letter] = "gray";
          }
        }
      });

      return updated;
    });

    if (guess === JAWABAN) {
      alert(`Selamat! Jawaban benar: ${JAWABAN.toUpperCase()}`, "success");
      return;
    }

    if (currentRow < ROWS - 1) {
      setCurrentRow(currentRow + 1);
      setCurrentCol(0);
      setTimeout(() => focusBox(currentRow + 1, 0), 200);
    } else {
      alert(`Game over! Jawaban: ${JAWABAN.toUpperCase()}`, "error");
    }
  };

  const handleKeyClick = (key) => {
    if (key === "ENTER") return submitRow();
    if (key === "DEL") return deleteLetter();
    insertLetter(key.toLowerCase());
  };

  return (
    <>
      <style>{`
        .box {
          width: 65px;
          height: 65px;
          font-size: 26px;
          text-align: center;
          caret-color: transparent;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ccc;
          transition: 0.2s;
          text-transform: uppercase;
        }
        .filled { border: 2px solid #555; }
        .green { background: #6aaa64 !important; color: white !important; }
        .yellow { background: #c9b458 !important; color: white !important; }
        .gray { background: #787c7e !important; color: white !important; }

        /* KEYBOARD COLORS */
        .key.green { background: #6aaa64 !important; color: white !important; }
        .key.yellow { background: #c9b458 !important; color: white !important; }
        .key.gray { background: #787c7e !important; color: white !important; }

        .keyboard { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%; }
        .key-row { display: flex; justify-content: center; gap: 4px; }
        .key {
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          user-select: none;
          font-weight: bold;
          background: #ccc;
        }
        .key.special { padding: 10px 22px; }
      `}</style>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content bg-white dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-semibold text-2xl pb-4">Cara Bermain</h2>
              <span className="modal-close" onClick={() => setShowModal(false)}>×</span>
            </div>
            <div className="modal-body space-y-2 pb-4">
              <p>Tebak kata rahasia dalam 6 kesempatan.</p>
              <p>Setiap tebakan harus merupakan kata valid 5 huruf sesuai KBBI.</p>
              <p>Setelah kamu menekan ENTER, warna kotak dan keyboard akan berubah sesuai kecocokan huruf.</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-center items-center">
        <div className="flex my-5 md:min-w-md px-1">
          <button onClick={() => setShowModal(true)} className="mr-20 cursor-pointer">
            <IoMdHelpCircleOutline size={35} />
          </button>

          <h1 className="text-3xl font-bold">
            <span className="text-red-700">Y</span>
            <span className="text-orange-700">u</span>
            <span className="text-amber-700">k</span>
            <span className="text-yellow-700">k</span> &nbsp;
            <span className="text-green-700">T</span>
            <span className="text-green-600">e</span>
            <span className="text-green-500">b</span>
            <span className="text-green-400">a</span>
            <span className="text-green-300">k</span> &nbsp;
            <span className="text-blue-700">K</span>
            <span className="text-blue-600">a</span>
            <span className="text-blue-500">t</span>
            <span className="text-blue-400">a</span>
          </h1>
        </div>
      </div>

      {/* GRID */}
      <div className="justify-center" style={{ display: "grid", gap: "5px" }}>
        {grid.map((row, r) => (
          <div style={{ display: "flex", gap: "8px" }} key={r}>
            {row.map((letter, c) => (
              <input
                key={c}
                ref={(el) => (inputRefs.current[`${r}-${c}`] = el)}
                value={letter}
                disabled
                className={`box ${evaluations[r][c]} ${letter ? "filled" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* KEYBOARD */}
      <div className="flex justify-center mt-4">
        <div className="keyboard p-0">
          {[
            "QWERTYUIOP".split(""),
            "ASDFGHJKL".split(""),
            ["ENTER", ..."ZXCVBNM".split(""), "DEL"],
          ].map((row, i) => (
            <div className="key-row" key={i}>
              {row.map((key) => (
                <div
                  key={key}
                  className={`key ${["ENTER", "DEL"].includes(key) ? "special" : ""
                    } ${keyColors[key.toLowerCase()] || ""}`}
                  onClick={() => handleKeyClick(key)}
                >
                  {key}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const alert = (msg, icon) => {
  Swal.fire({
    icon: icon,
    title: msg,
    showConfirmButton: false,
    timer: 2000,
  });
};
