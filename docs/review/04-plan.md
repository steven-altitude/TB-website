# 04 · Plan final (síntesis del líder técnico)

Fuentes: `01-golf.md` (A, S&C de golf), `02-app.md` (B, producto y UX) y `03-funcional.md` (C, entrenamiento funcional e hipertrofia).
Estado: **pendiente de aprobación. No se ha tocado código.**

---

## 1. Decisiones del programa

### 1.1 Base
- **Full body A/B/C, bloque de 8 semanas**, con pruebas en las semanas 0, 4 y 8 y descarga en las semanas 4 y 8. A y C están de acuerdo en esto.
- La **potencia va en las 3 sesiones, antes de la fuerza**, con intención máxima y sin RPE. La serie se corta en cuanto baja la velocidad o la calidad del aterrizaje.
- **Prohibido:** peso muerto, RDL, buenos días, swing de kettlebell, hiperextensión a 45°, curl nórdico y drop jumps.
- **Fuera de la sesión:** la bici y el remo. Si se usan, solo en días libres y a intensidad suave (zona 2).
- **Orden de objetivos en el prompt y en `GOALS`:** golf → movilidad → estética.

### 1.2 Desacuerdos entre A y C, y cómo los resuelvo

| Tema | A | C | Decisión |
|---|---|---|---|
| Duración | Dice que cabe en 52 + 3 min | Cuenta 60-61 min reales | **C.** Superseries con →45 s, tri-series con la movilidad como descanso activo y la sentadilla principal a 3 series (4 solo en las semanas 5-7). Objetivo: 51-54 min. |
| Cuádriceps | ~16 series por semana (prensa + cossack) | ~12 series | **C.** La prensa pasa a sentadilla goblet con pausa (cumple mejor lo de "sentadilla completa") y la cossack pasa a la movilidad. Es lo más prudente para la rodilla. |
| Isquios y gemelos | Nada | Curl femoral sentado 2 veces por semana y gemelos 2 veces por semana | **C.** Es la única forma de cubrir los isquios sin bisagra. *Pendiente: confirmar que el gimnasio tiene curl femoral; si no, curl en polea a una pierna.* |
| Hombro lateral, brazos y glúteo medio | 2 series por semana | 6 / 3+3 / 6+ | **C.** Son accesorios baratos y sin coste para la potencia. |
| Skater a una pierna | Desde la semana 1 en C (contradice su propia tabla) | Desde la semana 5, con criterios | **C.** |
| Contactos de salto | Recuento incoherente | Tabla por sesión y semana, ~45-60 por semana | **C** (sección 7 de `03`). Las cifras son criterio profesional (no verificado). |
| Por encima de 90° | Empieza con carga (landmine) | Añade una fase sin carga antes, y después bottoms-up y waiter carry | **C**, pero con la cadena landmine → jalón → press a un brazo de A como columna vertebral. |
| Movilidad | 7 min, "no mueve la CHS" | 6 min + descanso activo (prioridad 2 del usuario) | **C.** No suma minutos y respeta la prioridad del usuario. |
| Rotación externa | Accesorio en C | Al calentamiento de B | **C.** |
| Swings de velocidad (overspeed) | Opcional en las semanas 5-8 | Igual, marcado como no verificado | Se queda **opcional**, sin progresión, y en la app aparece como "no verificado". |
| Archivo de pruebas | `tests.json` sustituye a `speeds.json` | — | **Se mantiene `speeds.json`** para la CHS rápida diaria y se **añade** `tests.json` para la batería. Así no se rompen los datos que ya existen. |
| Nombres de bloque | `potencia`, `fuerza`… | B: `mov, pot, fue, acc, core, iso` | **Ids cortos de B** en el modelo, con nombres largos solo en la UI. |

### 1.3 Plan final

El plan es el **§11 de `03-funcional.md`**, con las progresiones de su §7 (saltos) y §8 (hombro). Resumen:

