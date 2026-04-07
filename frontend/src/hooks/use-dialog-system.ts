import { useAppChrome } from '@/hooks/useAppChrome'

export function useDialogSystem() {
  const { openFeedbackDialog, showNotice } = useAppChrome()

  return {
    openFeedbackDialog,
    showNotice,
  }
}
