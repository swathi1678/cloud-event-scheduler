import React, { useState, useEffect } from 'react';
import './dummy.css';
import confetti from 'canvas-confetti';

function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState([]);

  useEffect(() => {
    fetch('https://cloud-event-scheduler.onrender.com/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        requestNotificationPermission();
      });

    const interval = setInterval(() => {
      checkForReminders();
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, [events]);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
        }
      });
    }
  };

  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png', // optional icon
      });
    }
  };

  const checkForReminders = () => {
    const now = new Date();
    events.forEach(event => {
      const eventTime = new Date(`${event.date}T${event.time}`);
      const diff = eventTime.getTime() - now.getTime();

      if (diff > 0 && diff <= 60000) {
        showNotification(`Reminder: ${event.title}`, `Starts at ${event.time}`);
      }
    });
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();

    const url = editId
      ? `https://cloud-event-scheduler.onrender.com/events/${editId}`
      : 'https://cloud-event-scheduler.onrender.com/events';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
        setForm({ title: '', date: '', time: '', description: '' });
        setEditId(null);
        window.location.reload(); // reload to fetch updated events
      });
  };

  const handleDelete = id => {
    fetch(`https://cloud-event-scheduler.onrender.com/events/${id}`, {
      method: 'DELETE',
    }).then(() => window.location.reload());
  };

  const handleEdit = event => {
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
    });
    setEditId(event.id);
  };

  return (
    <div className="App">
      <h1>📆 Cloud Event Scheduler</h1>

      <form onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input type="time" name="time" value={form.time} onChange={handleChange} required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <button type="submit">{editId ? 'Update Event' : 'Add Event'}</button>
      </form>

      <input
        type="text"
        placeholder="🔍 Search by title or description..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          padding: '10px',
          width: '80%',
          marginTop: '30px',
          marginBottom: '20px',
          fontSize: '16px',
        }}
      />

      <ul className="event-list">
        {events
          .filter(event =>
            event.title.toLowerCase().includes(search.toLowerCase()) ||
            event.description.toLowerCase().includes(search.toLowerCase())
          )
          .map(event => (
            <li key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.date} at {event.time}</p>
              <p>{event.description}</p>
              <button style={{ marginRight: '50px' }} onClick={() => handleEdit(event)}>Edit</button>
              <button onClick={() => handleDelete(event.id)}>Delete</button>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
