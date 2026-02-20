import { Link } from 'react-router-dom'
import Button from '../components/UI/Button'

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        D&D 5e Character Sheets
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
        Create and manage your D&D 5th Edition characters. No account required — everything saves automatically to your browser.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-16">
        <Link to="/character/new">
          <Button size="lg">Create New Character</Button>
        </Link>
        <Link to="/login">
          <Button size="lg" variant="secondary">Login to Sync</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        {[
          { icon: '⚡', title: 'Auto-calculated', desc: 'Modifiers, skill bonuses, spell DC — all update instantly as you type.' },
          { icon: '💾', title: 'Always saved', desc: 'Auto-saves to your browser every half second. No account needed.' },
          { icon: '📄', title: 'Export to PDF', desc: 'Download a formatted character sheet PDF anytime.' },
        ].map(f => (
          <div key={f.title} className="rounded-lg border border-gray-200 dark:border-gray-700 p-5">
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
