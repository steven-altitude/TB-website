# Revisión de producto y UX: EntrenadorGym (Swing Lab)

Alcance: todos los `*.kt` de `app/src/main/java/com/stevenm/gymcoach/`, `assets/motions.json`, `res/values/*.xml`, `AndroidManifest.xml` y `app/build.gradle.kts`. Solo lectura, sin compilar ni ejecutar. Las rutas son relativas a `app/src/main/` (salvo `app/build.gradle.kts`). Cada referencia de línea se comprobó contra el código.

Usuario de referencia: golfista de 40+ que entrena 3 días por semana, con sesiones de ~55 min y el móvil en una mano, sudado y a ~1 m de distancia.

---

## CRÍTICO

### C1. Si el log se lee mal una vez, se pierde todo el historial
- **Archivo:** `java/.../Data.kt:127-137` y `:139-149` (también `:111`, `:100-108`, `:114-125`)
- **Problema:** `loadLog()` atrapa cualquier excepción y devuelve `emptyList()`. `addLog()` hace `loadLog() + e` y reescribe `log2.json`. Si el archivo queda truncado o corrupto (el proceso muere a mitad de `writeText`, se llena el disco o un campo no parsea), la siguiente sesión guardada sobrescribe todo el historial con una sola entrada, sin aviso. `writeText` no es atómico. Con plan, descripciones y velocidades pasa lo mismo: `loadPlan()` vuelve en silencio a `seedPlan()` y el siguiente `savePlan` pisa el plan bueno.
- **Arreglo:**
  1. Escribir con `android.util.AtomicFile` (`startWrite` / `finishWrite` / `failWrite`) en los cuatro archivos.
  2. Separar "el archivo no existe" (devolver vacío) de "existe pero no parsea": en el segundo caso, copiar el archivo a `log2.corrupt-<ts>.json`, lanzar el error y **no** escribir encima.
  3. Mantener un `log2.bak` con la versión anterior a cada escritura.

### C2. No hay respaldo ni exportación (`allowBackup="false"`)
- **Archivo:** `AndroidManifest.xml:7`; datos en `filesDir` (`Data.kt:98`)
- **Problema:** con `allowBackup="false"`, el historial, las cargas, las velocidades de palo y el plan desaparecen al cambiar de teléfono, borrar los datos o reinstalar. No existe exportación manual.
- **Arreglo:**
  1. Poner `android:allowBackup="true"` y añadir `android:dataExtractionRules="@xml/data_extraction_rules"` (API 31+) y `android:fullBackupContent="@xml/backup_rules"` (API ≤30). Incluir `file/plan2.json`, `file/log2.json`, `file/descs.json` y `file/speeds.json`. **Excluir** `sharedpref/gc_secure.xml`: su clave vive en el Keystore, que no se restaura.
  2. En Perfil, añadir los botones "Exportar datos" (`ActivityResultContracts.CreateDocument("application/json")` con un JSON `{schema, plan, log, speeds, descs}`) e "Importar" (`OpenDocument`), con validación y vista previa antes de sobrescribir.

### C3. La sesión en curso vive solo en memoria: se pierde al rotar, en segundo plano o al morir el proceso
- **Archivo:** `MainActivity.kt:64-70` (todo con `remember`, sin `rememberSaveable`), `Workout.kt:41-55` (`cache` es un `HashMap` en `remember`) y `Workout.kt:135-139` (`openVideo` abre YouTube y saca al usuario de la app)
- **Problema:** el manifiesto no fija la orientación ni declara `configChanges`. Rotar el móvil, por ejemplo al apoyarlo en el banco, recrea la Activity: se vuelve a `Screen.Tabs` y se pierden todas las series registradas. Lo mismo pasa si Android mata el proceso mientras el usuario está en YouTube ("Ver video"), en WhatsApp o en la música entre series. En 55 minutos eso es muy probable. El `Draft` de `Screen.Summary` (`MainActivity.kt:26`) tampoco sobrevive.
- **Arreglo:**
  1. `android:screenOrientation="portrait"` en la `<activity>` (`AndroidManifest.xml:11`).
  2. Guardar un `session_inprogress.json` (dayId, índice actual, series hechas con reps/kg/hold, `startTs`, `timerEnd`) cada vez que se marca una serie (`Workout.kt:105` y `:71`) y al cambiar de ejercicio. Al abrir la app, si existe, mostrar "Tienes una sesión sin terminar: Continuar / Guardar / Descartar".
  3. Usar `rememberSaveable` para `screen` y `tab`, o mover el estado a un `ViewModel` con `SavedStateHandle`.
  4. Abrir el vídeo en un Custom Tab o en un diálogo, no en otra app.

