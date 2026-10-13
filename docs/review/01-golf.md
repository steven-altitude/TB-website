# 01 · Revisión S&C de golf: EntrenadorGym

Revisor: Especialista S&C de golf. Alcance: `Seed.kt`, `Api.kt` y `Data.kt` (más `Logic.kt:102-116` para el contexto que recibe la IA).
Usuario: hombre de 40 y pocos años, amateur que quiere bajar de 90. Tres días por semana no consecutivos, unos 55 min por sesión.
Prioridades: 1) rendimiento de golf, 2) movilidad, 3) estética. Condición en todo el plan: sin dolor.

> Nota sobre la verificación: WebFetch y curl no pudieron abrir PubMed, PMC ni los repositorios (DNS o proxy 403). Por eso cada fuente "verificada" se confirmó por su registro bibliográfico o su resumen en los resultados de búsqueda: autor, año, revista y DOI o URL. No leí el texto completo de ninguna. Cuando doy cifras, vienen de esos resúmenes.

---

## 0. Qué dice la evidencia (lo que guía la crítica)

- **El entrenamiento de fuerza y acondicionamiento (S&C) mejora la velocidad del palo (CHS) y la distancia.** En los estudios con resultados significativos, la mejora media fue de alrededor del 4-6,4 % en CHS, velocidad de bola y distancia (Ehlert 2020).
- **Combinar trabajo general con trabajo específico de golf funciona mejor que el trabajo general solo.** Uthoff 2021: CHS +4,1 % con la combinación frente a +1,6 % con trabajo no específico.
- **Lo que más se asocia a la CHS es la capacidad explosiva.** En el metaanálisis de Brennan 2024, la potencia del tren superior (r≈0,51), la fuerza del tren inferior (r≈0,46), la fuerza del tren superior (r≈0,41) y la potencia del tren inferior (r≈0,38) son las asociaciones más fuertes. Los saltos se asocian más que la fuerza máxima de pierna. **La flexibilidad no se asoció de forma significativa con la CHS.**
- **En profesionales destacan dos pruebas: el salto sin contramovimiento y el lanzamiento sentado de balón medicinal.** Lewis 2016 encontró que el salto (r=0,817) y el lanzamiento de pecho sentado (r=0,706) explican el 74 % de la varianza. En los mayores de 30, el lanzamiento rotacional también correlacionó.
- **Del salto con contramovimiento (CMJ) importan el impulso y la potencia, más que la altura** (Wells 2022). Lo práctico: registrar la altura junto con el peso corporal para estimar la potencia.
- **Los programas de 8 semanas mejoran la CHS en amateurs y universitarios.** Fletcher y Hartwell 2004 combinaron pesas con pliometría. Oranchuk 2020 usó fuerza y potencia con barra. Lephart 2007 aplicó un programa específico de golf en hombres de unos 47 años y mejoró la fuerza rotacional, la abducción de cadera y la flexibilidad. Las muestras son pequeñas.
- **Dolor lumbar:** las revisiones señalan como factores la falta de rotación interna de la cadera adelantada, la poca resistencia del tronco y la técnica del swing. Es una asociación, no una prueba de causa (Golf-Related LBP review; Smith 2018).

Conclusión práctica: para este usuario la prioridad del gimnasio debe ser la **potencia de pierna y de tren superior (saltos y lanzamientos rotacionales y de pecho) sobre una base de fuerza**. La movilidad debe bastar para alcanzar las posiciones del swing sin dolor. No es lo que mueve la velocidad.

---

## 1. Errores del programa actual

