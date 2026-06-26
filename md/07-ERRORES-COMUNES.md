# 07 - Errores Comunes

> Los 10 errores más frecuentes y cómo evitarlos

## Error 1: No especificar capas de mezcla

### ❌ Mal
```
Character talking in a cafe with music.
```

### ✅ Bien
```
Character talking in a cafe. 
Dialogue clean and prominent, music low, ambient subtle.
```

**Problema**: Sin instrucción de mezcla, todas las capas se generan al mismo volumen y el diálogo pierde claridad.

---

## Error 2: Demasiadas capas de SFX

### ❌ Mal
```
Footsteps + door opening + phone ringing + dishes clinking + rain + wind + birds + traffic + music + dialogue
```

### ✅ Bien
```
Dialogue in a cafe. Ambient: dishes clinking, quiet chatter. Music: soft jazz.
SFX: coffee machine hiss.
```

**Problema**: Más de 3 capas simultáneas → el audio se vuelve empañado y confuso.

---

## Error 3: Frases de diálogo demasiado largas

### ❌ Mal
```
Character says: "Well, you know, I've been thinking about this for a really long time and I think that maybe we should consider the possibility that there might be a better way to approach this particular problem that we've been dealing with."
```

### ✅ Bien
```
Character says: "I've been thinking. Maybe there's a better way."
```

**Problema**: Líneas largas (>8 segundos) pierden calidad de lip sync y el audio se degrada.

---

## Error 4: Incluir instrucciones de movimiento en prompts de diálogo

### ❌ Mal
```
Character nodding and turning head while speaking: "I agree."
```

### ✅ Bien
```
Character speaking directly to camera: "I agree."
```

**Problema**: `"nodding"` y `"turning head"` compiten con el engine de lip sync y producen movimientos extraños.

---

## Error 5: No usar audio de referencia cuando se necesita consistencia

### ❌ Mal
```
Narrator voice for audiobook chapter 1.
```

### ✅ Bien
```
Narrator voice matching @Audio1. Warm, wise, consistent throughout.
```

**Problema**: Sin referencia, el timbre de voz puede variar entre generaciones o dentro del mismo clip.

---

## Error 6: No definir mood/emoción

### ❌ Mal
```
Character says "Hello."
```

### ✅ Bien
```
Friendly character (warm, cheerful): "Hello!"
Ambient: sunny park, birds chirping.
Music: light acoustic guitar, happy mood.
```

**Problema**: Sin emoción ni ambiente, el modelo interpreta demasiado libremente y puede generar resultados inesperados.

---

## Error 7: Usar términos musicales muy técnicos

### ❌ Mal
```
Music: minor key, arpeggiated chord progression, 70 BPM, diminished fifth interval.
```

### ✅ Bien
```
Music: melancholic and sparse, slow piano, contemplative mood.
```

**Problema**: El modelo responde mejor a descriptores de **mood y género** que a terminología musical técnica.

---

## Error 8: No especificar idioma del diálogo

### ❌ Mal
```
Character says: "今日は天気がいいですね。"
```

### ✅ Bien
```
Character speaks in Japanese: "今日は天気がいいですね。"
```

**Problema**: Sin tag de idioma, el modelo puede intentar pronunciar texto en otro idioma con acento incorrecto.

---

## Error 9: Combinar image_url con audio_urls

### ❌ Mal
```javascript
input: {
  prompt: "...",
  image_url: "https://example.com/portrait.png",
  audio_urls: ["https://example.com/voice.mp3"]  // ¡ERROR!
}
```

### ✅ Bien
```javascript
// Opción A: Solo imagen
input: {
  prompt: "...",
  image_url: "https://example.com/portrait.png"
}

// Opción B: Solo audio
input: {
  prompt: "...",
  audio_urls: ["https://example.com/voice.mp3"]
}
```

**Problema**: La API no permite combinar ambos tipos de referencia.

---

## Error 10: No incluir corte limpio al final

### ❌ Mal
```
Music builds to dramatic climax.
```

### ✅ Bien
```
Music builds to dramatic climax, resolves on last frame. Silence holds final 0.5s.
```

**Problema**: Sin instrucción de corte, el audio puede terminar abruptamente o con artifacts.

---

## Resumen: Checklist antes de generar

- [ ] ¿Especifiqué qué capa lidera la mezcla?
- [ ] ¿Mantuve SFX en máximo 3 capas?
- [ ] ¿Las líneas de diálogo son cortas (5-10 palabras)?
- [ ] ¿Evité instrucciones de movimiento con lip sync?
- [ ] ¿Definí el mood/emoción de la escena?
- [ ] ¿Usé descriptores de mood en vez de términos técnicos?
- [ ] ¿Especifiqué el idioma del diálogo?
- [ ] ¿No combiné image_url con audio_urls?
- [ ] ¿Incluí corte limpio al final?
- [ ] ¿El prompt no es demasiado largo o complejo?
