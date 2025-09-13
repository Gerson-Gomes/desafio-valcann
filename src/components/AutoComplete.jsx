'use client';
import { useEffect, useState, useRef } from "react";


export default function AutoComplete({
  options = [],
  value = "",
  onChange,
  onSelect,
  placeholder = "",
  name = "autocomplete",
  optional = false,
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => setQuery(value ?? ""), [value]);

  useEffect(() => {
    const outsideClick = (e) => {
      if (!containerRef.current || !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", outsideClick);
    return () => document.removeEventListener("mousedown", outsideClick);
  }, []);

  // resolve options: aceita array ou função que retorna array
  const resolvedOptions = (() => {
    try {
      if (typeof options === "function") {
        const res = options();
        return Array.isArray(res) ? res : [];
      }
      return Array.isArray(options) ? options : [];
    } catch {
      return [];
    }
  })();

  // Inicio da logica de ordenação dos inputs

 

  //Algoritimo de levenshtein para lidar com nomes distintos de cameras ex:FHAZ e FHAZ_LEFT_B
  function levenshtein(a = "", b = "") {
    a = a.split("");
    b = b.split("");
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  // --- util: calcula "pontuação" de similaridade entre opção e query (menor = melhor)
  function similarityScore(opt, q) {
    const a = String(opt ?? "").toLowerCase();
    const b = String(q ?? "").trim().toLowerCase();

    if (!b) return 1; // query vazio -> preserve ordem, mas give small uniform score

    // prioridade: startsWith -> 0 (melhor)
    if (a.startsWith(b)) return 0;

    // se aparece em outra posição, dá uma pontuação baixa baseada no índice
    const idx = a.indexOf(b);
    if (idx >= 0) return 1 + idx; // quanto menor idx, melhor

    // caso contrário, use distância de levenshtein (normalizada)
    const dist = levenshtein(a, b);
    // normaliza por tamanho das strings (evita penalizar strings longas demais)
    const norm = dist / Math.max(a.length, b.length, 1);
    return 2 + norm; // garantir que startsWith/indexOf vençam antes
  }

  // Sempre mostramos todas as opções; ordenamos por similarityScore quando houver query.
  const sortedOptions = (() => {
    const arr = [...resolvedOptions];
    if (!query || String(query).trim() === "") {
      // manter ordem original quando query vazia
      return arr;
    }
    // calcular score e ordenar ascendente (menor -> mais relevante)
    return arr
      .map((opt, idx) => ({ opt, idx, score: similarityScore(opt, query) }))
      .sort((a, b) => {
        if (a.score === b.score) return a.idx - b.idx; // fallback estabilidade
        return a.score - b.score;
      })
      .map(x => x.opt);
  })();

  // quando o usuário digitar, destacar o melhor item (índice 0 após ordenação)
  useEffect(() => {
    if (open && sortedOptions.length > 0) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, resolvedOptions.length]);
  // Fim da logica de input



  //Garante que o usuario escolheu uma das opções pré-selecionadas
  const validateAndClose = () => {
    const match = resolvedOptions.find(o => o.toLowerCase() === (query ?? "").trim().toLowerCase());
    if (!match && !optional) {
      setError("Escolha uma das opções disponíveis");
    } else {
      if (match) {
        setQuery(match);
        onSelect?.(match);
        onChange?.(match);
      }
      setError(null);
    }
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    onChange?.(e.target.value);
    setOpen(true);
    if (error) setError(null);
    // activeIndex será atualizado pelo useEffect que observa `query`
  };



  //Elemtento de input usado para o input do Rover e da Camera
  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        name={name}
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (open && activeIndex >= 0 && sortedOptions[activeIndex]) {
              e.preventDefault();
              const opt = sortedOptions[activeIndex];
              onSelect?.(opt);
              onChange?.(opt);
              setQuery(opt);
              setError(null);
              setOpen(false);
              setActiveIndex(-1);
            } else {
              validateAndClose();
            }
          }
          if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (sortedOptions.length === 0) return;
            setActiveIndex(i => (i === -1 ? 0 : Math.min(i + 1, sortedOptions.length - 1)));
            setOpen(true);
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (sortedOptions.length === 0) return;
            setActiveIndex(i => (i <= 0 ? sortedOptions.length - 1 : i - 1));
            setOpen(true);
          }
        }}
        onBlur={() => {
          if (!optional) {
            setTimeout(() => validateAndClose(), 120);
          } else {
            setOpen(false);
            setActiveIndex(-1);
          }
        }}
        placeholder={placeholder}
        aria-expanded={open}
        aria-autocomplete="list"
        className={`w-full h-[3rem] text-stone-900 p-2 bg-sky-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"} ${className}`}
      />

      {open && sortedOptions.length > 0 && (
        <ul
          role="listbox"
          aria-label={name}
          className="absolute z-20 mt-1 text-stone-900 max-h-44 w-full overflow-auto rounded-md border bg-white shadow-lg"
        >
          {sortedOptions.map((opt, idx) => (
            <li
              key={`${opt}-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect?.(opt);
                onChange?.(opt);
                setQuery(opt);
                setError(null);
                setOpen(false);
                setActiveIndex(-1);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`cursor-pointer px-3 py-2 ${activeIndex === idx ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}