| # | Dónde | Problema | Por qué importa |
|---|---|---|---|
| 1 | `Seed.kt:34-61` | El plan se divide por grupos musculares ("Piernas", "Tren superior", "Potencia"), no es full body A/B/C. | El tren inferior entra 2 días y el superior 1. La potencia aparece solo 1 vez por semana. |
| 2 | `Seed.kt:34-52` | Los días 1 y 2 no tienen bloque de potencia. | La potencia es lo que más se asocia a la CHS (Brennan 2024). Con 1 exposición semanal se desperdicia el estímulo principal. |
| 3 | Todo `Seed.kt` | No hay ni un salto ni un lanzamiento de balón medicinal. El único trabajo "explosivo" es la sentadilla goblet rápida (`:55`) y la rotación en polea (`:56`). | Los saltos y el lanzamiento de pecho sentado son los mejores correlatos de la CHS (Lewis 2016; Brennan 2024). Una goblet rápida con kettlebell tiene poca transferencia a la potencia. |
| 4 | `Data.kt:29` (`DEFAULT_RESTRICTIONS`: "Rodilla izquierda: sin impacto ni saltos") | La restricción está desactualizada: ahora los saltos están permitidos con aterrizajes controlados. Este texto llega al prompt (`Api.kt:71`). | La IA tiene **prohibido** el estímulo más útil para la velocidad. |
| 5 | `Data.kt:26` ("sin press por encima de 90°... nada de jalón al pecho ni dominadas"), `Seed.kt:44,75` ("sin pasar de 90°") | Restricción de hombro desactualizada: ahora se permite carga ligera por encima de 90° con progresión. | No hay ningún tirón vertical ni trabajo por encima de la cabeza. Así se pierde la capacidad del hombro en el rango final del backswing y del finish, y queda menos variedad para la estética (dorsal y deltoides). |
| 6 | `Seed.kt:36-39` | El tren inferior no tiene trabajo unilateral ni lateral (goblet, prensa y puente son bilaterales y sagitales). La cossack (`:57`) es casi de movilidad, a RPE 6. | El swing transmite fuerza sobre una pierna (la adelantada) y en el plano frontal y transversal. Lo pedido incluye unilateral. |
| 7 | `Seed.kt:56` | Rotación explosiva a RPE 8 con 60 s de descanso. | En potencia se prescribe intención máxima de velocidad sin fatiga, no esfuerzo percibido alto. Con RPE 8 baja la velocidad y la calidad. *(Principio general de entrenamiento: no verificado como cifra concreta.)* |
| 8 | `Seed.kt` (ningún día) | No hay acarreos (suitcase o farmer). | Es lo pedido como alternativa a la anti-rotación. Entrenan el tronco anti-flexión lateral y el agarre en poco tiempo. |
| 9 | `Seed.kt:43-52` | El día 2 no tiene movilidad inicial real (el face pull está etiquetado como `mov`), tampoco core anti-rotación, y lleva 2 accesorios de brazo de 2 series cada uno. | Rompe la estructura acordada: movilidad, potencia, fuerza, accesorios, core e isométrico. |
| 10 | `Seed.kt:60` | Cierre con 5 min de bici suave. | Son 5 de 55 minutos con poco efecto sobre los objetivos. Ese tiempo rinde más en potencia o en un acarreo. |
| 11 | `Seed.kt:28` / `Api.kt:67,180,186` | La progresión es genérica ("semana 4 intensificación, semana 5 descarga"): no progresa el volumen de saltos ni la complejidad, y no incluye semana de pruebas. El bloque de 5 semanas está fijado en el código. | Sin pruebas cada 4 semanas no se sabe si el programa mejora la CHS. La pliometría necesita una progresión explícita por la rodilla. |
| 12 | `Seed.kt` (todo) | Falta trabajo de **rotación interna de la cadera adelantada**. El 90/90 la toca solo de pasada. | La limitación de rotación interna de la cadera adelantada aparece asociada al dolor lumbar en golfistas (revisión LBP). Es relevante porque la espalda baja es su zona sensible. |
| 13 | `Data.kt:32-35` (`GOALS`) | El orden pone la movilidad primero y el golf segundo. | Invierte la prioridad del usuario. La evidencia no asocia la flexibilidad a la CHS (Brennan 2024). |
| 14 | `Api.kt:74` | "Reparte los tres pilares en los tres días... Cada día con un foco distinto" | Empuja a la IA a hacer una rutina dividida (justo el error 1) en lugar de full body A/B/C. |
| 15 | `Api.kt:75` / `Data.kt:46` | `pillar` solo admite `mov`, `golf` o `fuerza`. Cualquier otro valor se convierte en `fuerza`. | No se pueden distinguir los bloques de potencia, accesorios, core e isométrico. La app no puede comprobar que la estructura se cumpla. |
| 16 | `Api.kt:78` | La lista de `motion` no tiene ids para saltos, lanzamientos, zancada búlgara, step-up, acarreos, jalón, landmine ni chop. | La IA tiende a evitar ejercicios sin animación, o los marca `generic`. |
| 17 | `Data.kt:11-14` (`Ex`) | Falta el campo `why` (por qué el ejercicio ayuda al golf o al objetivo). | Es lo pedido y mejora la adherencia. |
| 18 | `Logic.kt:102-116` + `Data.kt:100-109` | La CHS se guarda (`speeds.json`) pero **no se envía a la IA**. Los isométricos (`hold`) tampoco entran en el resumen. No hay pruebas de potencia ni de movilidad. | La IA ajusta sin ver el resultado que realmente importa. |
| 19 | `Data.kt:37` (`EQUIPMENT`) | Falta el banco y no hay balón medicinal. | Recomendación: comprar un balón medicinal blando (3-4 kg) para lanzar contra la pared. Es el implemento más rentable para la potencia rotacional y para las pruebas. |
| 20 | `Seed.kt:17-23` (pre-ronda) | El calentamiento de ronda solo tiene swings lentos. | Faltan 3-5 swings progresivos a velocidad alta antes del tee. *(Recomendación práctica: no verificado.)* |

