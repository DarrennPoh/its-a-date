'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrivacy, setNewPrivacy] = useState('private')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [newMemberUsername, setNewMemberUsername] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newColor, setNewColor] = useState('#3B82F6')  // default blue

  // ── Auth check ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setUsername(localStorage.getItem('username') || 'User')
      setIsAuthenticated(true)
    }
  }, [router])

  // ── Fetch groups once authenticated ─────────────────────
  useEffect(() => {
    if (isAuthenticated) fetchGroups()
  }, [isAuthenticated])

  // ── fetchGroups ──────────────────────────────────────────
  async function fetchGroups() {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch('/api/groups', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (err) {
      setError('Failed to obtain groups')
    } finally {
      setLoading(false)
    }
  }

  // ── fetchGroupDetails ────────────────────────────────────
  async function fetchGroupDetails(groupId) {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (response.ok) setSelectedGroup(data.group)
  }

  // ── createGroups ─────────────────────────────────────────
  async function createGroups(e) {
    if (e) e.preventDefault()
    setError('')
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, privacy: newPrivacy, color: newColor })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Failed to create group')
        return
      }
      await fetchGroups()
      setShowForm(false)
      setNewName('')
      setNewPrivacy('private')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  // ── addMember ────────────────────────────────────────────
  async function addMember(groupId) {
    setError('')
    const token = localStorage.getItem('token')

    if (newMemberUsername === username) {
      setError("You're already in this group!")
      return
    }

    try {
      const userResponse = await fetch(`/api/users/search?username=${newMemberUsername}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userData = await userResponse.json()

      if (!userResponse.ok) {
        setError('User not found')
        return
      }

      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userData.user.id })
      })

      if (response.ok) {
        setNewMemberUsername('')
        setSelectedGroupId(null)
        alert(`${newMemberUsername} added successfully!`)
      } else {
        setError('Failed to add member')
      }
    } catch (err) {
      setError('Something went wrong')
    }
  }

  // ── JSX ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Groups 👥</h1>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* ── Groups list ── */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Groups</h2>

          {groups.length === 0 && !loading && (
            <p className="text-gray-400">No groups yet!</p>
          )}

          {groups.map(group => (
            <div key={group.id} className="border-b border-gray-200 py-4 last:border-0">
              <Link href={`/groups/${group.id}`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color || '#3B82F6' }}
                />
                <h3 className="font-semibold text-lg text-blue-600 hover:underline cursor-pointer">
                  {group.name}
                </h3>
              </div>
             </Link>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded mt-1 inline-block">
                {group.privacy}
              </span>

              <button
                onClick={() => fetchGroupDetails(group.id)}
                className="text-blue-500 text-sm hover:underline ml-4"
              >
                View Members
              </button>

              {/* Add member section */}
              <div className="mt-3">
                {selectedGroupId === group.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm flex-1 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => addMember(group.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setSelectedGroupId(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedGroupId(group.id)}
                    className="text-blue-500 text-sm hover:underline"
                  >
                    + Add Member
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Selected group members panel ── */}
        {/* This appears BELOW the groups list, not inside each group card */}
        {selectedGroup && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{selectedGroup.name} — Members</h2>

            {(() => {
              const isMember = selectedGroup.members?.some(
                m => m.userId === parseInt(localStorage.getItem('userId'))
              )
              const canSeeMembers = selectedGroup.privacy === 'public' || isMember

              if (!canSeeMembers) {
                return <p className="text-gray-400">This is a private group.</p>
              }

              return selectedGroup.members?.map(m => (
                <div key={m.id} className="py-2 border-b border-gray-100 last:border-0">
                  <p className="text-gray-700">👤 {m.user.username}</p>
                </div>
              ))
            })()}

            <button
              onClick={() => setSelectedGroup(null)}
              className="text-gray-400 text-sm hover:underline mt-4 block"
            >
              Close
            </button>
          </div>
        )}

        {/* ── Create group button ── */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition mb-6"
        >
          {showForm ? 'Cancel' : '+ Create Group'}
        </button>

        {/* ── Create group form ── */}
        {showForm && (
          <form onSubmit={createGroups} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">New Group</h2>

            <input
              type="text"
              placeholder="Group name"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />

            <select
              value={newPrivacy}
              onChange={(e) => setNewPrivacy(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Colour
            </label>
            <div className="flex gap-2 flex-wrap">
              {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition ${newColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              Create Group
            </button>
          </form>
        )}
      </div>
    </div>
  )
}