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
  disabled?: boolean;
  onSelectFiles: (kind: UploadKind, files: File[]) => void;
  onCancel: (kind: UploadKind) => void;
  onRetry: (kind: UploadKind) => void;
  onRemove: (kind: UploadKind) => void;
  errorKey: string | null;
  onContinue: () => void;
}

/**
 * Step 5 — Required documents (B5). Each mandatory PDF gets a full upload
 * slot: backend-confirmed constraints, real progress with cancel, localized
 * backend-error surfacing with retry, and a metadata + verification success
 * state with replace/remove actions.
 */
export function DocumentsStep({
  application,
  assignment,
  disabled = false,
  onSelectFiles,
  onCancel,
  onRetry,
  onRemove,
  errorKey,
  onContinue,
}: DocumentsStepProps) {
  const t = useTranslations('apply.documents');
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
