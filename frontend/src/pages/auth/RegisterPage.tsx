import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import styles from './Auth.module.css'

const schema = z.object({
  email:    z.string().email('Некорректный email'),
  username: z.string().min(3, 'Минимум 3 символа').max(30),
  password: z.string().min(8, 'Минимум 8 символов'),
})
type Form = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async () => {
      // After register — login immediately
      const form = document.querySelector('form') as HTMLFormElement
      const data = new FormData(form)
      const loginRes = await authApi.login({
        username: data.get('username') as string,
        password: data.get('password') as string,
      })
      setAuth(loginRes.data.access_token, loginRes.data.refresh_token)
      navigate('/today', { replace: true })
    },
  })

  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>
        <svg width='40' height='40' viewBox='0 0 40 40' fill='none' aria-label='MyLifeBook'>
          <rect width='40' height='40' rx='12' fill='var(--color-primary)' />
          <path d='M12 28V14l8 8 8-8v14' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
          <circle cx='20' cy='12' r='2' fill='white' />
        </svg>
        <span className={styles.logoText}>MyLifeBook</span>
      </div>

      <h1 className={styles.heading}>Регистрация</h1>

      <form className={styles.form} onSubmit={handleSubmit(d => mutation.mutate(d))}>
        <div className={styles.field}>
          <label className='label' htmlFor='email'>Email</label>
          <input id='email' type='email' className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder='you@example.com' autoComplete='email' {...register('email')} />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>

        <div className={styles.field}>
          <label className='label' htmlFor='reg-username'>Логин</label>
          <input id='reg-username' className={`input ${errors.username ? 'input-error' : ''}`}
            placeholder='your_name' autoComplete='username' {...register('username')} />
          {errors.username && <span className={styles.error}>{errors.username.message}</span>}
        </div>

        <div className={styles.field}>
          <label className='label' htmlFor='reg-password'>Пароль</label>
          <input id='reg-password' type='password' className={`input ${errors.password ? 'input-error' : ''}`}
            placeholder='••••••••' autoComplete='new-password' {...register('password')} />
          {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>

        {mutation.isError && (
          <p className={styles.apiError}>Ошибка регистрации. Возможно, пользователь уже существует.</p>
        )}

        <button className='btn btn-primary' style={{ width: '100%' }}
          type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? 'Создаю...' : 'Создать аккаунт'}
        </button>
      </form>

      <p className={styles.footer}>
        Есть аккаунт?{' '}
        <Link to='/login' className={styles.link}>Войти</Link>
      </p>
    </div>
  )
}
