import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'

export default function PapersPage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('papers.title')}</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('common.no_data')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Complete experiments to generate research papers automatically.
        </p>
      </div>
    </div>
  )
}
