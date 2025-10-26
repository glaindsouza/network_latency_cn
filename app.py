from flask import Flask, render_template, request, jsonify
import subprocess, platform, time
from collections import deque

app = Flask(__name__)

# Store last 10 pings
ping_history = deque(maxlen=10)

def ping_host(host):
    try:
        param = '-n' if platform.system().lower() == 'windows' else '-c'
        output = subprocess.check_output(["ping", param, "1", host], universal_newlines=True)
        start = output.find("time=")
        if start != -1:
            end = output.find("ms", start)
            rtt = float(output[start+5:end].strip())
            return rtt
        else:
            return None
    except:
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ping', methods=['POST'])
def ping():
    host = request.json.get('host')
    rtt = ping_host(host)
    timestamp = time.strftime("%H:%M:%S")
    ping_history.append({'time': timestamp, 'host': host, 'rtt': rtt})
    if rtt is not None:
        return jsonify({'rtt': rtt, 'history': list(ping_history)})
    else:
        return jsonify({'error': 'Ping failed', 'history': list(ping_history)}), 400

if __name__ == '__main__':
    app.run(debug=True)
