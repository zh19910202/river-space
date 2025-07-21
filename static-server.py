#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8888
DIRECTORY = "/Users/snow/resume"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Static server running at:")
        print(f"   ➜ Local:   http://localhost:{PORT}/")
        print(f"   ➜ Blog:    http://localhost:{PORT}/blog.html")
        print(f"   ➜ Directory: {DIRECTORY}")
        print(f"\nPress Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")
            sys.exit(0)