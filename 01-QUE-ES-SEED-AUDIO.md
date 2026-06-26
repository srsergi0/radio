# 01 - Qué es Seed Audio 1.0

> Descripción general del modelo, sus capacidades y por qué es diferente a un TTS tradicional

## ¿Qué es Seed Audio 1.0?

Seed Audio 1.0 (también conocido como **Doubao-Seed-Audio 1.0**) es el modelo de generación de audio de ByteDance, parte del ecosistema de modelos Seed.

**No es un simple text-to-speech.** Es un modelo de **generación de audio completo por escena** (full-scene audio generation).

## Diferencia con TTS tradicional

| Característica | TTS Tradicional | Seed Audio 1.0 |
|----------------|-----------------|----------------|
| Salida | Una voz leyendo texto | Escena completa de audio |
| Personajes | 1 solo voz | Múltiples personajes con voces distintas |
| Música | No genera | Genera música de fondo original |
| Efectos | No genera | Genera Foley y SFX |
| Ambiente | No genera | Genera sonido ambiental |
| Emociones | Limitado | Control emocional completo |
| Duración | Segundos | Hasta 2 minutos continuos |
| Mezcla | Manual | Automática end-to-end |

## Capacidades principales

### 1. Diálogo multi-personaje
- Hasta **3 personajes** con voces distintas
- Cada personaje mantiene su identidad vocal
- Emociones y tono controlables por personaje

### 2. Música de fondo (BGM)
- Género, tempo, mood especificables
- Se integra con el diálogo sin competir
- Fade in/out controlable

### 3. Efectos de sonido (SFX/Foley)
- Puertas, pasos, lluvia, viento, etc.
- Timing sincronizado con la escena
- Onomatopeyas y sonidos realistas

### 4. Ambiente/Atmósfera
- Bosques, ciudades, cafeterías, cuevas
- Se superpone naturalmente con其他 capas
- Crea el "mundo sonoro" de la escena

### 5. Referencia multimodal
- **Texto**: descripción de la escena
- **Audio de referencia**: timbre, estilo, tono (hasta 3 clips)
- **Imagen de referencia**: afecta generación de audio (rostro para lip sync)

## Flujo de trabajo del modelo

```
Tu prompt (texto + referencias)
        ↓
   Seed Audio 1.0
        ↓
Audio completo generado:
├── Voz/dialogo (capa 1)
├── Música de fondo (capa 2)
├── Efectos de sonido (capa 3)
└── Ambiente (capa 4)
```

## Casos de uso principales

1. **Podcast** - Intros, tráilers, segmentos con música y efectos
2. **Radio drama** - Diálogos con ambientación completa
3. **Audiolibros** - Narración con música y efectos sutiles
4. **Videojuegos** - Audio de NPC, ambientación, efectos
5. **Publicidad** - Anuncios con voz, música y SFX
6. **Video corto** - Narración, transiciones, música
7. **Educación** - E-learning con ambientación
8. **Meditación** - Guías con ambiente relajante
9. **Cine/Animación** - Previsualización de audio

## Tecnología detrás

Seed Audio 1.0 se construye sobre:

- **Seed-TTS** (2024) - Generación de voz de alta calidad
- **Seed-Music** - Generación musical controlada
- **Seedance 2.0** - Generación unificada de audio-video
- **Seed Speech 2** - Serie de voz multilingüe y emocional

## Acceso actual

- **Volcano Engine Ark** - API oficial (acceso por invitación)
- **fal.ai** - API de terceros ($0.075/minuto)
- **Volcano Ark Experience Center** - 30 minutos de prueba gratuita
- **Productos ByteDance** - CapCut, Jimeng, Fanqie (próximamente)

## Referencia

- [ByteDance Seed Models](https://seed.bytedance.com/en/models)
- [Volcano Engine Ark Platform](https://console.volcengine.com/ark/)
- [fal.ai API](https://fal.ai/models/bytedance/seed-audio-1.0)
