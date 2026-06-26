# Radio Bloom - Liquidsoap Configuration

settings.server.telnet := true
settings.server.telnet.port := 1234
settings.server.telnet.bind_addr := "0.0.0.0"

# Queue as the sole playback source
# Publisher fills it from the database
queue = request.queue(id="queue")
main = mksafe(queue)

output.harbor(
  %mp3(bitrate=320, samplerate=44100, stereo=true),
  port=8000,
  mount="radiobloom.mp3",
  main
)
