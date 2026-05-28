'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
      return
    }

    const storedUsername = localStorage.getItem('username')
    setUsername(storedUsername)
    fetchEvents()
  }, [])         

  async function fetchEvents() {
    const token = localStorage.getItem('token')

    const response = await fetch('/api/events',{
        method:'GET',
        headers:{Authorization:'Bearer ${token}'},
        })

    const data = await response.json()
    setEvents(data.events)
    setLoading(false)
  }

  return (
    <div>
      <h1>Welcome , {username} </h1>
      {loading && <p>Loading...</p>}
      {events.map(event=>(
        <div key={event.id}>
            <h3>{event.title}</h3>
            <p>{event.startTime}</p>
            <p>{event.endTime}</p>
        </div>
      ))}
    </div>
  )
}               