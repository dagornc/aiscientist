import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGenerateIdeas } from '../../hooks/useIdeas';
import { useLocale } from '../../hooks/useLocale';

interface GenerateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: () => void;
}

export const GenerateModal = ({ isOpen, onOpenChange, onGenerated }: GenerateModalProps) => {
  const { t } = useLocale();
  const { mutateAsync: generate, isPending } = useGenerateIdeas();
  const [formData, setFormData] = useState({
    domain: '',
    count: '3',
  });

  const handleGenerate = async () => {
    try {
      await generate({
        domain: formData.domain,
        count: parseInt(formData.count)
      });
      onGenerated?.();
      setFormData({ domain: '', count: '3' });
      onOpenChange(false);
    } catch (error) {
      console.error(t('common.error'), error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('ideas.generate_modal.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="domain">{t('ideas.generate_modal.field.domain')}</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData({...formData, domain: e.target.value})}
              placeholder={t('ideas.generate_modal.field.domain_placeholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="count">{t('ideas.generate_modal.field.count')}</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="10"
              value={formData.count}
              onChange={(e) => setFormData({...formData, count: e.target.value})}
              placeholder={t('ideas.generate_modal.field.count_placeholder')}
              required
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isPending || !formData.domain || !formData.count}
          >
            {isPending ? t('common.loading') : t('ideas.generate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};