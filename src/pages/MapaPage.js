import React, { useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import useMapbox from "../hooks/useMapbox";

const MapaPage = () => {
  const {
    coords,
    mapaDiv,
    nuevoMarcador$,
    movimientoMarcador$,
    agregarMarcador,
    actualizarPosicion,
  } = useMapbox();

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    socket.on("marcadores-activos", (marcadores) => {
      for (const key of Object.keys(marcadores)) {
        agregarMarcador(marcadores[key], key);
        console.log(`marcadores-activos`);
      }
    });
  }, [socket, agregarMarcador]);

  useEffect(() => {
    nuevoMarcador$.subscribe((marcador) => {
      socket.emit("marcador-nuevo", marcador);
    });
  }, [nuevoMarcador$, socket]);

  useEffect(() => {
    socket.on("marcador-actualizado", (marcador) => {
      actualizarPosicion(marcador);
    });
  }, [socket]);

  // mover marcador mediante sockets
  useEffect(() => {
    movimientoMarcador$.subscribe((marcador) => {
      socket.emit("marcador-actualizado", marcador);
    });
  }, [socket, movimientoMarcador$]);

  useEffect(() => {
    socket.on("marcador-nuevo", (marcador) => {
      console.log(`marcador`, marcador);
      agregarMarcador(marcador, marcador.id);
    });
  }, [socket, agregarMarcador]);

  return (
    <>
      <div className="info">
        Lng: {coords.lng} | lat: {coords.lat} | zoom: {coords.zoom}
      </div>
      <div ref={mapaDiv} className="mapContainer" />
    </>
  );
};

export default MapaPage;