### C4. "Atrás" en el resumen cierra la app y descarta la sesión
- **Archivo:** `Summary.kt:28-90` (no hay `BackHandler`) y `MainActivity.kt:89-94`
- **Problema:** en `SummaryScreen` el botón atrás del sistema hace `finish()` de la Activity, y el `Draft` (solo en memoria) se pierde sin guardar. Es un gesto muy fácil de hacer sin querer tras una sesión de 55 minutos.
- **Arreglo:** añadir `BackHandler { onSave(pain, zone) }` (guardar con dolor = -1) o mostrar un diálogo "¿Guardar sesión?". Lo ideal es que la sesión ya esté persistida por C3 antes de llegar al resumen.

### C5. Un plan generado por la IA sin días, sin ejercicios o con `sets = 0` deja la app en bucle de cierres
- **Archivo:** `Data.kt:57-61` y `:68-74` (sin validación), `Home.kt:47-48`, `Workout.kt:78` y `:87`, `Guided.kt:65`
- **Problema:**
  - Si el JSON trae `"days": []`, `planFromJson` lo acepta, `Gen.kt:153` lo guarda y `HomeTab` calcula `gym.size % plan.days.size`, lo que lanza `ArithmeticException` (división por cero). Como el plan ya está guardado, la app se cierra en cada arranque, porque Home es la pestaña inicial.
  - Un día con `exercises` vacío da `day.exercises[-1]` en `Workout.kt:78`.
  - `"sets": 0` da `sts[-1]` en `Workout.kt:87`.
  - Una rutina rápida vacía da `steps[0]` en `Guided.kt:65`.
- **Arreglo:** añadir `validatePlan(p)` en `Data.kt`, que exija 1 o más días, 1 o más ejercicios por día, `sets` acotado a 1..8, `restS` a 0..300 y `holdS` a 0..600, y nombres no vacíos. Llamarla en `Api.generatePlan` antes de devolver el plan y en `Store.loadPlan`. Si falla, no guardar y mostrar el error. Como defensa adicional, en `Home.kt:47` usar `if (plan.days.isEmpty()) estado vacío else ...`.

---

## IMPORTANTE

### I1. Las reps se prellenan con el tope del rango, lo que infla la progresión automática
- **Archivo:** `Workout.kt:80-84` (`mutableIntStateOf(hi)`) y `Logic.kt:34-41`
- **Problema:** cada serie empieza con el tope del rango (por ejemplo 10 en "8-10"). Si el usuario pulsa "Serie completada" sin ajustar, que es lo normal con prisa y sudor, se registra el tope. `suggestKg` ve `hitTop = true` y sube 2,5 kg en cada sesión aunque no se hayan hecho esas reps.
- **Arreglo:** prellenar con las reps reales de la última sesión (`lastSession`) o con el mínimo del rango. Mostrar "Última vez: 20 kg × 10·10·9" sobre el stepper. Para la subida automática, exigir que la última sesión esté marcada como "confirmada", o pedir el RPE de la última serie (botones 7/8/9) para decidirla.

### I2. Registrar series es lento e impreciso con una mano
- **Archivo:** `Theme.kt:147-154` (`Stepper`) y `Workout.kt:195-210`
- **Problema:**
  - Los botones −/+ miden **30 dp**, por debajo de los 48 dp recomendados.
  - El valor se muestra a 15 sp en una caja fija de 56 dp ("102.5 kg" se corta con fuente grande).
  - El paso es siempre ±2,5 kg: con mancuernas de 1-2 kg no sirve, y empezar desde 0 kg obliga a muchos toques.
  - No hay pulsación larga ni entrada numérica.
