# API de Control para Liquidsoap

## 1. Introducción

Liquidsoap expone múltiples formas de controlar la radio en tiempo real: servidores de comandos, APIs HTTP, colas de reproducción programáticas, y más. Este documento cubre todos los métodos disponibles (ordenados de más a menos recomendados).

---

## 2. Método 1: API HTTP con `harbor.http.register` (RECOMENDADO)

Es la forma más moderna, fiable y versátil de controlar Liquidsoap. Evita los problemas del protocolo telnet.

### 2a. API Simplificada: `harbor.http.register.simple`

```liquidsoap
harbor.http.register.simple(port=8080, method="GET", path, handler)
```

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `port` | int | 8000 | Puerto a escuchar |
| `transport` | http.transport | - | Permite HTTPS (ver sección 2e) |
| `method` | string | - | `"GET"`, `"PUT"`, `"POST"`, `"DELETE"`, etc. |
| `path` | string | - | Ruta, ej. `"/api/status"` o `"/users/:id"` |
| `handler` | function | - | Recibe `request`, debe retornar `http.response(...)` |

**El handler recibe un registro `request` con:**
- `path` (string) — ruta de la petición
- `method` (string) — método HTTP
- `headers` (`[(string*string)]`) — cabeceras
- `query` (`[(string*string)]`) — query params + fragmentos de ruta nombrados
- `body` (function `() -> string`) — lee el cuerpo completo
- `data` (function `() -> string`) — stream del cuerpo
- `socket` (socket) — socket subyacente

**Ejemplo:**
```liquidsoap
def handler(request) =
  http.response(
    content_type="text/html",
    data="<p>ok, funciona!</p>"
  )
end

harbor.http.register.simple(port=8080, method="GET", "/my-path", handler)
```

### 2b. API Estilo Node/Express: `harbor.http.register`

```liquidsoap
harbor.http.register(port=8080, method="GET", path, handler)
```

El handler recibe `(request, response)`. El objeto `response` tiene métodos:

| Método | Descripción |
|--------|-------------|
| `response.status_code(201)` | Definir código de estado |
| `response.status_message("Created")` | Definir mensaje de estado |
| `response.headers([("X-Foo", "bar")])` | Reemplazar todas las cabeceras |
| `response.header("X-Foo", "bar")` | Añadir una cabecera |
| `response.content_type("application/json")` | Definir Content-Type |
| `response.data("foo")` | Definir cuerpo (string o `() -> string`) |
| `response.json({foo = "bar"})` | Enviar JSON |
| `response.html("<p>funciona!</p>")` | Enviar HTML |
| `response.redirect("http://...")` | Redirección HTTP |
| `response.send_status(socket)` | Enviar estado directamente al socket |

**Ejemplo:**
```liquidsoap
def handler(request, response) =
  response.json({status = "ok", path = request.path})
end

harbor.http.register(port=7000, method="GET", "/api/status", handler)
```

### 2c. Variantes con Regex

- `harbor.http.register.simple.regexp` — igual que `.simple` pero acepta regex completo como path
- `harbor.http.register.regexp` — igual que el normal pero acepta regex

Los grupos nombrados en la regex se pasan vía `request.query`.

### 2d. Servir Archivos Estáticos

```liquidsoap
harbor.http.static(port=8080, path="/static", "/var/www/html")
```

### 2e. Soporte HTTPS

```liquidsoap
transport = http.transport.ssl(
  certificate="/ruta/al/cert.pem",
  key="/ruta/al/key.pem",
  password="opcional"
)
harbor.http.register(transport=transport, port=8443, ...)
```

---

## 3. Método 2: `request.queue` — Cola de Reproducción Programática

### 3a. Creación

```liquidsoap
queue = request.queue(id="mi-cola", interactive=true, timeout=20.)
```

| Argumento | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `id` | string? | null | Forzar ID de la fuente |
| `interactive` | bool | true | Controlable vía telnet/server |
| `prefetch` | int? | null | Cuántos requests preparar anticipadamente |
| `native` | bool | false | Usar implementación nativa |
| `queue` | [request] | [] | Cola inicial |
| `timeout` | float | 20. | Timeout de descarga en segundos |

### 3b. Métodos de Control

| Método | Firma | Descripción |
|--------|-------|-------------|
| `push` | `(request)` o `.uri(string)` | Añadir a la cola |
| `queue` | `() -> [request]` | Obtener cola actual |
| `set_queue` | `([request]) -> unit` | Reemplazar toda la cola |
| `length` | `() -> int` | Longitud de la cola |
| `current` | `() -> request?` | Request reproduciéndose ahora |
| `skip` | `() -> unit` | Saltar al siguiente tema |
| `fetch` | `() -> bool` | Intentar alimentar la cola |
| `remaining` | `() -> float` | Tiempo restante estimado |
| `duration` | `() -> float` | Duración estimada del tema actual |
| `elapsed` | `() -> float` | Tiempo transcurrido |
| `buffered` | `() -> [string * float]` | Datos en buffer |
| `id` | `() -> string` | Identificador de la fuente |
| `seek` | `(float) -> float` | Adelantar/retroceder |
| `fallible` | bool | Fuente puede fallar al reproducir |
| `on_metadata` | `((metadata) -> unit) -> unit` | Callback de metadatos |
| `on_track` | `((metadata) -> unit) -> unit` | Callback de cambio de tema |
| `on_shutdown` | `(() -> unit) -> unit` | Callback de apagado |
| `on_wake_up` | `(() -> unit) -> unit` | Callback de activación |
| `log` | getter/setter | Nivel de log (1-5) |

