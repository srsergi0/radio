# 08 - Limitaciones

> Limitaciones actuales del modelo v1.0 y areas de mejora

## Limitaciones técnicas

### 1. Duración máxima
- **~2 minutos** por generación
- La continuación (continuation) puede extender más material
- Para contenido largo, generar en segmentos

### 2. Número de referencias de audio
- **Máximo 3 clips** de referencia (`@Audio1`, `@Audio2`, `@Audio3`)
- Cada clip: **máximo 30 segundos**, 10 MB
- No combinar con imagen de referencia

### 3. Imagen de referencia
- **1 sola imagen** por generación
- No combinar con audio de referencia
- La imagen afecta lip sync, no directamente el timbre de voz

### 4. Capas de audio simultáneas
- **Máximo 3-4 capas** con buena calidad
- Más de 3 capas → el audio se vuelve empañado
- Capas: voz, música, SFX, ambiente

---

## Limitaciones de calidad

### 1. Lip sync por idioma
| Idioma | Calidad de lip sync |
|--------|-------------------|
| Mandarín | ⭐⭐⭐⭐⭐ Excelente |
| Inglés | ⭐⭐⭐⭐ Muy bueno |
| Japonés | ⭐⭐⭐ Bueno (drift en frases largas) |
| Coreano | ⭐⭐⭐ Bueno (similar al japonés) |
| Español | ⭐⭐⭐ Aceptable |
| Otros | ⭐⭐ Variable |

### 2. Estabilidad de canto
- El canto melódico con letras **no es confiable** todavía
- Humming / melodia vocal funciona parcialmente
- Para cantar, usar modelos especializados

### 3. Consistencia a largo plazo
- La voz puede **drift** (cambiar ligeramente) en clips largos
- Mejor en mandarín e inglés
- Usar referencia de audio para mantener consistencia

### 4. Artefactos sintéticos
- Puede haber **artifacts electrónicos** en algunos casos
- Timbre metálico ocasional
- Pausas antinaturales en raras ocasiones

---

## Limitaciones de la API

### 1. Acceso
- **Volcano Engine**: acceso por invitación
- **fal.ai**: requiere API key y saldo
- No hay acceso gratuito ilimitado

### 2. Formatos de referencia
- WAV y FLAC **pueden fallar silenciosamente**
- MP3 es el formato más confiable
- AAC también puede fallar

### 3. Control limitado
- No hay control fino de **ecualización** individual
- No hay separación de stems (voz/piano/batería por separado)
- No hay control de **paneo** estéreo por capa

### 4. Edición post-generación
- El audio sale **mezclado** en un solo archivo
- No se pueden editar capas por separado sin regenerar
- Para edición profesional, regenerar cada capa por separado

---

## Limitaciones creativas

### 1. Control de timing
- No hay control **frame-precise** de cuándo ocurre cada sonido
- Los timestamps son una guía, no una restricción exacta
- Para sincronización perfecta, usar edición manual

### 2. Expresiones faciales con lip sync
- Movimientos de cabeza compiten con lip sync
- Solo funcionan bien: **rostro frontal, cámara estática**
- Perfiles y ángulos extremos dan resultados pobres

### 3. Múltiples hablantes hablando al mismo tiempo
- El modelo maneja **diálogos alternados** bien
- **Habla simultánea** (overlapping) es limitada
- Para overlapping, generar por separado y mezclar

### 4. Géneros musicales específicos
- Funciona mejor con **mood descriptors** que con géneros específicos
- Sub-géneros muy nichos pueden no reconocerse
- Resultados más consistentes con géneros populares

---

## Lo que SÍ funciona bien

✅ **Diálogo corto** con 1-2 personajes
✅ **Narración** con ambiente y música
✅ **Efectos de sonido** contextuales
✅ **Ambiente** y room tone
✅ **Música de fondo** por mood/género
✅ **Lip sync** en mandarín e inglés (corto)
✅ **Consistencia de voz** en clips cortos (<1 min)
✅ **Transiciones** con SFX

---

## Lo que NO funciona bien (todavía)

❌ **Canto** con letras y melodía precisa
❌ **Habla simultánea** de múltiples personajes
❌ **Control frame-precise** de timing
❌ **Separación de stems** post-generación
❌ **Lip sync** en ángulos de perfil
❌ **Frases largas** (>8 segundos) con lip sync
❌ **Géneros musicales** muy nichos o específicos
❌ **Consistencia perfecta** en clips >2 minutos

---

## Recomendaciones de uso

### Para contenido profesional
1. Generar en **segmentos cortos** (<1 min)
2. Usar **referencia de audio** para consistencia
3. **Mezclar manualmente** si se necesita control fino
4. Revisar **artifacts** antes de publicar
5. Tener **plan B** (grabación humana) para contenido crítico

### Para prototipos y drafts
1. Generar clips completos de **30-60 segundos**
2. Experimentar con diferentes prompts
3. Usar como **base** para edición posterior
4. No depender 100% del output para producción final

---

## Evolución esperada

Según el roadmap de ByteDance:
- Mayor duración por generación
- Mejor lip sync multilingüe
- Control más fino de timing
- Separación de stems
- Más voces preestablecidas
- Integración con CapCut, Jimeng, Fanqie
