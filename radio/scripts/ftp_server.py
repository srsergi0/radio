import argparse
import logging
import os
from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import FTPServer

def start_ftp(directory, user, password, port, passive_ports, host):
    directory = os.path.abspath(directory)
    if not os.path.isdir(directory):
        print(f"Error: directory '{directory}' does not exist")
        return

    authorizer = DummyAuthorizer()
    authorizer.add_user(user, password, directory, perm="elradfmw")

    handler = FTPHandler
    handler.authorizer = authorizer
    handler.masquerade_address = host if host != "0.0.0.0" else None

    if passive_ports:
        start, end = map(int, passive_ports.split("-"))
        handler.passive_ports = range(start, end + 1)

    server = FTPServer((host, port), handler)
    print(f"FTP server running on ftp://{host}:{port}")
    print(f"  User: {user}")
    print(f"  Directory: {directory}")
    print("Press Ctrl+C to stop")
    server.serve_forever()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simple FTP server for SEED-AUDIO music")
    parser.add_argument("--dir", default=None, help="Directory to serve")
    parser.add_argument("--user", default="seed", help="Username")
    parser.add_argument("--password", default="seed123", help="Password")
    parser.add_argument("--port", type=int, default=2121, help="FTP port")
    parser.add_argument("--passive", default="3000-3009", help="Passive ports range (e.g. 3000-3009)")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")

    args = parser.parse_args()

    music_dir = args.dir or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "music")
    start_ftp(music_dir, args.user, args.password, args.port, args.passive, args.host)
