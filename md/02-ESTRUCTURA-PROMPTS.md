# 02 - Estructura de Prompts

> Fórmula de 4 bloques y estructura óptima para Seed Audio 1.0

## La Fórmula de 4 Bloques

La comunidad ha encontrado que los mejores resultados siguen esta estructura:

```
┌─────────────────────────────────────────────────────────────┐
│  BLOQUE 1: FUENTE (Source)                                  │
│  Qué sonido es primario: voz, foley, ambiente, música       │
├─────────────────────────────────────────────────────────────┤
│  BLOQUE 2: ENTORNO (Environment)                            │
│  Espacio/traits: calle, sala, estudio, bosque, cueva        │
├─────────────────────────────────────────────────────────────┤
│  BLOQUE 3: TIMING                                           │
│  Cuándo aparece cada sonido: intro, beat drop, scene cut    │
├─────────────────────────────────────────────────────────────┤
│  BLOQUE 4: RESTRICCIONES DE MEZCLA                          │
│  Reglas: clean mix, no clipping, dialogue forward            │
└─────────────────────────────────────────────────────────────┘
```

## Estructura detallada del prompt

```
[FORMATO] + [PERSONAJES + EMOCIÓN] + [DIÁLOGO] + [AMBIENTE] + [MÚSICA] + [SFX] + [REGLAS DE MEZCLA]
```

### Desglose por componente:

#### 1. Formato (Format)
Define el tipo de contenido:
- `"Radio drama corto"`
- `"Podcast intro"`
- `"Audiobook chapter"`
- `"Product ad voiceover"`
- `"Meditation guide"`
- `"Game audio scene"`

#### 2. Personajes + Emoción
Describe quién habla y cómo se siente:
- `"Character A (male, tired)"`
- `"A confident female narrator"`
- `"Two characters arguing"`
- `"Calm, wise male voice"`

#### 3. Diálogo
Las líneas exactas que se dicen:
- `"You shouldn't be here."`
- `"I didn't have a choice."`
- Texto entre comillas para indicar habla

#### 4. Ambiente (Environment)
El mundo sonoro de fondo:
- `"busy cafe with dishes clinking"`
- `"dark cave with dripping water"`
- `"rainy city street at night"`
- `"quiet forest at dawn"`

#### 5. Música (BGM)
Estilo y mood musical:
- `"soft piano melody"`
- `"tense orchestral build"`
- `"lo-fi ambient pads"`
- `"upbeat electronic bed"`

#### 6. Efectos de sonido (SFX)
Sonidos específicos de la escena:
- `"door creaking open"`
- `"footsteps on gravel"`
- `"thunder crack"`
- `"glass breaking"`

#### 7. Reglas de mezcla
Instrucciones de balance de audio:
- `"Dialogue clean and prominent"`
- `"Music low, ambient subtle"`
- `"Clean mix, no harsh highs"`
- `"Voice centered, effects secondary"`

## Ejemplo completo desglosado

```
Radio drama corto de suspenso en una tienda de conveniencia a medianoche.

[FORMATO]
Radio drama corto de suspenso

[PERSONAJES + EMOCIÓN]
Two characters:
- Guard (male, bored, tired)
- Customer (female, nervous, whispering)

[DIÁLOGO]
Guard: "We're closing in five minutes."
Customer: "I know. I just... need a moment."
Guard: "You've been standing by the freezer for ten minutes."

[AMBIENTE]
Late-night convenience store. Fluorescent hum. Distant traffic. Empty parking lot outside.

[MÚSICA]
Low suspenseful drone, subtle tension building.

[SFX]
Door bell chime (opening). Footsteps on tile. Fridge buzz. Clock ticking.

[REGLAS DE MEZCLA]
Dialogue clean and prominent. Music very low. Ambient subtle. SFX punctuated.
```

## Prompt simplificado (versión corta)

Para uso rápido, puedes comprimir todo en una frase:

```
Generate a short suspense radio drama in a late-night convenience store.
```

El modelo interpretará automáticamente: diálogo, ambiente, efectos, música.

## Longitud óptima del prompt

| Tipo de prompt | Longitud recomendada | Ejemplo |
|----------------|---------------------|---------|
| Simple | 1-2 frases | `"Energetic podcast intro with upbeat music"` |
| Moderado | 3-5 frases | Descripción + personajes + ambiente |
| Detallado | 1 párrafo | Todos los bloques explícitos |
| Guion completo | Guión formateado | Diálogo + direcciones + notas de producción |

**Recomendación**: Para la mayoría de casos, **3-5 frases descriptivas** dan excelentes resultados.

## Idioma del prompt

- Seed Audio 1.0 soporta **inglés, chino, japonés, coreano, español, indonesio, portugués**
- Para mejor lip sync, escribe el diálogo **en el idioma deseado**
- El prompt descriptivo puede estar en **cualquier idioma**
- Para resultados óptimos, usa **inglés** para descripciones

## Orden de importancia de los elementos

1. **Diálogo** (si lo hay) - siempre se genera primero
2. **Voz/tono** - define la personalidad del audio
3. **Ambiente** - crea el contexto espacial
4. **Música** - establece el mood emocional
5. **SFX** - añade realismo y transiciones
6. **Mezcla** - refina el balance final

## Consejos de estructura

- **Empieza con el formato** para que el modelo entienda el contexto
- **Separa elementos con puntos** para claridad
- **Usa comas** para listar múltiples elementos del mismo tipo
- **Pon el diálogo entre comillas** para distinguirlo de las instrucciones
- **Especifica idioma** si no es inglés (ej: `"speaks in Japanese"`)
