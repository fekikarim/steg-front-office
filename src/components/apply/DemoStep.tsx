'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {StepShell} from './StepShell';
import {DocumentSlot, type SlotState} from './DocumentSlot';
import {DOCUMENT_RULES} from '@/lib/api/application';
import type {UploadKind} from '@/lib/apply-wizard';

interface DemoStepProps {
  demo: SlotState;
  disabled?: boolean;
  onSelectFiles: (kind: UploadKind, files: File[]) => void;
  onCancel: (kind: UploadKind) => void;
  onRetry: (kind: UploadKind) => void;
  onRemove: (kind: UploadKind) => void;
  onContinue: () => void;
}

/**
 * Step 6 — Optional project demo image (B5). Same production slot as the
 * required documents, bound to the backend-confirmed image rule; the step
 * can always be skipped, and a failed optional upload never blocks progress.
 */
export function DemoStep({
  demo,
  disabled = false,
  onSelectFiles,
  onCancel,
  onRetry,
  onRemove,
  onContinue,
}: DemoStepProps) {
  const t = useTranslations('apply.demo');
  const tn = useTranslations('apply.nav');

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      <Card>
        <DocumentSlot
          kind="PROJECT_DEMO_IMAGE"
          title={t('projectDemo')}
          description={t('demoOptionalNote')}
          rule={DOCUMENT_RULES.PROJECT_DEMO_IMAGE}
          state={demo}
          disabled={disabled}
          onSelect={onSelectFiles}
          onCancel={onCancel}
          onRetry={onRetry}
          onRemove={onRemove}
        />
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={onContinue} disabled={disabled}>
          {tn('continue')}
        </Button>
      </div>
    </StepShell>
  );
}
