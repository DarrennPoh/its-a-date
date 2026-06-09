'use client'

import { useState } from 'react' // react way of tsoring values that can change 
import { useRouter } from 'next/navigation' // direct to new page after login

export default function SignUpPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password,setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [error,setError] = useState('')


    async function handleSignup() {
        setError('')

        const response = await fetch('/api/signup',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body :JSON.stringify({username,password,email})
        })

        const data = await response.json()
        if (!response.ok) {
            setError(data.error || 'Signup failed')
            return 
        }

        router.push('/login')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">ItsADate 📅</h1>
            
        <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
      />
        <input 
        type="email" 
        placeholder="email" 
        value={email} 
        onChange = {(e)=>setEmail(e.target.value)} 
        className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"/>

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button onClick={handleSignup}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">Sign Up</button>

        <p className="text-center mt-4 text-sm">
        Have an account?{' '}
        <a href="/login" className="text-blue-500 hover:underline">Login here</a>
      </p>
        </div>
        </div>
    )
}