---

## 2. Plan A/B/C propuesto (8 semanas)

**Reglas comunes**
- **Potencia:** intención máxima en cada repetición. Se detiene la serie si baja la velocidad o la calidad del aterrizaje. No usa RPE: se marca "máx. intención, 2-3 reps en reserva de fatiga".
- **Saltos:** aterrizaje "silencioso" y estabilizado 2 s, rodillas alineadas, aterrizaje sobre cajón al principio. **Regla de rodilla izquierda:** si el dolor pasa de 2/10 durante el ejercicio o al día siguiente, se baja un nivel. *(Umbral 0-2/10 tomado de la práctica clínica habitual: no verificado.)*
- **Fuerza:** doble progresión. Al completar el tope de reps en todas las series con las RIR indicadas, se sube carga (+2-5 %). *(Práctica estándar: no verificado como cifra.)*
- **Espalda baja:** sin peso muerto, RDL ni swing de kettlebell (es una bisagra balística, así que lo excluyo por prudencia). La sentadilla se hace frontal o goblet para mantener el torso vertical.
- **Hombro sobre 90°:** semanas 1-2 solo landmine. Semanas 3-4 jalón neutro ligero. Desde la semana 5, press unilateral con mancuerna en media rodilla, ligero (RIR ≥3) y solo si el dolor es 0-2/10.
- **Superseries** para que todo quepa en 55 min. Formato: ejercicio · series×reps · descanso · intensidad.

### Sesión A: rodilla dominante + empuje horizontal
| Bloque (min) | Ejercicio | S×R | Desc. | Intensidad |
|---|---|---|---|---|
| Movilidad (7) | 90/90 con elevaciones de pie (rotación interna de cadera) | 1×5/lado | — | suave |
| | Rotación torácica en cuadrupedia | 1×6/lado | — | suave |
| | Flexor de cadera en media rodilla + alcance overhead | 1×30 s/lado | — | suave |
| | Snap-down (caída a aterrizaje estable) | 2×3 | 30 s | técnica |
| Potencia (10) | A1 Salto al cajón (40-50 cm, bajar caminando) | 3×3 | 60 s | máx. intención |
| | A2 Lanzamiento rotacional de balón medicinal a pared (scoop, postura de golf) *(sin balón: rotación explosiva en polea a altura de cadera)* | 3×4/lado | 60 s | máx. intención |
| Fuerza (22) | B1 Sentadilla frontal con barra o goblet pesada, profundidad completa | 4×5-6 | 90 s | RIR 2-3 |
| | B2 Remo con mancuerna a un brazo | 4×8/lado | 60 s | RIR 2 |
| | C1 Sentadilla búlgara (pie trasero en banco) | 3×6-8/lado | 60 s | RIR 2 |
| | C2 Press de banca con mancuernas | 3×6-8 | 60 s | RIR 2 |
| Accesorios (6) | D1 Elevación lateral con mancuernas + D2 Curl inclinado | 2×12-15 c/u | 45 s | RIR 1-2 |
| Core (4) | Pallof press en media rodilla, pausa 2 s | 2×8/lado | 30 s | RPE 7 |
| Isométrico (3) | Plancha lateral | 2×25-40 s/lado | 30 s | RPE 7 |

