'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [newPrivacy, setNewPrivacy] = useState('private')
  const [events, setEvents] = useState([])

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token) {
        router.push('/login')
        return
    } 
    fetchGroupDetail() 
    fetchGroupEvents()
    },[])

  async function fetchGroupDetail() {
    const token = localStorage.getItem('token')
    try {
        const response = await fetch (`/api/groups/${groupId}`,{
            headers:{Authorization:`Bearer ${token}`}
        })
        const data = await response.json()
        if (!response.ok) {
            setError('Failed to load group')
            return
        }
        setGroup(data.group)
    } catch (err) {setError('Something went wrong')}
    finally {
    setLoading(false)
  }
}

  async function fetchGroupEvents() {
    const token = localStorage.getItem('token')
    try{
      const response = await fetch (`/api/groups/${groupId}/events`,{
        headers:{Authorization:`Bearer ${token}`}
      })
      const data = await response.json()
      if (response.ok) setEvents(data.events || [])
    } catch (err) {
      setError('Failed to fetch events')
    }
  }


  async function createGroupEvent(e) {
  if (e) e.preventDefault()
  setError('')

  if (new Date(newEndTime) <= new Date(newStartTime)) {
    setError('End time must be after start time')
    return
  }

  const token = localStorage.getItem('token')

  try {
    const response = await fetch(`/api/groups/${groupId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
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
      setError(data.message || data.error || 'Failed to create event')
      return
    }

    await fetchGroupDetail()
    setShowForm(false)
    setNewTitle('')
    setNewStartTime('')
    setNewEndTime('')
    setNewPrivacy('private')

  } catch (err) {
    setError('Something went wrong. Please try again.')
  }
}



  return (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-2xl mx-auto">
    <button
      onClick={() => router.push('/groups')}
      className="text-blue-500 hover:underline mb-4 inline-block"
    >
      ← Back to Groups
    </button>
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {group && (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded mt-1 inline-block">
            {group.privacy}
            </span>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">Members</h2>

            {(() => {
              const isMember = group.members?.some(
                m => m.userId === parseInt(localStorage.getItem('userId'))
              )
              const canSeeMembers = group.privacy === 'public' || isMember

              if (!canSeeMembers) {
                return <p className="text-gray-400">This is a private group.</p>
              }

              return group.members?.map(m => (
                <div key={m.id} className="py-2 border-b border-gray-100 last:border-0">
                  <p className="text-gray-700">👤 {m.user.username}</p>
                </div>
              ))
            })()}
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition mt-6"
            >
              {showForm ? 'Cancel' : '+ Create Group Event'}
            </button>

            {showForm && (
              <form onSubmit={createGroupEvent} className="mt-4">
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

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                  Create Event
                </button>
              </form> 
            )}
        </div>
      )}

    </div>
  </div>
)
}