# 04 - Técnicas Avanzadas

> Timing, capas de mezcla, emociones, pacing, BGM y más

## 1. Timing y Timestamps

### Anclar sonidos a momentos específicos
Puedes especificar exactamente cuándo debe aparecer un sonido:

```
"SFX: thunder crack at 3s. Lightning illuminates the scene at the thunder crack."
```

```
"Music: low piano note enters at 3s, resolves on last frame. Silence holds final 0.5s."
```

### Pausas explícitas en diálogo
```
"Brief pause at 2s, then continues with urgency."
```

```
"Long pause after 'I love you', then whispers: 'Goodbye.'"
```

### Control de ritmo
```
"Slow, measured delivery. Three beats between each sentence."
```

```
"Rapid-fire delivery, barely pausing between words."
```

---

## 2. Capas de Mezcla (Mix Layers)

### Jerarquía de capas
Seed Audio maneja hasta **3-4 capas simultáneas**. Más de 3 puede volverse confuso.

| Capa | Ejemplos | Prioridad típica |
|------|----------|-----------------|
| **Voz/Dialogue** | Habla, narración, diálogos | Alta (lidera) |
| **Música (BGM)** | Bandas sonoras, ambient musical | Media-baja |
| **SFX** | Efectos puntuales, Foley | Media |
| **Ambiente** | Sonido ambiental, room tone | Baja (fondo) |

### Especificar prioridad de mezcla
**Con diálogo:**
```
"Dialogue clean and prominent, music low, ambient subtle."
```

**Sin diálogo (musical):**
```
"Music leads, ambient secondary, no dialogue."
```

**Solo ambiente:**
```
"No music, no dialogue. Pure ambient atmosphere."
```

**Efectos al frente:**
```
"SFX prominent, dialogue secondary, music very low."
```

### Errores comunes de mezcla
- **Sin instrucción de mezcla**: todas las capas compiten a mismo volumen
- **Demasiadas capas** (>3): el audio se vuelve empañado y confuso
- **Música demasiado alta**: el diálogo pierde claridad

---

## 3. Control Emocional

### Descriptores de emoción para voces
| Emoción | Descriptores efectivos |
|---------|----------------------|
| Felicidad | `joyful, bright, upbeat, cheerful, warm` |
| Tristeza | `melancholic, somber, heavy, defeated, tearful` |
| Ira | `furious, intense, sharp, commanding, aggressive` |
| Miedo | `terrified, trembling, whispered, breathless, panicky` |
| Sorpresa | `startled, gasping, incredulous, shocked` |
| Calma | `serene, peaceful, gentle, measured, soothing` |
| Tensión | `tense, tight, urgent, strained, anxious` |
| Confianza | `confident, assured, steady, authoritative` |

### Ejemplo con emociones
```
Character A (male, furious, shouting): "Get out of my house!"
Character B (female, terrified, whispering): "Please, just listen..."
Ambient: tense silence, clock ticking loudly.
Music: dissonant strings, rising dread.
Dialogue prominent, music building, ambient eerie.
```

### Arco emocional
Puedes describir cómo cambia la emoción a lo largo del clip:
```
"Voice starts calm and measured, gradually builds to emotional outburst, then breaks into tears."
```

---

## 4. Pacing y Velocidad

### Control de velocidad
En la API puedes usar el parámetro `speed`:
- `0.5` = Mitad de velocidad (lento, pausado)
- `0.8` = Ligeramente lento (contemplativo)
- `1.0` = Velocidad normal
- `1.2` = Ligeramente rápido (energético)
- `2.0` = El doble de rápido (urgente)

### Instrucciones de pacing en el prompt
```
"Slow, deliberate pacing with long pauses between thoughts."
```

```
"Fast-paced, energetic delivery, barely pausing for breath."
```

```
"Measured tempo, three beats per sentence, deliberate and wise."
```

### Para lip sync óptimo
- Grabar referencias de audio al **80% de velocidad natural**
- Ligeramente más lento = mejor lip sync
- Evitar líneas rápidas o complicadas

---

## 5. Música de Fondo (BGM)

### Descriptores de género efectivos