| | A: rodilla + empuje horizontal | B: cadera + tirón vertical + acarreo | C: rotacional/lateral + empuje inclinado |
|---|---|---|---|
| Movilidad 6′ | 90/90 RI cadera, torácica en cuadrupedia, flexor de cadera + alcance, snap-down | Sentadilla profunda + rotación, tobillo, wall slide + rotación externa | Gato-camello, rotación con palo, cossack libre, pogo / Y |
| Potencia 9′ | Salto al cajón 3×3 + lanzamiento rotacional 3×4/lado | Cajón → CMJ → giro 90° 3×3 + pase de pecho 3×5 | Lateral a 2 pies → skater (sem. 5+) 3×3/lado + shot-put 3×4/lado |
| Fuerza 23′ | Frontal o goblet 3×5-6 / remo a un brazo · Búlgara / banca con mancuernas / 90/90 activo | Hip thrust 4×6-8 / jalón neutro · Step-up / press landmine → mancuerna / libro activo | Goblet con pausa 3×8 / remo en polea con rotación · Inclinado / curl femoral / 90/90 activo |
| Accesorios 6′ | Elevación lateral + curl inclinado + gemelo | Curl femoral + face pull + abducción | Elevación lateral + tríceps + gemelo |
| Core o acarreo | Pallof 2×8/lado | Suitcase carry 3×30 m/lado | Chop 2×8/lado (sem. 7-8: waiter carry) |
| Isométrico | Plancha lateral con abducción 2×20-30 s/lado | Plancha RKC 3×15-20 s (sem. 5+: + bottoms-up) | Split squat isométrico, izquierda adelante, 2×20-45 s |

- **Sin balón medicinal:** lanzamiento rotacional → puñetazo rotacional en landmine; pase de pecho → flexión explosiva.
- **Recomendación de compra:** balón blando de 3-4 kg. Sin él no se puede hacer la prueba del lanzamiento de pecho.
- **Si falta tiempo, se recorta en este orden:** 1 ronda de accesorios → última serie de C1/C2. Nunca potencia, calentamiento ni isométrico.
- **Reglas de dolor:** ≤2/10 se progresa; 3-4/10 se baja un nivel una semana; ≥5/10, hinchazón o inestabilidad paran los saltos y conviene consultar a un profesional. Es criterio clínico habitual (no verificado).
- **Batería de pruebas (semanas 0, 4 y 8):** las del §4 de `01-golf.md`: CHS (mejor y media de las 3 mejores), CMJ con My Jump, lanzamiento de pecho sentado, lanzamiento rotacional por lado, rotación torácica por lado, rotación interna y externa de cadera por lado, equilibrio a una pierna con ojos cerrados y dolor por zona.

### 1.4 Pendiente de confirmar contigo
1. ¿Eres **diestro**? Si lo eres, la rodilla izquierda es la adelantada: empieza las series unilaterales y es la que se adelanta en el split isométrico.
2. ¿Tu gimnasio tiene **curl femoral sentado**?
3. ¿Vas a comprar el **balón medicinal**? Si no, la semilla usa las alternativas por defecto.

---

## 2. Cambios a la app, priorizados

### P0: integridad de datos (antes de nada; con el nuevo esquema el riesgo sube)
1. **Escritura atómica y sin sobrescritura tras un fallo de lectura** (B-C1): `AtomicFile`, `.bak` y copia `corrupt-<ts>`. `Data.kt`.
2. **Exportar e importar JSON** desde Perfil y backup del sistema que excluya `gc_secure.xml` (B-C2). `AndroidManifest.xml`, `res/xml/*`, `Gen.kt` (Perfil).
3. **`validatePlan`** al generar y al cargar el plan; Home con estado vacío (B-C5).
4. **Sesión en curso persistida** en `session_inprogress.json`, con aviso para reanudarla; orientación vertical; `BackHandler` en el resumen (B-C3, B-C4).
5. **Esquema versionado y migración v2→v3** (B-M16): asigna ids A/B/C, `exId` y deduce el `block`.

### P1: el nuevo programa
6. **Modelo:** `Ex` gana `id`, `block`, `why`, `perSide`, `metric` y `kgStep`; `Day` gana `id`; `Plan` gana `id` y `schema`; `LogEntry` gana `dayId` y `planId`; `SetLog` gana `holdActual` y `side`.
7. **`Seed.kt`:** semilla A/B/C completa (§1.3) con `why` y descripciones de todos los ejercicios nuevos. La semilla se guarda en el primer arranque (B-I12).
8. **`Api.kt`:** prompt A/B/C con 6 bloques en orden fijo, 8 semanas, `why` (≤15 palabras), `block`, `per_side` y `metric`, y las restricciones nuevas. Se quita el "foco distinto por día". Se amplían los ids de `motion`. Se comprueba `stop_reason` y las alternativas se parsean con `firstInt` (B-I10, B-I11).
9. **`Data.kt` (textos):** `DEFAULT_RESTRICTIONS`, `GOALS` y `EQUIPMENT` actualizados (banco y balón opcional).
10. **`Logic.kt`:**
    - `nextDay()` por el último `dayId` (B-I13).
    - `suggestKg` sin progresión de carga en potencia ni isométricos y usando `kgStep`.
    - `estMinutes` por bloque y teniendo en cuenta `perSide`.
    - `contextSummary` con la CHS, las pruebas, los isométricos y el cumplimiento por bloque.
