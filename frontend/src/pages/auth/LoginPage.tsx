import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import styles from './Auth.module.css'

const schema = z.object({
  username: z.string().min(1, 'Введите логин'),
  password: z.string().min(6, 'Минимум 6 символов'),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAuth(data.access_token, data.refresh_token)
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

      <h1 className={styles.heading}>Вход</h1>
      <p className={styles.sub}>Твой личный дневник и инструмент работы с паттернами</p>

      <form className={styles.form} onSubmit={handleSubmit(d => mutation.mutate(d))}>
        <div className={styles.field}>
          <label className='label' htmlFor='username'>Логин</label>
          <input id='username' className={`input ${errors.username ? 'input-error' : ''}`}
            placeholder='your_login' autoComplete='username' {...register('username')} />
          {errors.username && <span className={styles.error}>{errors.username.message}</span>}
        </div>

        <div className={styles.field}>
          <label className='label' htmlFor='password'>Пароль</label>
          <input id='password' type='password' className={`input ${errors.password ? 'input-error' : ''}`}
            placeholder='••••••••' autoComplete='current-password' {...register('password')} />
          {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>

        {mutation.isError && (
          <p className={styles.apiError}>Неверный логин или пароль</p>
        )}

        <button className='btn btn-primary' style={{ width: '100%' }}
          type='submit' disabled={mutation.isPending}>
          {mutation.isPending ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <p className={styles.footer}>
        Нет аккаунта?{' '}
        <Link to='/register' className={styles.link}>Зарегистрироваться</Link>
      </p>
    </div>
  )
}