### Sesión B: cadera dominante + tirón vertical + acarreo
| Bloque (min) | Ejercicio | S×R | Desc. | Intensidad |
|---|---|---|---|---|
| Movilidad (7) | Sentadilla profunda con apoyo + rotación torácica | 1×5/lado | — | suave |
| | Apertura de libro | 1×6/lado | — | suave |
| | Movilidad de tobillo en pared | 1×8/lado | — | suave |
| | Rotación interna/externa de cadera en cuadrupedia (CARs) | 1×3/lado | — | lento |
| Potencia (10) | A1 CMJ con aterrizaje estabilizado (desde la semana 3; semanas 1-2: salto al cajón) | 3×3-4 | 60 s | máx. intención |
| | A2 Lanzamiento de pecho con balón medicinal a pared, de pie en postura escalonada *(alternativa: press explosivo en polea a un brazo)* | 3×5 | 60 s | máx. intención |
| Fuerza (22) | B1 Hip thrust con barra | 4×6-8 | 90 s | RIR 2 |
| | B2 Jalón al pecho con agarre neutro (semanas 1-2: remo alto en polea a altura de pecho) | 4×8-10 | 60 s | RIR 3 |
| | C1 Step-up al banco (rodilla adelantada estable) | 3×6-8/lado | 60 s | RIR 2 |
| | C2 Press landmine en media rodilla (desde la semana 5: press con mancuerna a un brazo, ligero) | 3×8/lado | 60 s | RIR 3 |
| Accesorios (6) | D1 Abducción de cadera en polea + D2 Face pull | 2×12-15 c/u | 45 s | RIR 2 |
| Acarreo (4) | Suitcase carry (una mano) | 3×30 m/lado | 45 s | carga pesada, torso vertical |
| Isométrico (3) | Plancha frontal RKC (máxima tensión) | 3×15-20 s | 30 s | RPE 8 |

### Sesión C: rotacional y lateral + empuje inclinado
| Bloque (min) | Ejercicio | S×R | Desc. | Intensidad |
|---|---|---|---|---|
| Movilidad (7) | Gato-camello | 1×6 | — | suave |
| | Rotación torácica de pie en postura de golf con palo | 1×8/lado | — | suave |
| | Zancada con rotación | 1×5/lado | — | suave |
| | Pogo submáximo (preparación de tobillo y tendón; desde la semana 3) | 2×8 | 30 s | bajo |
| Potencia (10) | A1 Salto lateral (skater) con aterrizaje estabilizado 2 s | 3×3/lado | 60 s | máx. intención |
| | A2 Lanzamiento rotacional tipo shot-put con balón medicinal (o rotación explosiva en polea) | 3×4/lado | 60 s | máx. intención |
| | *(Opcional, semanas 5-8)* Swings de velocidad con driver o palo ligero, máxima velocidad | 2×5 | 60 s | máx. |
| Fuerza (22) | B1 Prensa de piernas | 3×8-10 | 90 s | RIR 2 |
| | B2 Remo en polea baja a un brazo con rotación | 3×10/lado | 60 s | RIR 2 |
| | C1 Zancada lateral (cossack) con kettlebell goblet | 3×6/lado | 60 s | RIR 2-3 |
| | C2 Press inclinado con mancuernas | 3×8-10 | 60 s | RIR 2 |
| Accesorios (6) | D1 Rotación externa en polea + D2 Extensión de tríceps en polea | 2×12-15 c/u | 45 s | RIR 2 |
| Core (4) | Chop de alto a bajo en polea, controlado | 2×8/lado | 30 s | RPE 7 |
| Isométrico (3) | Isométrico de split squat (pierna adelantada) o sentadilla en pared | 2×30-45 s | 30 s | RPE 7-8 |

**Cómo cabe en 55 min:** movilidad 7 + potencia 10 + fuerza 22 (dos superseries) + accesorios 6 + core o acarreo 4 + isométrico 3 = 52 min, más unos 3 min de transiciones. Si falta tiempo, se recorta primero el bloque de accesorios, nunca el de potencia.
**Grupos musculares:** los días no son consecutivos, así que ningún grupo se repite en días seguidos. Aun así, el tren inferior alterna rodilla (A), cadera (B) y lateral (C), y el empuje alterna horizontal, landmine e inclinado.

### Progresión de 8 semanas
| Semana | Potencia (contactos de salto por sesión) | Fuerza | Hombro sobre 90° | Notas |
|---|---|---|---|---|
| 0 | — | — | — | **Pruebas basales** (sección 4) |
| 1 | Salto al cajón 3×3 (9) | Series indicadas, RIR 3-4, técnica | Solo landmine | Aprender aterrizajes |
| 2 | 3×3 + snap-downs (≈12) | RIR 3 | Landmine | |
| 3 | Añadir CMJ (B) y pogo (C) (≈15) | RIR 2, subir carga | Jalón neutro ligero | |
| 4 | Volumen −1 serie (≈10) | −1 serie, RIR 3 | Igual | **Descarga y pruebas** al final de la semana |
| 5 | Salto lateral 3×3/lado, CMJ 4×3 (≈18) | Principales a 5-6 reps, RIR 2 | Press con mancuerna a un brazo, ligero | Añadir swings de velocidad (C) |
| 6 | Igual, +1 serie en lanzamientos (4×4) (≈18-20) | RIR 1-2 | +1 carga si dolor 0-2 | |
| 7 | Saltos en serie de 2 rebotes (cajón bajo) si la rodilla va bien (≈20) | RIR 1-2, máximo del bloque | Igual | |
| 8 | Volumen −40 % | −1 serie | Igual | **Pruebas**; la IA genera el siguiente bloque con los resultados |

