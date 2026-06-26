# 05 - Referencia de Audio e Imagen

> Cómo usar @Audio1-3 e image_url para guiar la generación

## Audio de Referencia

### ¿Qué es?
Subes un clip de audio (hasta 3) que el modelo usa como referencia para:
- **Timbre de voz** - cómo suena el hablante
- **Estilo de habla** - ritmo, énfasis, personalidad
- **Tono/mood** - ambiente emocional del audio
- **Identidad vocal** - mantener consistencia del personaje

### Parámetros técnicos

| Parámetro | Límite |
|-----------|--------|
| Máximo de clips | 3 (`@Audio1`, `@Audio2`, `@Audio3`) |
| Duración máxima por clip | 30 segundos |
| Tamaño máximo por clip | 10 MB |
| Formatos soportados | wav, mp3, pcm, ogg_opus |

### Cómo referenciar en el prompt
```
"Use @Audio1 for the narrator voice. @Audio2 for the background music style."
```

### Casos de uso

#### Clonar voz
```
"A warm male voice matching the timbre of @Audio1. Narrating a story with emotion."
```

#### Estilo de música
```
"Background music in the style of @Audio2. Ambient electronic, soft pads."
```

#### Mood/ambiente
```
"Ambient atmosphere similar to @Audio1. Late night city, quiet and contemplative."
```

#### Consistencia de personaje
```
"Character voice matching @Audio1 throughout. Maintain the same timbre and accent."
```

### Consejos para audio de referencia

1. **Clips cortos (3-8 segundos)** funcionan mejor
2. **Audio limpio** sin ruido de fondo
3. **Formato MP3** es el más confiable (WAV/FLAC pueden fallar silenciosamente)
4. **No exceder 15 segundos** - la calidad de sync decae después de 10s
5. **Una voz por clip** - no mezclar múltiples hablantes en un clip

---

## Imagen de Referencia

### ¿Qué es?
Subes una imagen que el modelo usa como referencia para influenciar la generación de audio.

### Parámetros técnicos

| Parámetro | Límite |
|-----------|--------|
| Formatos | jpeg, png, webp |
| Tamaño máximo | 10 MB |
| Cantidad | 1 sola imagen |

### ¡IMPORTANTE!
**No se puede combinar** `image_url` con `audio_urls`. Es uno u otro.

### Cómo afecta la imagen al audio

#### Para lip sync
La imagen de referencia afecta directamente la calidad del lip sync:
- **Rostro frontal** → mejor lip sync
- **Rostro de perfil** → lip sync impreciso
- **Rostro borrodo** → movimientos de boca aproximados
- **Rostro claro, bien iluminado** → lip sync más preciso

#### Para ambientación
La imagen puede influenciar el ambiente sonoro:
- Imagen de bosque → sonidos de naturaleza
- Imagen de ciudad → sonidos urbanos
- Imagen de interior → room tone

### Preparación de imagen óptima

Para mejor lip sync:
1. **Rostro frontal** o ligeramente tres cuartos
2. **Buena iluminación** en el rostro
3. **Fondo transparente** (remover background)
4. **Bordes claros** del rostro
5. **Área de boca visible** sin obstrucciones
6. **Alta resolución** en la zona del rostro

### Ejemplo de prompt con imagen
```
[ image_url: portrait.png ]
Character speaks directly to camera with animated expression.
Clear, confident voice. Lip sync with the face in the reference image.
```

---

## Combinando Audio + Texto (sin imagen)

### Flujo típico
1. Sube **hasta 3 clips de audio** como referencia
2. Referencia cada clip en el prompt con `@Audio1`, `@Audio2`, `@Audio3`
3. Describe la escena con texto
4. El modelo combina todo

### Ejemplo completo
```
@Audio1 - Reference voice for narrator
@Audio2 - Reference music style
@Audio3 - Reference ambient sound

Narrator voice matching @Audio1, warm and wise.
Background music in the style of @Audio2, ambient electronic.
Atmosphere similar to @Audio3, rainy city night.

"The story begins where the light fades..."
```

### Solo texto (sin referencias)
También funciona perfectamente sin audio de referencia. El modelo interpreta tu descripción textual.

---

## Limitaciones de referencias

### Audio
- **Máximo 3 clips** por generación
- **30 segundos** máximo por clip
- **10 MB** máximo por clip
- **No funciona** para lip sync directo (solo para timbre/estilo)

### Imagen
- **1 sola imagen** por generación
- **No combinar** con audio de referencia
- **Mejor para lip sync** que el audio de referencia
- **Rostro claro** es esencial

### General
- Las referencias son **guías**, no garantías exactas
- El modelo **interpreta** las referencias, no las clona perfectamente
- Para clonación de voz precisa, usar el **voice parameter** con las voces preestablecidas