- **Arreglo:** steppers de 56 dp con el valor en `Numeral` de 36-44 sp. Pulsación larga para repetir. Tocar el número abre un teclado numérico (`KeyboardType.Decimal`, aceptando `,` y `.`). Paso por ejercicio (`kgStep`: 1, 2 o 2,5). Botón "Igual que la anterior".

### I3. Durante el descanso el botón principal no hace nada y lo útil es diminuto
- **Archivo:** `Workout.kt:102` (`if (timerEnd > 0) return`), `:183-184` (textos "+15 s"/"Saltar" a 12 sp, sin padding, ~16 dp de alto) y `:236-237`
- **Problema:** con el descanso corriendo, el botón grande sigue diciendo "Serie completada" pero se ignora sin avisar. Para saltar el descanso hay que acertar a un texto de 12 sp.
- **Arreglo:** mientras corre el descanso, el botón principal debe decir "Saltar descanso · 0:45" y llevar a la siguiente serie. "+15 s" y "−15 s" deben ser botones de 48 dp o más bajo el anillo.

### I4. Los temporizadores solo vibran 350 ms: con el móvil en el banco o la mochila no se notan
- **Archivo:** `Logic.kt:92-98`, `Workout.kt:63-74` y `Guided.kt:45-63`
- **Problema:** no hay sonido, cuenta atrás 3-2-1 ni notificación. Con el ruido del gimnasio el aviso se pierde. Además, el bucle vive en la composición: con la pantalla bloqueada o en otra app no hay garantía de aviso.
- **Arreglo:** usar `ToneGenerator` (beeps a 3-2-1-0) y un patrón de vibración largo (`createWaveform`). Notificación con el descanso restante y acción "Saltar". Para descansos fiables en segundo plano, un `ForegroundService` corto o un `AlarmManager.setExactAndAllowWhileIdle` con `timerEnd`.

### I5. Isométricos: sin tiempo para colocarse, sin lados y sin registrar el tiempo real
- **Archivo:** `Workout.kt:104`, `:71`, `:184` y `:94`
- **Problema:**
  - "Aguantar 30 s" arranca al instante, pero el usuario tiene que dejar el móvil y tumbarse (plancha) o apoyarse en la pared.
  - "Plancha lateral 3×30 s" no distingue lados.
  - "Cancelar" descarta la serie entera aunque se aguantaran 25 s.
  - Se registra `e.holdS` (lo planificado), no lo hecho.
- **Arreglo:** cuenta previa de 5 s ("Colócate"). Campo `perSide` con un segundo hold automático ("Lado derecho → izquierdo"). Botón "Terminar aquí" que registra los segundos reales en `SetLog.hold`. Tras la última serie no arrancar el descanso (`Workout.kt:71` no comprueba `isLast`, a diferencia de `:106`).

### I6. Los números de la sesión en vivo no se leen a un metro
- **Archivo:** `Workout.kt:176` (temporizador a 30 sp en un anillo de 120 dp), `:190-201` (Serie, Reps y Carga a 13-15 sp) y `:151` (cabecera a 13 sp)
- **Problema:** lo que hay que leer con el móvil apoyado (tiempo de descanso, kg, reps, número de serie) es el texto más pequeño de la pantalla. La animación ocupa 230 dp arriba (`:161`) y empuja los controles hacia abajo, con scroll.
- **Arreglo:** dar la jerarquía al dato:
  - temporizador a 64-72 sp mientras corre (puede tapar la animación);
  - kg × reps a 40 sp en `Display`;
  - "Serie 2 de 3" a 20 sp.
  - Reducir la animación a 140 dp o hacerla plegable. El layout no debe depender del scroll.

### I7. Tamaños táctiles por debajo de 48 dp
- **Archivo:**
  - `Theme.kt:150,152` (30 dp)
  - `Workout.kt:164-165` ("Ver video"/"Cambiar", ~30 dp)
  - `Workout.kt:183-184` (~16 dp)
  - `Workout.kt:214` (marcas de serie, 24 dp de alto; además, tocar una serie hecha la **desmarca** sin confirmar)
  - `Progress.kt:59` (36 dp)
  - `Progress.kt:89` ("Registrar velocidad", texto sin padding)
  - `Progress.kt:114` ("Ajustar plan")
  - `Gen.kt:139` ("Solo generar técnicas faltantes")
  - `Theme.kt:187` / `RoundIcon` de 44 dp (cerrar sesión, `Workout.kt:149`; atrás, `Gen.kt:81`)
  - `Theme.kt:204-211` y `Summary.kt:20-26` (`Chip`/`Choice` de 44 dp)
