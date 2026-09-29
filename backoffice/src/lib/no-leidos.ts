import { useSyncExternalStore } from "react";
import { collections } from "@/lib/data";

/**
 * Contador de mensajes sin leer que ve el menú lateral, como el globito de
 * WhatsApp.
 *
 * Vive a nivel de módulo y no dentro de un componente a propósito: lo necesitan
 * el menú —que está en todas las pantallas— y la bandeja, que no comparten
 * árbol, y si cada uno pidiera la lista por su cuenta habría dos sondeos
 * pidiendo lo mismo. Acá hay uno solo con varios suscriptores.
 *
 * El número baja cuando el mensaje pasa a `leido`, nada más. Archivar un mensaje
 * que nadie leyó **no** lo baja: sigue pendiente de leer, y esconderlo sería
 * justo lo contrario de lo que el contador sirve.
 *
 * Nota: el backend no tiene un endpoint de conteo, así que se pide la lista y se
 * cuentan los `leido === false`. Es una petición de más cada 30 segundos,
 * aceptable a esta escala; si algún día la bandeja crece, lo suyo es un
 * `GET /api/mensajes/sin-leer/count` que devuelva solo el número.
 */
const POLL_MS = 30_000;

let noLeidos = 0;
let timer: number | null = null;
let enVuelo = false;
const suscriptores = new Set<() => void>();

function publicar(n: number) {
  if (n === noLeidos) return;
  noLeidos = n;
  for (const avisar of suscriptores) avisar();
}

async function pedir() {
  // Sin esto, cada tick con una petición todavía en vuelo encola otra: en una
  // red lenta se acumulan y las respuestas llegan desordenadas.
  if (enVuelo) return;
  enVuelo = true;
  try {
    const lista = await collections.mensajes().list();
    publicar(lista.filter((m) => !m.leido).length);
  } catch {
    // Se conserva el último número: poner un cero por un fallo de red diría «no
    // hay nada pendiente», que es lo contrario de lo que acaba de pasar.
  } finally {
    enVuelo = false;
  }
}

function alVolverALaPestana() {
  // Al volver a la pestaña se refresca de inmediato en vez de esperar hasta 30
  // segundos, que es cuando más se nota el desfase.
  if (document.visibilityState === "visible") void pedir();
}

function arrancar() {
  void pedir();
  timer = window.setInterval(() => {
    if (document.visibilityState === "visible") void pedir();
  }, POLL_MS);
  document.addEventListener("visibilitychange", alVolverALaPestana);
}

function parar() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", alVolverALaPestana);
}

function subscribe(avisar: () => void) {
  suscriptores.add(avisar);
  if (suscriptores.size === 1) arrancar();
  return () => {
    suscriptores.delete(avisar);
    if (suscriptores.size === 0) parar();
  };
}

function getSnapshot() {
  return noLeidos;
}

/**
 * Fuerza un recuento ya. La bandeja lo llama al marcar como leído o al borrar,
 * porque su estado local cambia al instante y el contador, si no, tardaría
 * hasta medio minuto en enterarse: el número tiene que caer al mismo tiempo que
 * la fila deja de estar resaltada.
 */
export function refrescarNoLeidos() {
  void pedir();
}

export function useNoLeidos(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
