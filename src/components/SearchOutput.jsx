'use client';
import React, { useEffect, useState } from "react";
import { getRoverCameras } from "@/lib/api";

export default function SearchOutput({ onclose, rover, camera, date }) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [checkingNext, setCheckingNext] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;


    //processo de montagem do modal de busca
    useEffect(() => {
        if (!rover) {
            setPhotos([]);
            return;
        }

        let mounted = true;
        setLoading(true);
        setError(null);

        if (!date) {
            setError("Earth date is required.");
            setPhotos([]);
            setLoading(false);
            setHasNext(false);
            return;
        }

        // Renderiza a primeira pagina de fotos
        getRoverCameras(rover, apiKey, camera || undefined, date || undefined, page)
            .then((res) => {
                if (!mounted) return;
                setPhotos(res || []);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err.message || "Failed to load photos");
                setPhotos([]);
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [rover, camera, date, page, apiKey]);

    // Verifica se há mais uma pagina de objetos (25 objetos por pagina)
    useEffect(() => {
        if (!rover || !date) {
            setHasNext(false);
            return;
        }

        if (photos.length < 25) {
            setHasNext(false);
            return;
        }

        let mounted = true;
        setCheckingNext(true);

        (async () => {
            try {
                const next = await getRoverCameras(
                    rover,
                    apiKey,
                    camera || undefined,
                    date || undefined,
                    page + 1
                );
                if (!mounted) return;
                setHasNext(Array.isArray(next) && next.length > 0);
            } catch (err) {
                if (!mounted) return;
                console.error("Error checking next page:", err);
                setHasNext(false);
            } finally {
                if (!mounted) return;
                setCheckingNext(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [photos, rover, camera, date, page, apiKey]);

    function converterData(iso) {
        if (!iso || typeof iso !== "string") return "";
        const parts = iso.split("-");
        if (parts.length !== 3) return iso; // fallback
        const [yyyy, mm, dd] = parts;
        return `${dd}-${mm}-${yyyy}`;
    }




    //Modal de Busca
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 h-5/6 bg-white rounded-sm bg-opacity-90 flex flex-col z-50 p-4 overflow-auto">
            <button
                className="text-white absolute right-2 top-2 px-3 py-1 rounded bg-red-600 hover:bg-red-700 cursor-pointer"
                onClick={onclose}

            >
                X
            </button>

            <h3 className="text-black text-xl font-semibold mb-3">Buscando fotos para o: {rover}</h3>

            {loading && <div className="text-black">Carregando…</div>}
            {error && <div className="text-red-600">Erro: {error}</div>}

            {!loading && !error && photos.length === 0 && (
                <div className="text-black">A busca retornou nenhuma foto, tente mudar os padrões de busca</div>
            )}

            {!loading && photos.length > 0 && (
                //Grid de objetos retornados pela busca de api
                <>
                    <div className="justify-items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map((p) => (
                            <div key={p.id} className="w-4/5 bg-white rounded shadow overflow-hidden">
                                <a href={p.img_src} target="_blank" rel="noreferrer">
                                    <img
                                        src={p.img_src}
                                        alt={`Mars photo ${p.id}`}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/imagePlaceholder.png";
                                        }}
                                    />
                                </a>
                                <div className="p-2 text-sm text-gray-700">
                                    <div><strong>Rover:</strong> {p.rover.name}</div>
                                    <div><strong>Camera:</strong> {p.camera?.full_name || p.camera?.name}</div>
                                    <div><strong>Data da foto:</strong> {converterData(p.earth_date)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controle de Paginação */}
                    {/* Mostra navegação de paginas*/}
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            disabled={page === 1 || loading}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            className="text-stone-950 px-4 py-2 bg-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-blue-800"
                        >
                            Anterior
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                className="text-stone-950 px-4 py-2 bg-blue-600 rounded cursor-default"
                                disabled
                            >
                                Pagina {page}
                            </button>


                            {checkingNext && <span className="text-sm text-gray-500">checking next…</span>}
                        </div>

                        <button
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={loading || checkingNext || !hasNext}
                            className="text-stone-950 px-4 py-2 bg-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-blue-800"
                        >
                            Próximo
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}