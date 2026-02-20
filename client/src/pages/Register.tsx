import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { register as registerUser } from '../services/auth'
import { useAuthStore } from '../stores/authStore'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'

interface FormData {
  username: string
  email: string
  password: string
}

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: storeLogin } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: FormData) => {
    setError('')
    setLoading(true)
    try {
      const response = await registerUser(data)
      storeLogin(response)
      navigate('/characters')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create Account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          error={errors.username?.message}
          {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 characters' } })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">Register</Button>
      </form>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Already have an account? <Link to="/login" className="text-red-600 hover:underline">Login</Link>
      </p>
    </main>
  )
}
