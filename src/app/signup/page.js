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
        <div>
            <h1>SignUp</h1>
            
            <input type="text" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)}
        />
        <input type="email" placeholder="email" value={email} onChange = {(e)=>setEmail(e.target.value)} />

        <input
            type="password"
            placeholder="Password"
            value = {password}
            onChange = {(e)=>setPassword(e.target.value)} />

        {error && <p>{error}</p>}

        <button onClick={handleSignup}>Sign Up</button>
        </div>
    )
}