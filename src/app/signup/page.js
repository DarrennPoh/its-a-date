'use client'

import { useState } from 'react' // react way of tsoring values that can change 
import { useRouter } from 'next/navigation' // direct to new page after login

export default function SignUpPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password,setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [error,setError] = useState('')

    return (
        <div>
            <h1>SignUp</h1>
        </div>
    )
}