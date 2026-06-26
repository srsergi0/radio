# 06 - API y Parámetros

> Documentación técnica completa de la API de Seed Audio 1.0

## Endpoints Disponibles

### Volcano Engine Ark (Oficial)
```
https://console.volcengine.com/ark/
```
- Acceso por invitación
- Integración con productos ByteDance (CapCut, Jimeng, Fanqie)

### fal.ai (Terceros)
```
https://fal.ai/models/bytedance/seed-audio-1.0
```
- Acceso abierto con API key
- Precio: **$0.075 por minuto** de audio generado

---

## Esquema de Entrada (Input Schema)

### Campo obligatorio

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `prompt` | `string` | **Requerido.** Texto descriptivo de la escena a generar |

### Campos opcionales

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `voice` | `enum` | - | Voz preestablecida para síntesis |
| `audio_urls` | `list<string>` | - | Hasta 3 URLs de audio de referencia |
| `image_url` | `string` | - | 1 imagen de referencia (no combinar con audio_urls) |
| `output_format` | `enum` | `"mp3"` | Formato de salida del audio |
| `sample_rate` | `enum` | `"24000"` | Frecuencia de muestreo en Hz |
| `speed` | `float` | `1` | Velocidad del habla (0.5 a 2.0) |
| `volume` | `float` | `1` | Volumen (0.5 a 2.0) |
| `pitch` | `integer` | `0` | Cambio de tono en semitonos (-12 a 12) |

---

## Voces Preestablecidas (Voice)

### Lista completa de 20 voces

| Voice ID | Idiomas | Género |
|----------|---------|--------|
| `vivi_mixed_en_zh_ja_es_id` | EN, ZH, JA, ES, ID | Mixto |
| `mindy_en_es_id_pt_zh` | EN, ES, ID, PT, ZH | Femenino |
| `kian_en_zh` | EN, ZH | Masculino |
| `cedric_en_zh` | EN, ZH | Masculino |
| `sophie_en_zh` | EN, ZH | Femenino |
| `jean_en_zh` | EN, ZH | Femenino |
| `magnus_en_zh` | EN, ZH | Masculino |
| `mabel_en_zh` | EN, ZH | Femenino |
| `nadia_en_zh` | EN, ZH | Femenino |
| `opal_en_zh` | EN, ZH | Femenino |
| `pearl_en_zh` | EN, ZH | Femenino |
| `quentin_en_zh` | EN, ZH | Masculino |
| `corinne_mixed_en_zh` | EN, ZH | Femenino |
| `esther_mixed_en_zh` | EN, ZH | Femenino |
| `lyla_mixed_en_zh` | EN, ZH | Femenino |
| `tracy_es_zh` | ES, ZH | Femenino |
| `sandy_es_mixed_en_zh` | ES, EN, ZH | Femenino |
| `felix_zh` | ZH | Masculino |
| `celeste_zh` | ZH | Femenino |
| `monkey_king_zh` | ZH | Masculino |

### Uso en el prompt
```
"Generate with voice: sophie_en_zh. Warm female narration."
```

### Uso en la API (JavaScript)
```javascript
input: {
  prompt: "Warm female narration for a podcast intro.",
  voice: "sophie_en_zh"
}
```

---

## Formatos de Salida (Output Format)

| Formato | Extensión | Uso recomendado |
|---------|-----------|-----------------|
| `mp3` | `.mp3` | General, web, social media |
| `wav` | `.wav` | Edición profesional, alta calidad |
| `pcm` | `.pcm` | Procesamiento raw, desarrollo |
| `ogg_opus` | `.ogg` | Streaming, voip, bajo ancho de banda |

---

## Frecuencia de Muestreo (Sample Rate)

| Rate | Calidad | Uso |
|------|---------|-----|
| `8000` | Baja | VoIP,电话 |
| `16000` | Media | Speech recognition, dictado |
| `24000` | Buena | General, recomendado |
| `32000` | Alta | Podcast, contenido |
| `44100` | CD quality | Música, distribución |
| `48000` | Profesional | Cine, broadcast |

**Recomendación**: `24000` para la mayoría de casos.

---

## Parámetros de Voz