- **Arreglo:** mínimo de 48 dp con `Modifier.minimumInteractiveComponentSize()` o `sizeIn(minHeight = 48.dp)`. Envolver los textos clicables en una caja con `padding(12.dp)`. Para desmarcar una serie, usar pulsación larga y un snackbar "Deshacer".

### I8. Accesibilidad: ningún icono tiene `contentDescription` y la fuente grande rompe layouts
- **Archivo:**
  - `Theme.kt:174-191` (`Icon24` es un `Canvas` sin semántica; `RoundIcon` no acepta descripción); no hay ni un `contentDescription`/`semantics` en el código
  - `MainActivity.kt:55` (botón central de Coach IA sin etiqueta)
  - `Theme.kt:150-152` (TalkBack lee "−" y "+")
  - Fuente grande: `Workout.kt:231-243` (fila de 56 dp + botón con `padding(horizontal = 32.dp)` + 56 dp, sin `weight`: "Siguiente ejercicio" desborda en 360 dp a escala 1,3), `Theme.kt:108`/`:115` (alto fijo de 56 dp), `Theme.kt:151` (56 dp de ancho) y `Workout.kt:174-176` (anillo fijo de 120 dp con 30 sp)
- **Arreglo:**
  - Añadir un parámetro `cd: String` a `RoundIcon`/`Icon24` y aplicar `Modifier.semantics { contentDescription = cd; role = Role.Button }`.
  - Stepper: "Disminuir carga" / "Aumentar carga", con `stateDescription` "20 kg".
  - Botón principal con `Modifier.weight(1f)` y `heightIn(min = 64.dp)` en vez de `height`.
  - Usar `heightIn` en `PrimaryButton`/`GhostButton`/`Chip`.
  - Probar con `fontScale = 1.3f` y `2f`.

### I9. Contraste de elementos no textuales por debajo de 3:1
- **Archivo:** `Workout.kt:157` y `:215` (`C.line` sobre `C.moss`: **1,57:1**), `Home.kt:37` (`0xFF4A5F51` sobre moss: **2,65:1**), `Theme.kt:207`, `Summary.kt:23` y `Gen.kt:112` (bordes `C.line` sobre pine: **1,4:1**)
- **Problema:** las series y ejercicios pendientes, los días futuros y los bordes de chips no seleccionados apenas se ven, sobre todo con luz de gimnasio. El texto sí cumple: `dim` sobre moss da 7,98:1 y sobre fairway 5,76:1.
- **Arreglo:** crear el token `C.track` ≈ `#4F6A5A` (≥3:1 sobre moss) para pistas y pendientes, y usar `C.dim` para bordes de controles interactivos.

### I10. Respuestas de la IA: parsing frágil en "Cambiar ejercicio"
- **Archivo:** `Api.kt:127` (`p[1].filter { it.isDigit() }.toInt()`)
- **Problema:** "3-4" series se convierte en **34 series**; un descanso de "60-90" se convierte en **6090 s**. También `p[4]` y `p[8]`.
- **Arreglo:** añadir `fun firstInt(s: String, def: Int) = Regex("\\d+").find(s)?.value?.toInt() ?: def` con `coerceIn` (sets 1..6, rest 0..300, hold 0..600, rpe 1..10).

### I11. Plan generado: JSON truncado y sin vista previa ni forma de deshacer
- **Archivo:** `Api.kt:36` y `:40-43`, y `Gen.kt:152-154`
- **Problema:**
  - Si `stop_reason == "max_tokens"`, el usuario ve "Respuesta sin JSON…" o un error de `JSONObject` críptico.
  - `extractJson` toma desde el primer `{` hasta el último `}`: si el modelo añade texto con llaves, falla.
  - El plan nuevo **sustituye** al anterior al instante (`store.savePlan(p)`), sin vista previa ni historial.
  - El usuario puede salir de la pantalla durante una llamada de hasta 300 s (`Api.kt:18`): `rememberCoroutineScope` se cancela y se pierde el resultado (y lo que ha costado).
