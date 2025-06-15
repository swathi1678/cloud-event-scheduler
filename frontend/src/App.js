import React, { useState, useEffect } from 'react';


function App() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });

  useEffect(() => {
    fetch('https://cloud-event-scheduler.onrender.com/events')
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    fetch('https://cloud-event-scheduler.onrender.com/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(() => {
        setForm({ title: '', date: '', time: '', description: '' });
        window.location.reload();
      });
  };

  const handleDelete = (id) => {
    fetch(`https://cloud-event-scheduler.onrender.com/events/${id}`, {
      method: 'DELETE'
    }).then(() => window.location.reload());
  };

  return (
    <div className="App">
      <h1>📆 Cloud Event Scheduler</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input type="time" name="time" value={form.time} onChange={handleChange} required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <button type="submit">Add Event</button>
      </form>

      <ul className="event-list">
        {events.map(event => (
          <li key={event.id}>
            <h3>{event.title}</h3>
            <p>{event.date} at {event.time}</p>
            <p>{event.description}</p>
            <button onClick={() => handleDelete(event.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
