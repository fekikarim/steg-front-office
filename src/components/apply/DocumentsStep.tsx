'use client';

import {useTranslations} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {Button} from '@/components/ui/Button';
import {StepShell} from './StepShell';
import {FieldError} from '@/components/ui/FieldError';
import {DocumentSlot, type SlotState} from './DocumentSlot';
import {DOCUMENT_RULES} from '@/lib/api/application';
import type {UploadKind} from '@/lib/apply-wizard';

interface DocumentsStepProps {
  application: SlotState;
  assignment: SlotState;
  demo?: SlotState;
  disabled?: boolean;
  onSelectFiles: (kind: UploadKind, files: File[]) => void;
  onCancel: (kind: UploadKind) => void;
  onRetry: (kind: UploadKind) => void;
  onRemove: (kind: UploadKind) => void;
  errorKey: string | null;
  onContinue: () => void;
}

/**
 * Step 5 — Required Documents.
 * Collects mandatory Internship Application PDF and Assignment Letter PDF,
 * with optional demo/project attachment, format validations, and secure handling notice.
 */
export function DocumentsStep({
  application,
  assignment,
  demo,
  disabled = false,
  onSelectFiles,
  onCancel,
  onRetry,
  onRemove,
  errorKey,
  onContinue,
}: DocumentsStepProps) {
  const t = useTranslations('apply.documents');
  const tm = useTranslations('apply.demo');
  const tn = useTranslations('apply.nav');

  const ready = Boolean(application.attachment) && Boolean(assignment.attachment);

  return (
    <StepShell eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')}>
      <Card>
        <div className="flex flex-col gap-6">
          <DocumentSlot
            kind="INTERNSHIP_APPLICATION"
            title={t('applicationLetter')}
            description={t('applicationLetterHint')}
            rule={DOCUMENT_RULES.INTERNSHIP_APPLICATION}
            state={application}
            disabled={disabled}
            onSelect={onSelectFiles}
            onCancel={onCancel}
            onRetry={onRetry}
            onRemove={onRemove}
          />

          <DocumentSlot
            kind="ASSIGNMENT_LETTER"
            title={t('assignmentLetter')}
            description={t('assignmentLetterHint')}
            rule={DOCUMENT_RULES.ASSIGNMENT_LETTER}
            state={assignment}
            disabled={disabled}
            onSelect={onSelectFiles}
            onCancel={onCancel}
            onRetry={onRetry}
            onRemove={onRemove}
          />

          {demo && (
            <DocumentSlot
              kind="PROJECT_DEMO_IMAGE"
              title={tm('title')}
              description={tm('intro')}
              rule={DOCUMENT_RULES.PROJECT_DEMO_IMAGE}
              state={demo}
              disabled={disabled}
              onSelect={onSelectFiles}
              onCancel={onCancel}
              onRetry={onRetry}
              onRemove={onRemove}
            />
          )}

          {/* Secure handling & privacy note */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-navy-950/60 dark:text-zinc-400">
            🔒 <strong>Confidentialité & Sécurité :</strong> Les pièces justificatives téléversées sont transmises via un canal sécurisé et exclusivement consultées par les coordinateurs de stage et encadrants habilités de la STEG.
          </div>
        </div>
      </Card>

      {errorKey && <FieldError message={errorKey} />}

      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={onContinue} disabled={!ready || disabled}>
          {tn('continue')}
        </Button>
      </div>
    </StepShell>
  );
}
