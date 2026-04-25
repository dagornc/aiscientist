import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FlaskConical, Lightbulb, TestTube2, FileText, MessageSquareText, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchAPI, type ModelInfo } from '@/lib/api'

export default function Dashboard(): JSX.Element {
  const { t } = useTranslation()
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)

  useEffect(() => {
    fetchAPI<ModelInfo>('/models').then(setModelInfo).catch(() => setModelInfo(null))
  }, [])

  const stats = [
    { label: t('dashboard.ideas_generated'), value: '0', icon: Lightbulb, color: 'text-yellow-500' },
    { label: t('dashboard.experiments_run'), value: '0', icon: TestTube2, color: 'text-green-500' },
    { label: t('dashboard.papers_written'), value: '0', icon: FileText, color: 'text-blue-500' },
    { label: t('dashboard.reviews_completed'), value: '0', icon: MessageSquareText, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <FlaskConical className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('dashboard.welcome')}</h1>
            <p className="text-muted-foreground mt-1">{t('dashboard.description')}</p>
          </div>
        </div>
        {modelInfo && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
            <span className="font-medium">LLM:</span>
            <span className="text-primary">{modelInfo.current.model}</span>
            <span className="text-muted-foreground">via {modelInfo.current.provider}</span>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.stats')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.quick_start')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/ideas"
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="font-medium">{t('ideas.generate')}</p>
                <p className="text-sm text-muted-foreground">{t('ideas.research_area')}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/pipeline"
            className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">{t('pipeline.title')}</p>
                <p className="text-sm text-muted-foreground">{t('pipeline.description')}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