### 3c. Sistema de Doble Cola

`request.queue` maneja **dos colas**:
- **Cola primaria**: gestionada internamente, alimenta la reproducción
- **Cola secundaria**: controlada por el usuario. Los requests se añaden aquí y el proceso de alimentación los prepara y mueve a la primaria.

---

## 4. Método 3: Comandos vía `server.execute()`

Ejecuta cualquier comando del servidor directamente desde el script:

```liquidsoad
server.execute("queue.push", "/ruta/al/archivo.mp3")
```

**Tipo**: `(string, ?string) -> [string]`

Útil para automatización local sin necesidad de conexión externa.

---

## 5. Método 4: Comandos Personalizados con `server.register`

Registra comandos personalizados accesibles vía telnet, socket, o `server.execute`:

```liquidsoap
server.register(
  namespace="mi-app",
  description="Añade un request a la cola",
  usage="push <uri>",
  "push",
  fun (arg) ->
    queue.push(uri=arg)
    "OK"
  end
)
```

---

## 6. Método 5: Socket Unix (sin TCP)

Evita TCP/telnet por completo usando un socket Unix:

```liquidsoap
settings.server.socket := true
settings.server.socket.path := "/tmp/liquidsoap.sock"
```

Conectarse con: `socat /tmp/liquidsoap.sock -`

---

## 7. Ejemplo Completo: API REST para Controlar la Radio

```liquidsoap
# Crear cola
queue = request.queue(id="cola-principal")

# Handler: push
def push_handler(request, response) =
  uri = list.assoc(default="", "uri", request.query)
  if uri != "" then
    queue.push(uri=uri)
    response.json({status="ok", uri=uri, queue_length=queue.length()})
  else
    response.status_code(400)
    response.json({status="error", message="Falta parámetro 'uri'"})
  end
end

# Handler: listar cola
def list_handler(request, response) =
  response.json({length=queue.length(), queue=queue.queue()})
end

# Handler: skip
def skip_handler(request, response) =
  queue.skip()
  response.json({status="skipped"})
end

# Handler: info actual
def current_handler(request, response) =
  cur = queue.current()
  response.json({current=cur, elapsed=queue.elapsed(), remaining=queue.remaining()})
end

# Registrar endpoints
harbor.http.register(port=8080, method="GET", "/queue/push/:uri", push_handler)
harbor.http.register(port=8080, method="GET", "/queue/list", list_handler)
harbor.http.register(port=8080, method="GET", "/queue/skip", skip_handler)
harbor.http.register(port=8080, method="GET", "/queue/current", current_handler)
```

---

## 8. Comandos Incorporados del Servidor

Disponibles vía telnet, socket Unix, o `server.execute()`:

| Comando | Descripción |
|---------|-------------|
| `help [comando]` | Mostrar ayuda |
| `list` | Listar comandos disponibles |
| `exit` / `quit` | Desconectar |
| `uptime` | Tiempo activo del servidor |
| `version` | Versión de Liquidsoap |
| `request.alive` | Requests vivos |
| `request.all` | Todos los requests |
| `request.metadata <rid>` | Metadatos de un request |
| `request.on_air` | Request reproduciéndose ahora |
| `request.resolving` | Requests resolviéndose |
| `request.trace <rid>` | Traza de un request |
| `var.get <variable>` | Obtener variable interactiva |
| `var.set <variable> = <valor>` | Definir variable interactiva |
| `var.list` | Listar variables interactivas |

Cuando `request.queue` tiene `interactive=true`, registra automáticamente:
- `<id>.push <uri>` — Añadir a la cola
- `<id>.queue` — Listar cola
- `<id>.length` — Longitud
- `<id>.current` — Reproduciéndose ahora
- `<id>.skip` — Saltar
- `<id>.set_queue` — Reemplazar cola

---

## 9. Resumen: Qué Usar Según el Caso

| Caso | Método Recomendado |
|------|--------------------|
| Control remoto vía HTTP | `harbor.http.register` con API REST |
| Automatización desde el mismo script | `server.execute()` |
| Comunicación local entre procesos | Socket Unix (`settings.server.socket`) |
| CLI / scripts externos | Telnet o socket Unix |
| Reemplazo de `server.harbor()` | API HTTP con `harbor.http.register` |

> **Nota**: `server.harbor()` e `interactive.harbor()` ya no están documentados en la API actual. La alternativa moderna es usar `harbor.http.register.*`.
