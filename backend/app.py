from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# DB Setup
def init_db():
    conn = sqlite3.connect('events.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        time TEXT,
        description TEXT
    )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/events', methods=['GET'])
def get_events():
    conn = sqlite3.connect('events.db')
    c = conn.cursor()
    c.execute('SELECT * FROM events')
    events = [dict(id=row[0], title=row[1], date=row[2], time=row[3], description=row[4]) for row in c.fetchall()]
    conn.close()
    return jsonify(events)

@app.route('/events', methods=['POST'])
def add_event():
    data = request.get_json()
    conn = sqlite3.connect('events.db')
    c = conn.cursor()
    c.execute('INSERT INTO events (title, date, time, description) VALUES (?, ?, ?, ?)',
              (data['title'], data['date'], data['time'], data['description']))
    conn.commit()
    conn.close()
    return jsonify({"message": "Event added successfully"}), 201

@app.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.get_json()
    conn = sqlite3.connect('events.db')
    c = conn.cursor()
    c.execute('''
        UPDATE events
        SET title = ?, date = ?, time = ?, description = ?
        WHERE id = ?
    ''', (data['title'], data['date'], data['time'], data['description'], event_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Event updated"})


@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    conn = sqlite3.connect('events.db')
    c = conn.cursor()
    c.execute('DELETE FROM events WHERE id = ?', (event_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Event deleted"})

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # default to 5000 for local dev
    app.run(host='0.0.0.0', port=port)