*(Los números de contactos son una progresión prudente que propongo yo. No vienen de una fuente concreta: no verificado.)*

---

## 3. Cambios al prompt (`Api.kt`) y al modelo (`Data.kt`)

### 3.1 `Data.kt`
```kotlin
// Data.kt:11-14 — añadir why y block
data class Ex(
    val name: String, val sets: Int, val reps: String, val restS: Int, val holdS: Int, val note: String,
    val pillar: String = "fuerza", val rpe: Int = 7, val tempo: String = "", val load: Boolean = true,
    val video: String = "", val motion: String = "",
    val why: String = "",          // NUEVO: cómo ayuda al golf/objetivo (1 frase)
    val block: String = ""         // NUEVO: mov | potencia | fuerza | accesorio | core | iso
)
// exToJson: put("why", e.why); put("block", e.block)
// exFromJson: e.optString("why",""), e.optString("block","")  (validar contra la lista)
```
```kotlin
// Data.kt:25-30 — DEFAULT_RESTRICTIONS actualizado
const val DEFAULT_RESTRICTIONS =
    "Hombros: se permite trabajo por encima de 90° solo con carga ligera y progresión gradual " +
    "(semanas 1-2 landmine; 3-4 jalón neutro ligero; 5+ press unilateral con mancuerna ligero, RIR ≥3). " +
    "Incluir siempre rotación externa, face pull y estabilidad escapular. " +
    "Espalda baja: PROHIBIDO peso muerto, RDL, buenos días, swing de kettlebell y cualquier bisagra cargada; " +
    "priorizar sentadilla completa (frontal o goblet), glúteo medio y movilidad de cadera (rotación interna de la cadera adelantada). " +
    "Rodilla izquierda: se permiten saltos con aterrizaje controlado y estabilizado, volumen bajo y progresivo " +
    "(empezar con salto al cajón, 9-12 contactos por sesión, subir hasta unos 20); sin saltos en profundidad. " +
    "Isométricos en todas las sesiones. No repetir el mismo grupo muscular en días consecutivos. Regla de dolor: >2/10 baja un nivel."
```
```kotlin
// Data.kt:32-35 — GOALS en el orden real
const val GOALS =
    "1) Rendimiento de golf: velocidad de palo (potencia de pierna y de tren superior, rotación explosiva) y estabilidad. " +
    "2) Movilidad suficiente para el swing sin dolor (cadera —sobre todo rotación interna—, torácica, tobillo). " +
    "3) Estética: hipertrofia con accesorios."
// Data.kt:37 — EQUIPMENT: añadir "banco" y "balón medicinal de 3-4 kg (si no hay, usar polea)".
```
- `Data.kt:46`: dejar de convertir los pilares desconocidos en `fuerza` y aceptar `block` por separado.
- `Logic.kt:102-116`: añadir al `contextSummary` la última CHS y su tendencia (`loadSpeeds`), los isométricos (`hold`) y la última batería de pruebas (sección 4).

