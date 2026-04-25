import { Outlet, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'
import {
  FlaskConical,
  Lightbulb,
  TestTube2,
  FileText,
  MessageSquareText,
  LayoutDashboard,
  GitBranch,
  Sun,
  Moon,
  Languages,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/pipeline', icon: GitBranch, labelKey: 'nav.pipeline' },
  { to: '/ideas', icon: Lightbulb, labelKey: 'nav.ideas' },
  { to: '/experiments', icon: TestTube2, labelKey: 'nav.experiments' },
  { to: '/papers', icon: FileText, labelKey: 'nav.papers' },
  { to: '/reviews', icon: MessageSquareText, labelKey: 'nav.reviews' },
]

export default function Layout(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()

  const toggleTheme = (): void => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const toggleLanguage = (): void => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <FlaskConical className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Autosearch</h1>
            <p className="text-xs text-muted-foreground">AI Scientist</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {t('common.theme')}
          </button>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Languages className="h-5 w-5" />
            {i18n.language === 'en' ? 'Français' : 'English'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          <span className="font-bold">Autosearch</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-2 rounded-lg hover:bg-accent">
            <Languages className="h-5 w-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around py-2 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate max-w-[60px]">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14 pb-16 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
