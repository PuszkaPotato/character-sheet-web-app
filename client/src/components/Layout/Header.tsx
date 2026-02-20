import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Button from '../UI/Button'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 text-lg tracking-tight">
          <span>⚔️</span>
          <span>DnD Sheet</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/character/new">
            <Button variant="primary" size="sm">New Character</Button>
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/characters">
                <Button variant="secondary" size="sm">My Characters</Button>
              </Link>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{user?.username}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="secondary" size="sm">Login</Button></Link>
              <Link to="/register"><Button variant="secondary" size="sm">Register</Button></Link>
            </>
          )}

          <button
            onClick={toggle}
            className="p-1.5 rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>
      </div>
    </header>
  )
}