### 3.2 Texto propuesto para `Api.kt:63-86` (bloque `user`)
```text
Diseña un bloque de 8 semanas (semana 4 descarga y pruebas; semana 8 descarga y pruebas), 3 sesiones FULL BODY A/B/C
en días no consecutivos, más 2 rutinas rápidas.
OBJETIVOS EN ORDEN DE PRIORIDAD: $GOALS
EQUIPO: ...
RESTRICCIONES OBLIGATORIAS (no las rompas nunca): ${store.restrictions}
ESTRUCTURA FIJA DE CADA SESIÓN (~${opts.minutes} min), en este orden y con el campo block:
 1. block "mov" (6-8 min): 3-4 ejercicios; al menos uno de rotación interna de cadera y uno torácico.
 2. block "potencia" (10 min, cuerpo fresco): 1 salto (aterrizaje controlado) + 1 lanzamiento o rotación explosiva
    (balón medicinal o polea); 3-4 series de 3-5 reps, descanso 60-90 s, intención máxima, rpe 0 (no aplica).
 3. block "fuerza" (20-24 min): pierna + empuje + tirón en dos superseries; al menos un ejercicio de pierna UNILATERAL;
    4-8 reps en los principales, RIR 1-3 (pon el rpe equivalente).
 4. block "accesorio" (5-6 min): 2 ejercicios estéticos en superserie, 12-15 reps.
 5. block "core" (3-4 min): anti-rotación (Pallof o chop) o acarreo (suitcase o farmer).
 6. block "iso" (3 min): un isométrico, hold_s > 0, reps "1".
DIFERENCIA ENTRE DÍAS: A = rodilla dominante + empuje horizontal; B = cadera dominante + tirón vertical + acarreo;
C = rotacional/lateral + empuje inclinado. Todos son full body; no hagas días por grupo muscular.
EVIDENCIA A RESPETAR: la potencia (saltos, lanzamientos) y la fuerza de pierna son lo que más se asocia a la velocidad
de palo; combinar trabajo general con trabajo específico de golf rinde más que el general solo; la flexibilidad por sí
sola no aumenta la velocidad, así que la movilidad solo debe dar el rango del swing sin dolor.
PROGRESIÓN: describe semana a semana los contactos de salto (empezar con 9-12, máximo unos 20), las cargas (doble
progresión) y el paso de hombro sobre 90°.
CAMPO why: una frase concreta de cómo ese ejercicio ayuda al golf o al objetivo (ej.: "Fuerza de la pierna adelantada
para frenar la rotación y transferir velocidad").
DATOS REALES: ... (incluye CHS, pruebas y dolor). Si la CHS o las pruebas se estancan, sube el énfasis en potencia;
si hay dolor >2/10 en una zona, baja el nivel del ejercicio implicado y explícalo en coach_note.
FORMATO JSON EXACTO: {"name":"...","coach_note":"...","progression":"...","weeks":8,
 "days":[{"title":"Sesión A: ...","focus":"...","exercises":[
  {"name":"Salto al cajón","sets":3,"reps":"3","rest_s":60,"hold_s":0,"pillar":"golf","block":"potencia",
   "rpe":0,"tempo":"explosivo","load":false,"motion":"box_jump","note":"Aterriza suave y aguanta 2 s.",
   "why":"Potencia de pierna, el mejor predictor físico de la velocidad de palo."}]}],
 "quick":[...]}
```
- Ampliar `motion` (`Api.kt:78`) con: `box_jump, cmj, lateral_bound, snap_down, mb_rot_throw, mb_chest_pass, split_squat, step_up, front_squat, hip_thrust, lat_pulldown, landmine_press, cable_chop, suitcase_carry, farmer_carry, lateral_raise, hip_ir_9090`.
- Añadir el mismo `why` y `block` a la línea de alternativas (`Api.kt:122`).
- Quitar "Reparte los tres pilares en los tres días... foco distinto" (`Api.kt:74`).
- Cambiar "5 semanas" (`Api.kt:67,180`) y `"weeks":5` (`Api.kt:86`) a 8.

---

## 4. Batería de pruebas cada 4 semanas (semanas 0, 4 y 8)

**Condiciones fijas:** misma hora, mismo gimnasio y mismo calzado. Se hace después de la movilidad y antes de cualquier carga, sin haber entrenado pierna en las 48 h previas. Orden: movilidad, saltos, lanzamientos y CHS (este último en el campo de prácticas o el simulador, el mismo día u otro, siempre en las mismas condiciones).