### Speed (Velocidad)
| Valor | Efecto |
|-------|--------|
| `0.5` | Mitad de velocidad, muy lento |
| `0.8` | Ligeramente lento, contemplativo |
| `1.0` | Normal |
| `1.2` | Ligeramente rápido, energético |
| `2.0` | El doble de rápido, urgente |

### Volume (Volumen)
| Valor | Efecto |
|-------|--------|
| `0.5` | Mitad de volumen |
| `1.0` | Normal |
| `2.0` | El doble de volumen |

### Pitch (Tono)
| Valor | Efecto |
|-------|--------|
| `-12` | Una octava más bajo |
| `-6` | Medio tono más bajo |
| `0` | Normal |
| `+6` | Medio tono más alto |
| `+12` | Una octava más alto |

---

## Ejemplo Completo API (JavaScript)

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("bytedance/seed-audio-1.0", {
  input: {
    prompt: "Radio drama scene in a late-night convenience store. Two characters: Guard (male, bored): 'We're closing.' Customer (female, nervous): 'I know.' Ambient: fluorescent hum, distant traffic. Music: low suspenseful drone.",
    voice: "cedric_en_zh",
    output_format: "mp3",
    sample_rate: "24000",
    speed: 1,
    volume: 1,
    pitch: 0
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});

console.log(result.data);
// {
//   audio: {
//     url: "https://...",
//     content_type: "audio/mpeg",
//     file_name: "speech.mp3",
//     file_size: 520556,
//     duration: 65,
//     sample_rate: 24000
//   }
// }
```

## Ejemplo con Audio de Referencia

```javascript
const result = await fal.subscribe("bytedance/seed-audio-1.0", {
  input: {
    prompt: "Narrator voice matching @Audio1. Warm and wise. 'The story begins where the light fades...'",
    voice: "sophie_en_zh",
    audio_urls: [
      "https://example.com/reference-voice.mp3"
    ]
  },
});
```

## Ejemplo con Imagen de Referencia

```javascript
const result = await fal.subscribe("bytedance/seed-audio-1.0", {
  input: {
    prompt: "Character speaks with animated expression matching the face in the image. Clear, confident voice.",
    image_url: "https://example.com/portrait.png"
    // NOTA: No combinar image_url con audio_urls
  },
});
```

---

## Esquema de Salida (Output Schema)

```json
{
  "audio": {
    "url": "https://v3b.fal.media/files/...",
    "content_type": "audio/mpeg",
    "file_name": "speech.mp3",
    "file_size": 520556,
    "duration": 65,
    "channels": null,
    "sample_rate": 24000,
    "bitrate": null
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `audio.url` | `string` | URL de descarga del archivo |
| `audio.content_type` | `string` | Tipo MIME del archivo |
| `audio.file_name` | `string` | Nombre del archivo |
| `audio.file_size` | `integer` | Tamaño en bytes |
| `audio.duration` | `float` | Duración en segundos |
| `audio.sample_rate` | `integer` | Frecuencia de muestreo |

---

## Instalación del Cliente

```bash
npm install --save @fal-ai/client
```

```bash
yarn add @fal-ai/client
```

```bash
pnpm add @fal-ai/client
```

```bash
bun add @fal-ai/client
```

## Autenticación

### Variable de entorno (recomendado)
```bash
export FAL_KEY="YOUR_API_KEY"
```

### Configuración manual
```javascript
import { fal } from "@fal-ai/client";

fal.config({
  credentials: "YOUR_FAL_KEY"
});
```

---

## Precios

| Plataforma | Precio |
|------------|--------|
| fal.ai | $0.075/minuto |
| Volcano Engine | Variable (ver consola) |
| Volcano Ark Trial | 30 minutos gratis |

---

## Formato de Audio de Referencia

| Formato | Soportado | Notas |
|---------|-----------|-------|
| MP3 | ✅ | Más confiable |
| WAV | ⚠️ | Puede fallar silenciosamente |
| PCM | ✅ | Raw, sin compresión |
| OGG Opus | ✅ | Bueno para streaming |
| FLAC | ⚠️ | Puede fallar silenciosamente |
| AAC | ⚠️ | Puede fallar silenciosamente |