| Género | Keywords efectivos |
|--------|-------------------|
| Ambient | `ambient pads, atmospheric, ethereal, floating` |
| Clásica | `orchestral, strings, piano, symphonic` |
| Electrónica | `synth, electronic, electronic bed, minimal techno` |
| Jazz | `jazz piano, smooth jazz, saxophone, lounge` |
| Rock | `guitar riff, rock drums, electric guitar, heavy` |
| Orquestal | `epic orchestral, cinematic score, film score` |
| Lo-fi | `lo-fi beats, chillhop, relaxed, warm` |
| Folk | `acoustic guitar, folk, singer-songwriter, gentle` |

### Mood vs. Términos técnicos
**Palabras de mood son más efectivas que términos musicales:**

```
✅ "Melancholic and sparse"
❌ "Minor key, arpeggiated"
```

```
✅ "Tense and building"
❌ "Crescendo with dissonant harmonics"
```

```
✅ "Warm and cozy"
❌ "Major seventh chord progression"
```

### Fade in/out
```
"Music: low piano note enters at 3s, resolves on last frame. Silence holds final 0.5s."
```

### Evitar corte abrupto
El último consejo crucial:
```
"Silence holds final 0.5s."
```
Esto evita el corte abrupto de audio que es común en generaciones AI.

---

## 6. Efectos de Sonido (SFX)

### Fuente + Superficie
El modelo responde mejor cuando describes **la fuente Y la superficie**:

```
✅ "Boots on wet cobblestone"
❌ "Footsteps"
```

```
✅ "Sneakers on hardwood floor"
❌ "Walking sounds"
```

```
✅ "Rain on tin roof"
❌ "Rain"
```

### Anclaje temporal
```
"SFX: glass breaking at 5s"
```

```
"SFX: door slam at scene transition"
```

### Capas de SFX (máximo 3)
```
"Sound: rain bed + distant train hum. SFX: chess piece click at 2s."
```

Más de 3 capas simultáneas → el audio se empaña.

---

## 7. Onomatopeyas y Sonidos No Verbales

Seed Audio soporta generar:
- **Risas**: `"laughs nervously"`
- **Suspiros**: `"sighs deeply"`
- **Respiración**: `"breathing heavily"`
- **Llanto**: `"tearful voice"`
- **Gritos**: `"shouting"`
- **Susurros**: `"whispering"`
- **Tos**: `"coughs"`
- **Humedad de boca**: `"wet mouth sounds"` (para ASMR)

### Ejemplo
```
Character (female, breathless, panting): "I made it..."
[She collapses into chair, audible exhale]
Ambient: running footsteps fading, door closing.
```

---

## 8. Espacio y Acústica

### Tipos de reverb/espacio
| Espacio | Descriptores |
|---------|-------------|
| Sala pequeña | `"tight room, minimal reverb, intimate"` |
| Sala grande | `"large hall, long reverb tail, spacious"` |
| Cueva | `"cave reverb, deep echoes, dripping"` |
| Exterior | `"open air, no reverb, wide stereo"` |
| Baño/tiles | `"bathroom reverb, reflective, bright"` |
| Estudio | `"dry studio sound, no reverb, close"` |

### Ejemplo
```
"Voice with cave reverb, deep echoes, dripping water ambient. Wet, reflective acoustic space."
```

---

## 9. Negativos / Restricciones

Puedes especificar qué **NO** quieres:
```
"No clipping, no harsh highs, no distortion."
```

```
"Dialogue clean. No background music."
```

```
"No robotic artifacts. Natural human delivery."
```

```
"Soft and intimate. No sudden loud sounds."
```

---

## 10. Idiomas y Acentos

### Especificar idioma del diálogo
```
"Character speaks in Japanese: '今日は天気がいいですね。'"
```

```
"Narrator speaks in Spanish with warm Latin American accent."
```

### Mejores idiomas para lip sync
1. **Mandarín** - más consistente
2. **Inglés** - segundo mejor
3. **Japonés** - bueno, puede drift en frases largas
4. **Coreano** - sólido, similar al japonés

**Consejo**: Para cualquier idioma, mantener líneas **bajo 10 palabras** y usar imagen de referencia frontal.
