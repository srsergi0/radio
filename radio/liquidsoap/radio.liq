# Radio Bloom - Liquidsoap Configuration

# Telnet control
settings.server.telnet := true
settings.server.telnet.port := 1234
settings.server.telnet.bind_addr := "0.0.0.0"

# Request queue as primary source
queue = request.queue(id="queue")

# Make infallible (silence when queue is empty)
main = mksafe(queue)

# Output via HTTP (harbor) on port 8000
output.harbor(
  %mp3(bitrate=320, samplerate=44100, stereo=true),
  port=8000,
  mount="radiobloom.mp3",
  main
)
