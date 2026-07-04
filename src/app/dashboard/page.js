'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  
  // 1. All states defined safely at the top scope
  const [events, setEvents] = useState([])
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

  // 2. Auth checking hook
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      const storedUsername = localStorage.getItem('username')
      setUsername(storedUsername || 'User')
      setIsAuthenticated(true)
    }
  }, [router])       

  // 3. Data fetching hook
  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
  }, [isAuthenticated])

  // 4. Fetch Events Handler
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

  // Helper utility to clear fields and close the form safely
  function resetFormFields() {
    setEditingEventId(null)
    setShowForm(false)
    setNewTitle('')
    setNewStartTime('')
    setNewEndTime('')
    setNewPrivacy('private')
  }

  // 5. Create Event Handler
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          startTime: newStartTime,
          endTime: newEndTime,
          privacy: newPrivacy
        })
      }) 

      const data = await response.json()

      if (!response.ok) {
        console.error('BACKEND EVENT CREATION FAILURE:', data)
        setError(data.message || 'Failed to create event')
        return
      }

      await fetchEvents()
      resetFormFields()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  // 6. Delete Event Handler
  async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return
    setError('')

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.message || 'Failed to delete event')
        return
      }

      await fetchEvents()  
    } catch(err) {
      setError('Something went wrong. Please try again.')
    }
  }

  // 7. Triggered when clicking "Edit" on an event card
  function startEdit(event) {
    setEditingEventId(event.id)
    setNewTitle(event.title)
    // Convert dates back to local input format YYYY-MM-DDTHH:MM safely
    if (event.startTime) setNewStartTime(new Date(event.startTime).toISOString().slice(0, 16))
    if (event.endTime) setNewEndTime(new Date(event.endTime).toISOString().slice(0, 16))
    setNewPrivacy(event.privacy)
    setShowForm(true)
  }

  // 8. Triggered when submitting the form while in edit mode
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          startTime: newStartTime,
          endTime: newEndTime,
          privacy: newPrivacy
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.message || 'Failed to update event')
        return
      }

      await fetchEvents()
      resetFormFields()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  // 9. Render JSX
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome, {username}! 👋</h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Events</h2>

          {events.length === 0 && !loading && (
            <p className="text-gray-400">No events yet!</p>
          )}

          {events.map(event => (
            <div key={event.id} className="border-b border-gray-200 py-4 last:border-0 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-gray-500 text-sm">
                  Start: {new Date(event.startTime).toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm">
                  End: {new Date(event.endTime).toLocaleString()}
                </p>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded mt-1 inline-block">
                  {event.privacy}
                </span>
              </div>

              {/* Controls wrapper */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(event)}
                  className="text-blue-500 hover:text-blue-700 font-medium text-sm p-2 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="text-red-500 hover:text-red-700 font-medium text-sm p-2 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (showForm) resetFormFields()
            else setShowForm(true)
          }}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition mb-6"
        >
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>

        {showForm && (
          /* FIX 1: Form now switches submission routes dynamically based on mode */
          <form onSubmit={editingEventId ? updateEvent : createEvent} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingEventId ? 'Edit Event' : 'New Event'} 
            </h2>

            <input
              type="text"
              placeholder="Event title"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />

            <input
              type="datetime-local"
              required
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />

            <input
              type="datetime-local"
              required
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />

            <select
              value={newPrivacy}
              onChange={(e) => setNewPrivacy(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="group">Group</option>
            </select>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {/* FIX 2: Button label dynamically switches text representation */}
              {editingEventId ? 'Save Changes' : 'Create Event'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}