- **Arreglo:**
  - Comprobar `stop_reason` y dar un mensaje claro.
  - Usar *structured outputs* / tool use con JSON schema, o como mínimo parsear un bloque delimitado.
  - Pantalla "Revisar bloque" con Aceptar / Descartar.
  - Guardar `plans/plan-<ts>.json` como historial.
  - Hacer la llamada en un `ViewModel` (`viewModelScope`) o con WorkManager.

### I12. La semana del bloque nunca avanza con el plan semilla
- **Archivo:** `Data.kt:111` y `Seed.kt:29`
- **Problema:** si no existe `plan2.json`, `loadPlan()` devuelve `seedPlan()` con `createdAt = System.currentTimeMillis()` en cada arranque y no lo guarda. `phaseOf` (`Logic.kt:13-22`) siempre da "Semana 1" y la descarga nunca llega.
- **Arreglo:** en `loadPlan`, si el archivo no existe, crear la semilla y llamar a `savePlan` inmediatamente.

### I13. "Rutina de hoy" se calcula contando todas las sesiones de la historia
- **Archivo:** `Home.kt:46-48`
- **Problema:** `gym.size % plan.days.size` mezcla sesiones de planes anteriores y sesiones parciales. Si se hace el Día 2 desde Rutinas, Home no se entera. Con un plan nuevo se puede empezar por B o C.
- **Arreglo:** guardar `dayId` y `planId` en `LogEntry`; la siguiente es la que sigue a la última `dayId` registrada del plan activo (o A si no hay ninguna). Ver la sección final.

### I14. Valores decimales con coma: "101,5" se registra como 1015 mph
- **Archivo:** `Progress.kt:165`
- **Problema:** el filtro solo acepta dígitos y `.`, y muchos teclados en español emiten `,`, que se elimina. No se valida el rango.
- **Arreglo:** `replace(',', '.')` antes de filtrar, aceptar un solo separador y validar 40..160 mph con un mensaje de error en lugar de cerrar el diálogo en silencio.

### I15. Rutina guiada: salir no pide confirmación y "Saltar" cuenta como hecho
- **Archivo:** `Guided.kt:27` y `:69` (salen sin confirmar ni guardar), `Guided.kt:41-43` (registra **todos** los pasos aunque se hayan saltado) y `:105`
- **Arreglo:** marcar en cada `Step` si se completó y registrar solo esos. Al salir, preguntar "¿Guardar lo hecho?".

### I16. "Cambiar ejercicio" modifica el plan para siempre
- **Archivo:** `Workout.kt:120-126`
- **Problema:** un cambio puntual (máquina ocupada) se guarda en el plan para todas las semanas siguientes, sin preguntar.
- **Arreglo:** dos opciones en el diálogo: "Solo hoy" (sustitución en memoria y en el log) y "Para el resto del bloque".

### I17. Seguridad de la API key
- **Archivo:** `Data.kt:78-83` y `:85-87`
- **Problema:** si `EncryptedSharedPreferences` falla, el `catch` cae en `plain` en silencio y la key se guarda **en claro** en `gc.xml`, mientras Perfil sigue diciendo "La key se guarda cifrada" (`Gen.kt:192`). Además `security-crypto:1.1.0-alpha06` (`app/build.gradle.kts:37`) es una alfa de una librería que AndroidX ha deprecado.
- **Arreglo:**
  - Si falla el cifrado, no guardar y mostrar "No se pudo cifrar la key".
  - A medio plazo, cifrar con una clave AES del Android Keystore propia (`KeyGenParameterSpec`) y guardar el texto cifrado.
  - Crear la key con límite de gasto mensual en la consola de Anthropic.
  - En Ajustes, mostrar solo "sk-ant…XXXX" en lugar de rellenar el campo con la key completa (`Gen.kt:184`).
- **Hallazgos sin riesgo:** no se encontró ninguna key en el código ni en `BuildConfig`; las llamadas van por HTTPS (`Api.kt:15`).

