import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lightbulb, Sparkles, Loader2 } from 'lucide-react'
import { fetchAPI, type Idea } from '@/lib/api'

export default function IdeasPage(): JSX.Element {
  const { t } = useTranslation()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [area, setArea] = useState('')
  const [numIdeas, setNumIdeas] = useState(5)

  const generateIdeas = async (): Promise<void> => {
    if (!area.trim()) return
    setLoading(true)
    try {
      const result = await fetchAPI<{ ideas: Idea[] }>('/ideas/generate', {
        method: 'POST',
        body: JSON.stringify({
          research_area: area,
          num_ideas: numIdeas,
          template: 'general',
        }),
      })
      setIdeas(result.ideas)
    } catch {
      // Error handled silently — UI shows no data
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('ideas.title')}</h1>
      </div>

      {/* Generation form */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1.5 block">{t('ideas.research_area')}</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g., Diffusion models for low-dimensional data"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('ideas.num_ideas')}</label>
            <input
              type="number"
              value={numIdeas}
              onChange={(e) => setNumIdeas(Number(e.target.value))}
              min={1}
              max={50}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <button
          onClick={generateIdeas}
          disabled={loading || !area.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? t('ideas.generating') : t('ideas.generate')}
        </button>
      </div>

      {/* Ideas list */}
      <div className="space-y-4">
        {ideas.map((idea) => (
          <div key={idea.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{idea.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ScoreBadge label={t('ideas.novelty')} score={idea.novelty_score} />
              <ScoreBadge label={t('ideas.feasibility')} score={idea.feasibility_score} />
              <ScoreBadge label={t('ideas.impact')} score={idea.impact_score} />
            </div>
            {idea.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {idea.keywords.map((kw) => (
                  <span key={kw} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreBadge({ label, score }: { label: string; score: number }): JSX.Element {
  const color = score >= 7 ? 'text-green-500' : score >= 4 ? 'text-yellow-500' : 'text-red-500'
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-semibold ${color}`}>{score.toFixed(1)}</span>
    </div>
  )
}
