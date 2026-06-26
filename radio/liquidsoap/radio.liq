# Radio Bloom - Liquidsoap Configuration

# Telnet control
settings.server.telnet := true
settings.server.telnet.port := 1234
settings.server.telnet.bind_addr := "0.0.0.0"

# Main playlist (randomized background music)
music = playlist(
  mode="randomize",
  reload=30,
  "/music/songs/"
)

# Crossfade between tracks (3 seconds)
radio = crossfade(duration=3.0, music)
radio = mksafe(radio)

# Request queue for on-demand tracks (via telnet "queue.push")
queue = request.queue(id="queue")

# Fallback: queued tracks play first, then regular playlist
main = fallback(track_sensitive=true, [queue, radio])

# Output via HTTP (harbor) on port 8000
output.harbor(
  %mp3(bitrate=320, samplerate=44100, stereo=true),
  port=8000,
  mount="radiobloom.mp3",
  main
)