### I18. Keystore de firma y contraseñas versionadas
- **Archivo:** `app/build.gradle.kts:15-21` y `keystore/gymcoach.keystore`
- **Problema:** el keystore va en el repo con la contraseña "android". Si el repo es público, cualquiera puede firmar un APK que se instale como actualización de esta app.
- **Arreglo:** mover el keystore fuera del repo y leer las contraseñas de `local.properties` o de variables de entorno. Crear un `signingConfig` de release propio.

---

## MEJORA

- **M1. Colores fuera del tema**
  - **Archivo:** `Home.kt:37` (`0xFF4A5F51`), `PlanTab.kt:78` (`0xFF2B2418`), `Motion.kt:173` (`0xFF6E9687`), `Motion.kt:186` (`0xFF0C2A21`) y `res/values/styles.xml:4-6` (duplican `moss`/`pine` en literales)
  - **Arreglo:** añadirlos a `object C` (`track`, `amberBg`, `figureFar`, `benchFill`). En `styles.xml`, referenciar `@color/` definidos en `colors.xml`, donde hoy solo está `ic_bg` (`colors.xml:1`).
- **M2. Sin escala tipográfica**
  - **Archivo:** `Theme.kt:69-72`
  - **Problema:** `MaterialTheme` no recibe `typography`. Los componentes Material (`OutlinedTextField` en `Progress.kt:165` y `Gen.kt:193-196`, `AlertDialog`, `Slider`) usan Roboto en vez de IBM Plex. Además los tamaños son enteros sueltos (11, 12, 13, 14, 15…).
  - **Arreglo:** definir `Typography(bodyLarge = TextStyle(fontFamily = Body, …), displayLarge = … Display …)` y unos pocos tokens (`TS.caption = 12`, `body = 14`, `title = 22`, `hero = 40`, `live = 64`).
- **M3. Código muerto o engañoso:** `Pill` (`Theme.kt:94`) no se usa. `clickableNoRipple` (`Theme.kt:213`) no se usa y sí tiene ripple.
- **M4. Fórmula de minutos duplicada:** `PlanTab.kt:65` repite la de `estMinutes` (`Logic.kt:43-46`) con `+1`. Unificar en `Logic`.
- **M5. Claves y nombres:** `PlanTab.kt:70` usa `day.title + e.name` como clave (choca con duplicados) y `descs` va indexado por nombre (`Data.kt:114-125`). Pasar a `exId` estable.
- **M6. Racha poco útil:** `Home.kt:97` muestra "Racha días seguidos" (`Logic.kt:69-77`), que con 3 días por semana casi siempre vale 0-1. Cambiar por "Semanas seguidas cumpliendo 3/3" o "Sesiones este bloque".
- **M7. Home sin estado de descanso:** `Home.kt:76-92` muestra "RUTINA DE HOY" aunque hoy ya se entrenó o ya van 3/3. Mostrar "Hecho hoy ✓" o "Hoy toca descanso: movilidad 10 min".
- **M8. Saludo fijo:** `Home.kt:61` dice "Hola, Steven"; vale para uso personal, pero conviene moverlo a Perfil.
- **M9. Animación inconsistente:** `Guided.kt:80` usa `motionFor(name) ?: "generic"` e ignora `Ex.motion`; `Workout.kt:162` usa `motionOf(ex)`. Unificar. Además `motionOf` (`Motion.kt:93`) antepone la heurística por nombre al id que eligió la IA.
- **M10. Rotura silenciosa de animaciones:** si `motions.json` no carga, `Motions.init` (`Motion.kt:52`) lo ignora y `MotionView` (`:161`) no dibuja nada: queda un hueco de 230 dp. Mostrar un pictograma de respaldo.
- **M11. Red:** `Api.kt` no llama a `disconnect()` y no reintenta en 429/529 (sobrecarga). Añadir 1-2 reintentos con espera y un mensaje "El servicio está saturado, prueba en un minuto".
- **M12. Teclado:** en `Gen.kt:126-128` el campo de nota no lleva `imePadding()`; con edge-to-edge (`MainActivity.kt:33`) el teclado puede tapar el campo.
- **M13. Disco en el hilo principal:** `store.addLog` / `savePlan` se ejecutan en el hilo de UI (`MainActivity.kt:86`, `:91`, `:108`; `Workout.kt:124`). Hoy es poco volumen, pero conviene moverlo a `Dispatchers.IO` con un `Mutex` cuando el log crezca.
- **M14. Intensidad engañosa:** en `PlanTab.kt:27-28` la media de RPE incluye la movilidad (RPE 2-3) y rebaja la "intensidad" aparente. Calcularla solo con los bloques de fuerza y potencia.
- **M15. Información sin color:** los puntos de dolor (`Progress.kt:122`) se distinguen solo por color. Añadir icono o letra, o `contentDescription` por punto.
- **M16. Esquema sin versión:** los archivos `plan2.json` / `log2.json` delatan una migración hecha a mano. Añadir `"schema": N` y una función `migrate(o)` en `Data.kt`. Hoy no hay ninguna.