| # | Prueba | Protocolo | Registro |
|---|---|---|---|
| 1 | **CHS con driver** (radar o launch monitor de consumo) | Calentamiento con 10 bolas progresivas, luego 5 swings a máxima velocidad con 30-60 s entre ellos. Se registra la **mejor** y la **media de las 3 mejores**. Siempre el mismo dispositivo y la misma posición. Mevo+ mostró buena concordancia con TrackMan para la CHS (Brennan 2023, golfistas jóvenes). Otros radares: no verificado. | mph (ya existe `speeds.json`) |
| 2 | **CMJ con app** (My Jump o similar) | Manos en la cadera, profundidad libre, 3 saltos con 45 s de descanso. Grabar a 240 fps de lado, a 1-1,5 m. Se registra la mejor altura en cm y el peso corporal. Potencia estimada (ecuación de Sayers): 60,7·altura(cm) + 45,3·masa(kg) − 2055 *(fórmula: no verificada en esta búsqueda)*. La app My Jump está validada (Balsalobre-Fernández 2015; Gallardo-Fuentes 2016). | cm, kg, W |
| 3 | **Lanzamiento de pecho sentado** con balón de 3 o 4 kg (siempre el mismo) | Sentado en el suelo, espalda contra la pared, piernas extendidas. Pase de pecho a dos manos sin despegar la espalda. 3 intentos con 60 s de descanso. Se mide la distancia desde la pared hasta el primer bote y se registra la mejor (protocolo de NSCA y Topend Sports). | m |
| 4 | **Lanzamiento rotacional** con balón de 3 o 4 kg | De pie de lado a la línea, en postura de golf. Lanzamiento en rotación tipo scoop a máxima intención. 3 intentos por lado. Se mide la distancia al primer bote y se registra la mejor de cada lado (una prueba de este tipo aparece en Read 2013 y Lewis 2016; el protocolo exacto es mío: no verificado). | m izq./der. |
| 5 | **Rotación torácica sentada** | Sentado en un banco con un balón o rodillo entre las rodillas (pelvis fija) y un palo sobre los hombros por delante. Rotar al máximo con la app de inclinómetro del móvil apoyada en el palo. 2 intentos por lado. Se registra el mejor ángulo (fiabilidad buena con barra y con smartphone: estudio de 2012 en bisp-surf; Sensors 2023). | ° izq./der. |
| 6 | **Rotación de cadera sentada (interna y externa)** | Sentado al borde de la camilla o del banco, rodilla y cadera a 90°, muslo fijo. Girar el pie hacia afuera (rotación interna) y hacia adentro (rotación externa) sin que la pelvis se mueva. Móvil sobre la tibia. Se registra el ángulo de cada lado (protocolo clínico habitual: fiabilidad no verificada aquí). La asimetría de la cadera adelantada sirve como alarma lumbar. | ° RI y RE por lado |
| 7 | **Equilibrio a una pierna** | Descalzo, manos en la cadera, ojos cerrados. Se cronometra hasta tocar el suelo, mover el pie de apoyo o abrir los ojos, con un máximo de 30 s. 2 intentos por pierna. Se registra el mejor *(protocolo tipo TPI: no verificado)*. | s izq./der. |
| 8 | **Dolor** | 0-10 en lumbar, hombros y rodilla izquierda, el día de la prueba y al día siguiente. | 0-10 por zona |
| 9 | (Indirecto) Fuerza | No se prueba aparte: la app estima el 1RM de la sentadilla frontal o goblet y del hip thrust a partir del registro de cargas. | kg |

**Registro en la app:** sustituir `speeds.json` por `tests.json` con este modelo:
```kotlin
data class TestResult(val ts: Long, val bodyKg: Float, val chsBest: Float, val chsTop3: Float,
    val cmjCm: Float, val mbChestM: Float, val mbRotL: Float, val mbRotR: Float,
    val tRotL: Int, val tRotR: Int, val hipIrL: Int, val hipIrR: Int, val hipErL: Int, val hipErR: Int,
    val slbL: Int, val slbR: Int, val painLow: Int, val painShoulder: Int, val painKneeL: Int, val note: String)
```
- Pantalla: un formulario de "Batería semana X" con valores opcionales y un gráfico por métrica en `Progress.kt`.
- La CHS sigue disponible como dato rápido diario.
- Recordatorio automático en las semanas 4 y 8 (y en la 0 al crear el bloque).
- `contextSummary` envía a la IA la última batería y la diferencia con la anterior.

---

## 5. Fuentes

