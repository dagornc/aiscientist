import { useTranslation } from 'react-i18next'
import { TestTube2 } from 'lucide-react'

export default function ExperimentsPage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('experiments.title')}</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <TestTube2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('common.no_data')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Generate ideas first, then run experiments from the Ideas page.
        </p>
      </div>
    </div>
  )
}
