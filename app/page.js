"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import cekKata from "@/lib/logic";
import { IoMdHelpCircleOutline } from "react-icons/io";
import Swal from "sweetalert2";

export default function WordleGame() {
  const ROWS = 6;
  const COLS = 5;

  // ----------- MUAT VALID WORDS DARI FILE TXT ----------- //
  const [validWords, setValidWords] = useState([]); // ⬅ perubahan

  useEffect(() => {
    async function loadWords() {
      const res = await fetch("/wordlist.txt");
      const text = await res.text();

      const list = text
        .split("\n")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length === 5); // hanya 5 huruf

      setValidWords(list);
    }
    loadWords();
  }, []);
  // ------------------------------------------------------- //


  const JAWABAN = useMemo(() => {
    if (validWords.length === 0) return ""; // ⬅ perubahan
    return validWords[Math.floor(Math.random() * validWords.length)];
  }, [validWords]); // ⬅ perubahan

  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(""))
  );
  const [evaluations, setEvaluations] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(""))
  );

  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [showModal, setShowModal] = useState(false); // modal state

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
      alert("Kata tidak ada di KKBI!", "error");
      return;
    }
    const warna = cekKata(JAWABAN, guess);
    const newEval = [...evaluations];
    newEval[currentRow] = warna;
    setEvaluations(newEval);

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
        .green { background: #6aaa64; color: white; }
        .yellow { background: #c9b458; color: white; }
        .gray { background: #787c7e; color: white; }

        .keyboard {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .key-row { display: flex; justify-content: center; gap: 4px; }
        .key {
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          user-select: none;
          font-weight: bold;
        }
        .key.special { padding: 10px 22px; }

        /* RESPONSIVE HP */
        @media (max-width: 480px) {
          .box { width: 60px; height: 60px; font-size: 20px; }
          .keyboard { gap: 6px; }
          .key { padding: 10px 10px; font-size: 14px; }
          .key.special { padding: 8px 14px; font-size: 14px; }
        }
        @media (max-width: 360px) {
          .box { width: 42px; height: 46px; font-size: 18px; }
          .key { padding: 6px 8px; font-size: 12px; }
          .key.special { padding: 6px 12px; font-size: 12px; }
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          top:0; left:0; right:0; bottom:0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
        }
        .modal-content {
          padding: 20px 30px;
          border-radius: 10px;
          max-width: 600px;
          width: 90%;
          max-height: 90%;
          overflow-y: auto;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .modal-close { cursor: pointer; font-weight: bold; font-size: 2rem; }
        .modal-body { margin-top: 10px; line-height: 1.5; font-size: 14px; }
        .example { display: flex; gap:5px; margin:5px 0; }
        .example .green { width:25px; height:25px; text-align:center; display:flex; justify-content:center; align-items:center; color:white; border-radius:3px; font-weight:bold; font-size:14px;}
        .example .yellow { width:25px; height:25px; text-align:center; display:flex; justify-content:center; align-items:center; color:white; border-radius:3px; font-weight:bold; font-size:14px;}
        .example .gray { width:25px; height:25px; text-align:center; display:flex; justify-content:center; align-items:center; color:white; border-radius:3px; font-weight:bold; font-size:14px;}
      `}</style>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content bg-white dark:bg-gray-900 " onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className=" font-semibold text-2xl pb-4 " >Cara Bermain</h2>
              <span className="modal-close" onClick={() => setShowModal(false)}>×</span>
            </div>
            <div className="modal-body space-y-2 pb-4">
              <p>Terdapat 1 kata rahasia yang bisa kamu tebak. Tebak Kata dalam 5 kesempatan.</p>
              <p>Setiap tebakan harus merupakan kata valid 5 huruf sesuai KBBI. Tekan tombol ENTER untuk mengirimkan jawaban.</p>
              <p>Setelah jawaban dikirimkan, warna kotak akan berubah untuk menunjukkan seberapa dekat tebakanmu dari kata rahasia.</p>
              <hr className=" my-3" />
              <p>Contoh:</p>
              <div className="example">
                <div className="green">S</div> <span>Huruf S ada dan posisinya sudah tepat</span>
              </div>
              <div className="example">
                <div className="yellow">A</div> <span>Huruf A ada namun posisinya belum tepat</span>
              </div>
              <div className="example">
                <div className="gray">K</div> <span>Tidak ada huruf K di kata rahasia</span>
              </div>
              <hr className=" my-3" />
              <p>Akan berwarna hijau jika anda berhasil menebak semuannya dan Gagal!! jika kesempatan menebakmu habis</p>
            </div>
          </div>
        </div>
      )}

      {/* BUTTON MODAL */}
      <div className="flex justify-center items-center">
        <div className="flex my-5 md:min-w-md px-1" >
          <button
            onClick={() => setShowModal(true)}
            className="mr-20 cursor-pointer focus:outline-none"
          >
            <IoMdHelpCircleOutline size={35} />
          </button>

          <h1 className="text-3xl font-bold text-centerborder">
            <span className="text-red-700">Y</span>
            <span className="text-orange-700">u</span>
            <span className="text-amber-700">k</span>
            <span className="text-yellow-700">k</span>
            &nbsp;
            <span className="text-lime-700">T</span>
            <span className="text-green-700">e</span>
            <span className="text-emerald-700">b</span>
            <span className="text-teal-700">a</span>
            <span className="text-cyan-700">k</span>
            &nbsp;
            <span className="text-sky-700">K</span>
            <span className="text-blue-700">a</span>
            <span className="text-indigo-700">t</span>
            <span className="text-purple-700">a</span>
          </h1>
        </div>
      </div>


      <div className="px-4 max-w-lg mx-auto">
        <hr className="mb-8" />
      </div>


      {/* GRID */}
      <div className="justify-center" style={{ display: "grid", gap: "5px" }}>
        {grid.map((row, r) => (
          <div style={{ display: "flex", gap: "8px" }} key={r}>
            {row.map((letter, c) => (
              <input
                key={c}
                id={`box-${r}-${c}`}
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
                  className={`key bg-gray-300 dark:bg-gray-800 ${["ENTER", "DEL"].includes(key) ? "special" : ""}`}
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
}
