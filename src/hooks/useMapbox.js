import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { v4 } from "uuid";
import { Subject } from "rxjs";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYnJpYW5kYXZpZDhhIiwiYSI6ImNrcDVyNnJ5dTJibHYydXF3ZjU1OHNxa3EifQ.eU3cwpWnreBBGdYfQLjskw";

const puntoInicial = {
  lng: -70.6695,
  lat: -33.4576,
  zoom: 11.61,
};

const useMapbox = () => {
  const mapaDiv = useRef();
  const mapa = useRef();
  const [coords, setCoords] = useState(puntoInicial);

  const marcadores = useRef({});

  // Observables de Rxjs
  const movimientoMarcador = useRef(new Subject());
  const nuevoMarcador = useRef(new Subject());

  const agregarMarcador = useCallback((ev, id) => {
    const { lng, lat } = ev.lngLat || ev;

    const marker = new mapboxgl.Marker();

    marker.id = id ?? v4();

    marker.setLngLat([lng, lat]).addTo(mapa.current).setDraggable(true);

    marcadores.current[marker.id] = marker;

    // console.log(`id`, id);
    // console.log(`id`, !id);

    if (!id) {
      nuevoMarcador.current.next({
        id: marker.id,
        lng,
        lat,
      });
    }

    marker.on("drag", ({ target }) => {
      const { id } = target;
      const { lng, lat } = target.getLngLat();

      movimientoMarcador.current.next({
        id,
        lng,
        lat,
      });
    });
  });

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [puntoInicial.lng, puntoInicial.lat],
      zoom: puntoInicial.zoom,
    });

    mapa.current = map;
  }, []);

  useEffect(() => {
    mapa.current?.on("move", () => {
      const { lng, lat } = mapa.current.getCenter();
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapa.current.getZoom().toFixed(2),
      });
    });

    // return mapa?.off("move");
  }, []);

  useEffect(() => {
    mapa.current?.on("click", (ev) => {
      agregarMarcador(ev);
    });
  }, [agregarMarcador]);

  // actualizar la ubicacion del marcador
  const actualizarPosicion = useCallback((marcador) => {
    const { id, lng, lat } = marcador;
    marcadores.current[id].setLngLat([lng, lat]);
  }, []);

  return {
    coords,
    mapaDiv,
    marcadores,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    agregarMarcador,
    actualizarPosicion,
  };
};

export default useMapbox;
