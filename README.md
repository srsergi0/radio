# Seed Audio 1.0 - Documentación Completa de Prompts

> Guía definitiva para escribir prompts efectivos en ByteDance Seed Audio 1.0

## Tabla de contenidos

| # | Archivo | Descripción |
|---|---------|-------------|
| 01 | [Qué es Seed Audio](01-QUE-ES-SEED-AUDIO.md) | Descripción general, capacidades y arquitectura del modelo |
| 02 | [Estructura de Prompts](02-ESTRUCTURA-PROMPTS.md) | Fórmula de 4 bloques y estructura óptima |
| 03 | [Ejemplos por Caso de Uso](03-EJEMPLOS-POR-CASO.md) | Podcast, radio drama, audiolibro, ads, games, meditación |
| 04 | [Técnicas Avanzadas](04-TECNICAS-AVANZADAS.md) | Timing, capas de mezcla, emotions, pacing, BGM |
| 05 | [Referencia de Audio e Imagen](05-REFERENCIA-AUDIO-IMAGEN.md) | Uso de @Audio1-3 e image_url |
| 06 | [API y Parámetros](06-API-PARAMETROS.md) | Documentación técnica, esquema, voces disponibles |
| 07 | [Errores Comunes](07-ERRORES-COMUNES.md) | Los 10 errores más frecuentes y cómo evitarlos |
| 08 | [Limitaciones](08-LIMITACIONES.md) | Limitaciones actuales del modelo v1.0 |
| 09 | [Plantillas para Copiar](09-PLANTILLAS-COPIAR.md) | Templates listos para copiar y pegar |

## Resumen rápido

Seed Audio 1.0 **no es un TTS convencional**. Es un modelo de **generación de audio completo por escena** que produce en una sola pasada:

- Voz/dialogo con emociones y expresiones
- Música de fondo original
- Efectos de sonido (Foley)
- Ambiente/sonido ambiental
- Hasta **2 minutos** de audio continuo
- Hasta **3 voces de referencia** simultáneas

## Fórmula mágica (resumen)

```
[Formato] + [Personajes + Emoción] + [Diálogo] + [Ambiente] + [Música] + [SFX] + [Reglas de mezcla]
```

## Fuentes oficiales

- [Volcano Engine Ark](https://console.volcengine.com/ark/) - API oficial
- [fal.ai - Seed Audio 1.0](https://fal.ai/models/bytedance/seed-audio-1.0) - API de terceros
- [seedaudio.design](https://seedaudio.design/) - Guía del producto
- [seed.bytedance.com](https://seed.bytedance.com/en/models) - Modelos Seed
