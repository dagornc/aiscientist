import { useTranslation } from 'react-i18next'
import { MessageSquareText } from 'lucide-react'

export default function ReviewsPage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('reviews.title')}</h1>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MessageSquareText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('common.no_data')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Reviews will appear here once papers are generated and reviewed.
        </p>
      </div>
    </div>
  )
}