---

## Cambios necesarios para soportar A/B/C + `why` + bloques

### 1. Modelo (`Data.kt`)
- **`Ex` (`Data.kt:11-14`).** Añadir:
  - `id: String`: slug estable, por ejemplo `"goblet_squat"`.
  - `block: String`: enum `mov | pot | fue | acc | core | iso`.
  - `why: String`: una frase con el "para qué" de golf o salud.
  - `perSide: Boolean`.
  - `metric: String`: `reps | secs | meters`, para acarreos.
  - `kgStep: Float = 2.5f`.
  - Mantener `pillar` solo para estadísticas, derivado de `block` (`mov→mov`, `pot→golf`, el resto `fuerza`) cuando falte.
- **`Day` (`Data.kt:15`).** Añadir `id: String` ("A", "B", "C") y, opcionalmente, `blocks: List<BlockSpec>` con duración objetivo por bloque.
- **`Plan` (`Data.kt:16`).** Añadir:
  - `id: String`;
  - `schema: Int = 3`;
  - `rotation: List<String> = listOf("A", "B", "C")`.
- **`SetLog` / `LogEntry` (`Data.kt:18-22`).** Añadir:
  - en `SetLog`: `exId`, `block`, `side` y `holdActual`;
  - en `LogEntry`: `dayId` y `planId`.
  - Conservar `ex` (nombre) para el historial antiguo.
- **Serialización (`Data.kt:39-48`).** En `exToJson` / `exFromJson`, leer los campos nuevos con `opt*` y valores por defecto. Cambiar el filtro de `pillar` (`:46`) por uno de `block` con fallback desde `pillar` (`mov→mov`, `golf→pot`, `fuerza→fue`, y `holdS>0→iso`).
- **Migración.** En `planFromJson` (`:68-74`) y `loadLog` (`:127-137`): si `schema < 3`, asignar `id = "A"/"B"/"C"` por orden de día y `exId = slug(name)`, y deducir `block`. Guardar migrado con `AtomicFile` (C1) después de crear un `.bak`.
- **Validación (`validatePlan`, C5).** Exigir 3 días con ids únicos, bloques en orden válido (mov → pot → fue → acc → core → iso) y `why` no vacío (si falta, usar `note`).

### 2. Semilla (`Seed.kt`)
- Ampliar el helper `e(...)` (`Seed.kt:3-4`) con `id`, `block`, `why` y `perSide`.
- Reescribir `seedPlan()` (`Seed.kt:26-63`) como A/B/C full body con los 6 bloques. Por ejemplo, en A:
  - movilidad: cat-camel, 90/90;
  - potencia: rotación explosiva en polea;
  - fuerza: goblet;
  - accesorios: remo en polea;
  - core/acarreo: farmer carry 3×20 m (`metric = meters`);
  - isométrico: wall sit.
- Añadir descripciones semilla (`Seed.kt:67-100`) para los ejercicios nuevos (acarreos, etc.).
- Guardar la semilla al primer arranque (I12).

