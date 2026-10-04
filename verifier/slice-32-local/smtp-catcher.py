"""Tiny local SMTP sink for the Slice 32 smoke. Stores each mail as JSON
(to, subject, links) in the directory given as argv[2]. Local testing only."""
import email, email.policy, json, os, re, socketserver, sys, time

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 54325
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/s32/mail'
os.makedirs(OUT, exist_ok=True)


class Handler(socketserver.StreamRequestHandler):
    def handle(self):
        def w(s):
            self.wfile.write((s + '\r\n').encode())
        w('220 local-smtp ready')
        data_mode, lines, rcpt = False, [], []
        while True:
            raw = self.rfile.readline()
            if not raw:
                break
            s = raw.decode('utf-8', 'replace').rstrip('\r\n')
            if data_mode:
                if s == '.':
                    self.save(rcpt, '\r\n'.join(lines))
                    w('250 OK queued')
                    data_mode, lines = False, []
                    continue
                lines.append(s[1:] if s.startswith('..') else s)
                continue
            cmd = s.upper()
            if cmd.startswith('EHLO'):
                w('250-local-smtp')
                w('250 8BITMIME')
            elif cmd.startswith('HELO'):
                w('250 local-smtp')
            elif cmd.startswith('MAIL FROM'):
                rcpt = []
                w('250 OK')
            elif cmd.startswith('RCPT TO'):
                rcpt.append(s.split(':', 1)[1].strip().strip('<>'))
                w('250 OK')
            elif cmd == 'DATA':
                w('354 End data with <CR><LF>.<CR><LF>')
                data_mode = True
            elif cmd == 'QUIT':
                w('221 Bye')
                break
            elif cmd in ('RSET', 'NOOP'):
                w('250 OK')
            else:
                w('502 Command not implemented')

    def save(self, rcpt, raw):
        msg = email.message_from_string(raw, policy=email.policy.default)
        body = ''
        for part in msg.walk():
            if part.get_content_type() in ('text/html', 'text/plain'):
                try:
                    body += part.get_content()
                except Exception:
                    pass
        links = sorted(set(m.replace('&amp;', '&') for m in re.findall(r'https?://[^\s"\'<>]+', body)))
        name = f"{time.time():.6f}-{(rcpt or ['x'])[0].replace('@', '_at_')}.json"
        with open(os.path.join(OUT, name), 'w') as f:
            json.dump({'to': rcpt, 'subject': str(msg.get('subject', '')), 'links': links, 'body': body}, f)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    with Server(('127.0.0.1', PORT), Handler) as srv:
        srv.serve_forever()
