'use client'

import { useState } from 'react' // react way of tsoring values that can change 
import { useRouter } from 'next/navigation' // direct to new page after login

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password,setPassword] = useState('')
    const [error,setError] = useState('')

    async function handleLogin() {
        setError('')

        const response = await fetch('/api/login',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body : JSON.stringify({username,password})
        })

        const data = await response.json()

        if(!response.ok) {
            setError(data.message || 'Login Failed')
            return
        }

        localStorage.setItem('token',data.token)
        localStorage.setItem('userId',data.userId)
        localStorage.setItem('username',data.username)

        router.push('/dashboard')
    }

    return (
        <div>
            <h1>Login</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)}
        />

        <input
            type="password"
            placeholder="Password"
            value = {password}
            onChange = {(e)=>setPassword(e.target.value)} />

        {error && <p>{error}</p>}
        <button onClick={handleLogin}>Login</button>

        </div>
    )
}