**Verificadas** (registro bibliográfico o resumen encontrado en la búsqueda; no se leyó el texto completo):
1. Ehlert A. (2020). The effects of strength and conditioning interventions on golf performance: a systematic review. *J Sports Sci* 38(23):2720-2731. doi:10.1080/02640414.2020.1796470. https://lida.sport-iat.de/ta/Record/4068865
2. Uthoff A., Sommerfield L.M., Pichardo A.W. (2021). Effects of resistance training methods on golf clubhead speed and hitting distance: a systematic review. *J Strength Cond Res* 35(9):2651-2660. https://pubmed.ncbi.nlm.nih.gov/34224506/
3. Brennan A., Murray A., Mountjoy M., Hellstrom J., Coughlan D., Wells J., Brearley S., Ehlert A., Jarvis P., Turner A., Bishop C. (2024). Associations between physical characteristics and golf clubhead speed: a systematic review with meta-analysis. *Sports Med* 54:1553-1577. doi:10.1007/s40279-024-02004-5. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11239735/
4. Lewis A.L., Ward N., Bishop C., Maloney S., Turner A.N. (2016). Determinants of club head speed in PGA professional golfers. *J Strength Cond Res* 30(8):2266-2270. https://repository.mdx.ac.uk/item/8635q
5. Read P.J., Lloyd R.S., De Ste Croix M., Oliver J.L. (2013). Relationships between field-based measures of strength and power and golf club head speed. *J Strength Cond Res* 27(10):2708-2713. https://eprints.glos.ac.uk/3590/ (solo diseño y pruebas; resultados no verificados)
6. Wells J. et al. (2022). Relationships between highly skilled golfers' clubhead velocity and kinetic variables during a countermovement jump. *Sports Biomech* 23(12):2598-2610. doi:10.1080/14763141.2022.2041709. https://lida.sport-iat.de/ta/Record/4084432
7. Fletcher I.M., Hartwell M. (2004). Effect of an 8-week combined weights and plyometrics training program on golf drive performance. *J Strength Cond Res* 18(1):59-62. https://pubmed.ncbi.nlm.nih.gov/14971982/
8. Oranchuk D.J., Mannerberg J.M., Robinson T.L., Nelson M.C. (2020). Eight weeks of strength and power training improves club head speed in collegiate golfers. *J Strength Cond Res* 34(8):2205-2213. https://pubmed.ncbi.nlm.nih.gov/29461422/
9. Lephart S.M. et al. (2007). An eight-week golf-specific exercise program improves physical characteristics, swing mechanics, and golf performance in recreational golfers. *J Strength Cond Res* 21(3):860-869. doi:10.1519/R-20606.1. https://sites.pitt.edu/~neurolab/publications/2007/LephartSM_2007_JStrengthCondRes_8wkGolfSpecificExerciseProgram.pdf
10. Golf-related low back pain: a review of causative factors and prevention strategies. *Asian J Sports Med*. https://brieflands.com/articles/asjsm-21618 (autores y año no confirmados)
11. Smith J.A. et al. (2018). Risk factors associated with low back pain in golfers: a systematic review and meta-analysis. *Sports Health*. https://digitalscholarship.unlv.edu/pt_fac_articles/55 (lista de autores no confirmada)
12. Balsalobre-Fernández C., Glaister M., Lockey R.A. (2015). The validity and reliability of an iPhone app for measuring vertical jump performance. *J Sports Sci* 33:1574-1579. doi:10.1080/02640414.2014.996184
13. Gallardo-Fuentes F. et al. (2016). *J Strength Cond Res*: fiabilidad de My Jump en SJ, CMJ y DJ (citado en un resultado de búsqueda; título no verificado).
14. Brennan A. et al. (2023). Validez y fiabilidad de FlightScope Mevo+ frente a TrackMan 4 en golfistas jóvenes. *J Strength Cond Res* (título exacto no verificado).
15. Reliability and validity of a smartphone device and clinical tools for thoracic spine mobility assessments (2023). *Sensors* 23(17):7622. https://www.mdpi.com/1424-8220/23/17/7622
16. Reliability of thoracic spine rotation range-of-motion measurements in healthy adults (2012). https://www.bisp-surf.de/Record/PU201203002193 (autores no confirmados)
17. Murray A.D. et al. (2018). 2018 International consensus statement on golf and health. *Br J Sports Med* 52(22):1426-1436. doi:10.1136/bjsports-2018-099509
18. Bliss A. (ed.) (2022). *Strength and Conditioning for Golf: A Guide for Coaches and Players*. Routledge. ISBN 9780367567842 (libro; contenido no consultado)
19. Protocolo del lanzamiento de pecho sentado: NSCA TSAC Report y https://topendsports.com/testing/tests/medicine-ball-throw-seated.htm

**No verificado** (afirmaciones o datos que no pude confirmar):
- Los protocolos y valores normativos oficiales de TPI: rotación torácica sentada ("45-70°"), rotación pélvica, equilibrio a una pierna y Power Screen (sit-up and throw). Solo encontré fuentes secundarias.
- La ecuación de Sayers para la potencia a partir del CMJ.
- La eficacia del overspeed training (palos ligeros tipo speed sticks) sobre la CHS.
- La regla de dolor 0-2/10 y los umbrales de contactos de salto (9-12 subiendo hasta unos 20). Son criterio profesional.
- Que el swing de kettlebell cargue la zona lumbar como un RDL. Es una exclusión por prudencia.
- Los descansos, RIR y porcentajes de subida de carga concretos. Son práctica estándar, sin una fuente citada aquí.
- Los resultados de swing y distancia de Lephart 2007 (solo vi la fuerza rotacional, la abducción de cadera y la flexibilidad).
- Las correlaciones concretas de Read 2013.
- La validez de radares como PRGR, Swing Speed Radar o Rapsodo para la CHS.
- La fiabilidad de la medición de rotación de cadera sentada con móvil.
- El beneficio específico de incluir isométricos en todas las sesiones para el golf. Se mantienen porque son requisito del usuario.
- El libro *Golf Anatomy* (Davies y DiSaia): no localizado.
