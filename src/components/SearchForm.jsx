'use client';
import { useEffect, useState } from "react";
import AutoComplete from "./AutoComplete";
import { createPortal } from "react-dom";
import SearchOutput from "./SearchOutput";
import { getRoverCameras } from "@/lib/api";

const ROVERS = ["Curiosity", "Opportunity", "Spirit"];

const CURIOSITYCAMERAS = ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM","MAST_LEFT","CHEMCAM_RMI","NAV_RIGHT_B","NAV_LEFT_B","FHAZ_LEFT_B","FHAZ_RIGHT_B","RHAZ_LEFT_B","RHAZ_RIGHT_B","MAST_RIGHT"];
const OPPORTUNITYCAMERAS = ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"];
const SPIRITCAMERAS = ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"];

export default function SearchForm({ onSubmit }) {
  const [rover, setRover] = useState("");
  const [camera, setCamera] = useState("");
  const [date, setDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorRover, setErrorRover] = useState(false);
  const [errorDate, setErrorDate] = useState(false);

  // Logica para garantir o input de um rover valido
  useEffect(() => {
    if (rover && ROVERS.includes(rover)) {
      setErrorRover(false);
    }
  }, [rover]);

  useEffect(() => {
    if (camera) {
      setCamera("");
    }
  }, [rover]);

  const availableCameras =
    rover === "Curiosity" ? CURIOSITYCAMERAS
      : rover === "Opportunity" ? OPPORTUNITYCAMERAS
        : rover === "Spirit" ? SPIRITCAMERAS
          : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

    //Garante que o submit não funcione sem um valor de rover
    if (!rover || !ROVERS.includes(rover)) {
      setErrorRover(true);
      setShowModal(false); // Fecha modal se input de rover for invalido
      return;
    }
    setErrorRover(false);


    // logica de validação da data
    if (!date) {
      setErrorDate(true);
      setShowModal(false); // Fecha modal se input de data for invalido
      return;
    }
    setErrorDate(false);

    const cameraParam = camera && camera !== "" ? camera : undefined;
    const dateParam = date && date !== "" ? date : undefined;

    try {
      const photos = await getRoverCameras(rover, apiKey, cameraParam, dateParam);
      console.log("photos found:", photos.length);

      // Abre modal após validação
      setShowModal(true);
    } catch (err) {
      console.error("Erro ao buscar fotos:", err);
      setShowModal(false);
    }
  };

  return (
    // Formulario de busca
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex justify-between gap-4">
        {/*Campo de inserção de rovers*/}
        <div className="mb-6 w-2/5">
          <label className="block w-full mb-2 font-medium text-sky-100">Rover</label>
          <AutoComplete
            name="rover"
            options={ROVERS}
            optional={false}
            value={rover}
            onChange={(v) => setRover(v)}
            onSelect={(v) => setRover(v)}
            placeholder="Rover..."
            className={`text-stone-900 ${errorRover ? "border-2 border-red-500 rounded" : ""}`}
          />
          <p className="text-red-400">{errorRover ? "Rover inválido" : ""}</p>
        </div>
        {/*Campo de inserção das cameras (Opicional)*/}
        <div className="mb-6 w-3/5">
          <label className="block w-full mb-2 font-medium text-sky-100">Camera</label>
          <AutoComplete
            name="camera"
            placeholder="Escolha um rover primeiro"
            options={availableCameras}
            optional={true}
            value={camera}
            onChange={(v) => setCamera(v)}
          />
        </div>
      </div>
      {/*Campo de inserção da data*/}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`w-fit h-[3rem] p-2 text-gray-700 bg-sky-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errorDate ? "border-2 border-red-500" : ""}`}
        />
        <p className="text-red-400">{errorDate ? "Data obrigatoria" : ""}</p>
      </div>

      <div className="flex gap-4 items-center">
        {/*Botão de pesquisa*/}

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Search
        </button>

        {showModal && createPortal(
          <SearchOutput
            onclose={() => setShowModal(false)}
            rover={rover}
            camera={camera}
            date={date}
          />,
          document.body
        )}
      </div>
    </form>
  );
}