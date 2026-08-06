'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [groups, setGroups] = useState([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [newPrivacy, setNewPrivacy] = useState('private')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setUsername(localStorage.getItem('username') || 'User')
      setIsAuthenticated(true)
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
      fetchGroups()
    }
  }, [isAuthenticated])

  async function fetchEvents() {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError('Failed to fetch events.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchGroups() {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch('/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (err) {
      console.error('Failed to fetch groups')
    }
  }

  function resetFormFields() {
    setEditingEventId(null)
    setShowForm(false)
    setNewTitle('')
    setNewStartTime('')
    setNewEndTime('')
    setNewPrivacy('private')
  }

  function getCalendarDays() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    return days
  }

  function getEventsForDate(date) {
    if (!date) return []
    return events.filter(event => {
      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      return eventStart < dayEnd && eventEnd > dayStart
    })
  }

  function getGroupColor(groupId) {
    if (!groupId) return '#6B7280'  // gray for personal events
    const group = groups.find(g => g.id === groupId)
    return group?.color || '#3B82F6'
  }

  async function createEvent(e) {
    if (e) e.preventDefault()
    setError('')
    if (new Date(newEndTime) <= new Date(newStartTime)) {
      setError('End time must be after start time')
      return
    }
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, startTime: newStartTime, endTime: newEndTime, privacy: newPrivacy })
      })
      const data = await response.json()
      if (!response.ok) { setError(data.message || 'Failed to create event'); return }
      await fetchEvents()
      resetFormFields()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return
    setError('')
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to delete event'); return }
      await fetchEvents()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  function startEdit(event) {
    setEditingEventId(event.id)
    setNewTitle(event.title)
    if (event.startTime) setNewStartTime(new Date(event.startTime).toISOString().slice(0, 16))
    if (event.endTime) setNewEndTime(new Date(event.endTime).toISOString().slice(0, 16))
    setNewPrivacy(event.privacy)
    setShowForm(true)
  }

  async function updateEvent(e) {
    if (e) e.preventDefault()
    setError('')
    if (new Date(newEndTime) <= new Date(newStartTime)) {
      setError('End time must be after start time')
      return
    }
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/events/${editingEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, startTime: newStartTime, endTime: newEndTime, privacy: newPrivacy })
      })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Failed to update event'); return }
      await fetchEvents()
      resetFormFields()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome, {username}! 👋</h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* ── Calendar ── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">

          {/* Month navigation */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="text-gray-600 hover:text-blue-500 font-bold text-xl px-2"
            >←</button>
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="text-gray-600 hover:text-blue-500 font-bold text-xl px-2"
            >→</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((date, index) => {
              const dayEvents = date ? getEventsForDate(date) : []
              const isToday = date && new Date().toDateString() === date.toDateString()
              const isSelected = selectedDate && date && selectedDate.toDateString() === date.toDateString()

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (date) {
                      setSelectedDate(date)
                      const dateStr = date.toISOString().slice(0, 10)
                      setNewStartTime(`${dateStr}T09:00`)
                      setNewEndTime(`${dateStr}T10:00`)
                      setShowForm(true)
                      setEditingEventId(null)
                    }
                  }}
                  className={`min-h-16 p-1 rounded cursor-pointer border transition
                    ${!date ? 'bg-transparent border-transparent cursor-default' : ''}
                    ${isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-100 hover:bg-gray-50'}
                    ${isSelected ? 'ring-2 ring-blue-400' : ''}
                  `}
                >
                  {date && (
                    <>
                      <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {date.getDate()}
                      </p>
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); startEdit(event) }}
                          className="text-xs text-white rounded px-1 py-0.5 mb-0.5 truncate cursor-pointer"
                          style={{ backgroundColor: getGroupColor(event.groupId) }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Events list ── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Events</h2>

          {events.length === 0 && !loading && (
            <p className="text-gray-400">No events yet!</p>
          )}

          {events.map(event => (
            <div key={event.id} className="border-b border-gray-200 py-4 last:border-0 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-gray-500 text-sm">Start: {new Date(event.startTime).toLocaleString()}</p>
                <p className="text-gray-500 text-sm">End: {new Date(event.endTime).toLocaleString()}</p>
                <span
                  className="text-xs text-white px-2 py-1 rounded mt-1 inline-block"
                  style={{ backgroundColor: getGroupColor(event.groupId) }}
                >
                  {event.groupId ? 'group' : event.privacy}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(event)} className="text-blue-500 hover:text-blue-700 font-medium text-sm p-2">Edit</button>
                <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700 font-medium text-sm p-2">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Create Event button ── */}
        <button
          onClick={() => { if (showForm) resetFormFields(); else setShowForm(true) }}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition mb-6"
        >
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>

        {/* ── Create / Edit form ── */}
        {showForm && (
          <form onSubmit={editingEventId ? updateEvent : createEvent} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingEventId ? 'Edit Event' : 'New Event'}</h2>

            <input type="text" placeholder="Event title" required value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500" />

            <input type="datetime-local" required value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500" />

            <input type="datetime-local" required value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500" />

            <select value={newPrivacy} onChange={(e) => setNewPrivacy(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500">
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="group">Group</option>
            </select>

            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
              {editingEventId ? 'Save Changes' : 'Create Event'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}