### 3. IA (`Api.kt`)
- **`generatePlan` (`Api.kt:62-90`).** Cambiar los criterios (`:73-76`) por el esquema A/B/C de 6 bloques en orden fijo, unos 55 min, `why` ≤ 15 palabras ligado al golf o a las restricciones, y `per_side` y `metric` cuando aplique. Actualizar el ejemplo `ex` (`:65`) y el `FORMATO JSON` (`:86`) con `"id":"A"`, `"block"`, `"why"`, `"per_side"` y `"metric"`. Preferir tool use con JSON schema (I11).
- **`alternatives` (`Api.kt:117-132`).** Añadir `block` y `why` al formato de línea (`:122`), heredar el `block` del ejercicio sustituido y parsear con `firstInt` (I10).
- **`contextSummary` (`Logic.kt:102-116`).** Agrupar por `dayId` y `exId`, e incluir cumplimiento por bloque, para que la IA vea, por ejemplo, que se saltan los isométricos.

### 4. Lógica (`Logic.kt`)
- Añadir `nextDay(plan, log)` que sustituya a `Home.kt:47`: la siguiente en `plan.rotation` después del último `dayId` del plan activo.
- `estMinutes` (`:43-46`): sumar por bloque, añadir ~60 s de transición entre bloques y tener en cuenta `perSide` (el doble de tiempo).
- `suggestKg` (`:34-41`): usar `exId` y el `kgStep` de cada ejercicio, y no sugerir progresión de carga en `pot` (en potencia prima la velocidad) ni en `iso` (ahí se progresa en segundos: +5 s si se completó).
- `lastSession` (`:31-32`): buscar por `exId`, con fallback por nombre.

### 5. UI
- **Theme (`Theme.kt:64-65`).** Añadir `blockColor` / `blockName` para 6 bloques con tokens del tema:
  - mov → `mist`;
  - pot → `amber`;
  - fue → `sand`;
  - acc → `soft`;
  - core → `flag` (o un nuevo `C.clay`);
  - iso → `chalk`.
  - Comprobar ≥3:1 sobre `pine`. Eliminar `blockName` duplicado en `PlanTab.kt:18`.
- **Home (`Home.kt:44-92`).** La tarjeta "Rutina de hoy" debe mostrar "Sesión B" en grande con la mini-secuencia de los 6 bloques (puntos de color) y "A ✓ · B hoy · C" en la tira semanal.
- **Rutinas (`PlanTab.kt`).**
  - Chips "A / B / C" (`:46`).
  - Agrupar por `e.block` en orden fijo en lugar de por cambios de `pillar` (`:30-33`).
  - Cabecera de bloque con nombre, color y minutos (`:63-66`).
  - En la tarjeta expandida (`:80-89`), mostrar **"Para qué:"** + `why` antes de la técnica.
  - En el badge (`:78`), mostrar "Isométrico 30 s ×2 lados" o "20 m".
- **Sesión en vivo (`Workout.kt`).**
  - Barra de progreso segmentada por bloque con su color (`:155-159`).
  - Etiqueta "BLOQUE 2/6 · POTENCIA" (`:169`).
  - `why` visible siempre en una línea bajo el nombre (`:170`), con la técnica plegada en `AiNote` (`:221-228`).
  - Pantalla de transición entre bloques ("Siguiente: Fuerza · 3 ejercicios · 15 min").
  - Para `iso`: cuenta previa, lados y registro de segundos reales (I5).
  - Para `metric = meters`: campo de kg + "20 m ✓", sin reps.
  - Para `pot`: ocultar la sugerencia de kg y mostrar "Máxima velocidad, para si se frena".
- **Rutina guiada (`Guided.kt:29-33`).** Respetar `perSide` al expandir pasos y mostrar `why`.
- **Resumen (`Summary.kt:49-64`).** Agrupar la tarjeta de sesión por bloque y mostrar el cumplimiento por bloque (por ejemplo "Isométrico 2/3").
- **Progreso (`Progress.kt:44-45` y `:96`).** Pasar de 3 pilares a 6 bloques (o mantener los 3 pilares derivados y añadir "Cumplimiento por bloque"). Series de carga por `exId` (`:48-50`) para que no se partan al renombrar ejercicios.
- **Motion (`Motion.kt:60-91` y `motions.json`).** Añadir ids para acarreo (`carry`), med-ball (`mb_rot_throw`) y dead bug / bird dog si entran en el bloque core. Añadirlos a la lista de ids del prompt (`Api.kt:78` y `:122`).