11. **UI de bloques y "why":**
    - PlanTab: agrupa por bloque y muestra "Para qué".
    - Workout: barra segmentada, etiqueta "BLOQUE x/6" y `why` visible.
    - Home: "Sesión B" y la tira A ✓ · B · C.
    - Colores de bloque en Theme.
12. **Batería de pruebas:** `tests.json`, formulario "Batería semana X" en Progreso, gráfica por métrica, aviso en las semanas 0, 4 y 8, y envío de los resultados a la IA.
13. **Animaciones nuevas en `motions.json` y `Motion.kt`:** salto al cajón, CMJ, salto lateral, lanzamientos, acarreo, landmine, chop, step-up, búlgara, jalón y hip thrust. Si falta una, se usa `generic` con un pictograma de respaldo (B-M10).

### P2: sesión en vivo (incluidas si el tiempo da; si no, en una segunda entrega)
14. Reps prellenadas con lo de la última vez, no con el tope del rango (B-I1).
15. Steppers de 56 dp, números grandes, entrada numérica y `kgStep` (B-I2, B-I6, B-I7).
16. Descanso: el botón principal pasa a "Saltar descanso", con ±15 s y avisos de sonido y vibración larga (B-I3, B-I4).
17. Isométricos: cuenta previa de 5 s, por lado y con registro del tiempo real (B-I5).
18. "Cambiar ejercicio": elegir entre solo hoy y el resto del bloque (B-I16). Rutina guiada: no contar como hechos los pasos saltados (B-I15).
19. Coma decimal en la CHS (B-I14).

### P3: pulido
Tokens de color y tipografía (B-M1, B-M2), `contentDescription` y contraste (B-I8, B-I9), clave cifrada sin caer a texto plano (B-I17), y las demás mejoras M de B.

**Fuera de alcance, pero urgente:** el **keystore de firma con contraseña "android"** viene en el tar (B-I18). **No lo voy a subir a ningún repo.** Hay que sacarlo del código fuente y leer las contraseñas de `local.properties`.

---

## 3. Archivos a tocar

| Archivo | Cambios |
|---|---|
| `Data.kt` | Modelo nuevo, esquema y migración, AtomicFile y .bak, validatePlan, tests.json, session_inprogress, restricciones, objetivos y equipo |
| `Seed.kt` | Semilla A/B/C con `why` y descripciones nuevas |
| `Api.kt` | Prompt A/B/C, `why` y `block`, `stop_reason`, `firstInt` en alternativas, ids de motion |
| `Logic.kt` | nextDay, suggestKg, estMinutes, contextSummary |
| `Home.kt` | Siguiente sesión por `dayId`, estado vacío, tira A/B/C |
| `PlanTab.kt` | Agrupado por bloque, "Para qué", chips A/B/C |
| `Workout.kt` | Bloques, why, persistencia en curso, isométricos y metric, (P2: steppers, descanso) |
| `Summary.kt` | BackHandler, cumplimiento por bloque |
| `Guided.kt` | perSide, why, pasos saltados |
| `Progress.kt` | Batería de pruebas, coma decimal |
| `Gen.kt` | Exportar e importar en Perfil, revisar el plan antes de aceptarlo |
| `MainActivity.kt` | Reanudar sesión, rememberSaveable |
| `Theme.kt` | Colores de bloque y tokens (P3: tipografía) |
| `Motion.kt`, `assets/motions.json` | Animaciones nuevas y respaldo |
| `AndroidManifest.xml`, `res/xml/backup_rules.xml`, `res/xml/data_extraction_rules.xml` | Backup y orientación |

**Antes de la Fase 3:** este repositorio es `TB-website`, no la app. Hay que decidir dónde va el código (ver el resumen en el chat).
