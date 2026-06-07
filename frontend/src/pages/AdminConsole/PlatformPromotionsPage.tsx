import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Save, TicketPercent } from 'lucide-react'

import { fetchAdminPlatformPromotionsIO } from '@/apis/admin/AdminPlatformPromotionsAPI'
import { updateAdminPlatformPromotionsIO } from '@/apis/admin/AdminPlatformPromotionsUpdateAPI'
import { runTask } from '@/apis/shared/client'
import { DeliveryLogoutBar } from '@/components/DeliveryLogoutBar'
import { DeliveryPageShell } from '@/components/DeliveryPageShell'
import { PromotionEditorCard, createDefaultPromotion, normalizePromotionPatch } from '@/components/PromotionEditorCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppChrome } from '@/hooks/useAppChrome'
import type { Promotion } from '@/objects/shared/Promotion'

const serializePromotions = (promotions: Promotion[]) => JSON.stringify(promotions)

type PageMode = 'manage' | 'add'

export default function PlatformPromotionsPage() {
  const navigate = useNavigate()
  const { showNotice } = useAppChrome()
  const [savedPromotions, setSavedPromotions] = useState<Promotion[]>([])
  const [draftPromotions, setDraftPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [exitPromptOpen, setExitPromptOpen] = useState(false)
  const [mode, setMode] = useState<PageMode>('manage')
  const [activePromotionId, setActivePromotionId] = useState<string | null>(null)

  const isDirty = useMemo(
    () => serializePromotions(savedPromotions) !== serializePromotions(draftPromotions),
    [draftPromotions, savedPromotions],
  )
  const activePromotion = activePromotionId ? draftPromotions.find((promotion) => promotion.id === activePromotionId) ?? null : null

  const loadPromotions = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await runTask(fetchAdminPlatformPromotionsIO())
      setSavedPromotions(response.promotions)
      setDraftPromotions(response.promotions)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '加载平台优惠失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadPromotions()
  }, [])

  useEffect(() => {
    if (!isDirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const updatePromotion = (id: string, patch: Partial<Promotion>) => {
    setDraftPromotions((current) => current.map((promotion) => promotion.id === id ? normalizePromotionPatch(promotion, patch) : promotion))
  }

  const removePromotion = (id: string) => {
    setDraftPromotions((current) => current.filter((promotion) => promotion.id !== id))
    if (activePromotionId === id) {
      setActivePromotionId(null)
      setMode('manage')
    }
  }

  const handleAddPromotion = () => {
    const promotion = createDefaultPromotion('platform-promo', '平台优惠')
    setDraftPromotions((current) => [...current, promotion])
    setActivePromotionId(promotion.id)
    setMode('add')
  }

  const savePromotions = async () => {
    setIsSaving(true)
    try {
      await runTask(updateAdminPlatformPromotionsIO(draftPromotions))
      setSavedPromotions(draftPromotions)
      showNotice('平台优惠已提交保存。', 'success')
      return true
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '保存平台优惠失败', 'error')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const requestExit = () => {
    if (isDirty) {
      setExitPromptOpen(true)
      return
    }
    navigate('/delivery/admin')
  }

  const saveAndExit = async () => {
    const saved = await savePromotions()
    if (saved) {
      navigate('/delivery/admin')
    }
  }

  const discardAndExit = () => {
    setExitPromptOpen(false)
    navigate('/delivery/admin')
  }

  return (
    <DeliveryPageShell>
      <Card className="border-orange-100 bg-white/95">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={mode === 'add' ? () => setMode('manage') : requestExit}
            >
              <ArrowLeft className="size-4" />
              {mode === 'add' ? '返回优惠管理' : '返回首页'}
            </Button>
            <div>
              <CardTitle className="flex items-center gap-2">
                <TicketPercent className="size-5 text-orange-500" />
                {mode === 'add' ? '添加平台优惠' : '管理平台优惠'}
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {mode === 'add' ? '添加页面与管理页使用相同的优惠内容设置，返回后仍需提交保存。' : '修改优惠内容或启停状态后，点击右上角提交才会保存。'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {mode === 'manage' ? (
              <Button type="button" variant="outline" onClick={handleAddPromotion} disabled={isLoading || isSaving}>
                <Plus className="size-4" />
                新增优惠
              </Button>
            ) : null}
            <Button type="button" onClick={() => void savePromotions()} disabled={!isDirty || isLoading || isSaving}>
              <Save className="size-4" />
              {isSaving ? '提交中…' : '提交'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-slate-500">加载中…</p> : null}
          {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && draftPromotions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-orange-100 bg-orange-50/50 px-3 py-4 text-sm text-slate-500">
              当前没有平台优惠，点击右上角“新增优惠”开始配置。
            </p>
          ) : null}

          {mode === 'add' && activePromotion ? (
            <PromotionEditorCard promotion={activePromotion} onChange={updatePromotion} onRemove={removePromotion} />
          ) : null}

          {mode === 'manage' ? (
            <div className="space-y-3">
              {draftPromotions.map((promotion) => (
                <PromotionEditorCard key={promotion.id} promotion={promotion} onChange={updatePromotion} onRemove={removePromotion} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog open={exitPromptOpen} onOpenChange={setExitPromptOpen}>
        <AlertDialogContent>
          <AlertDialogCancel className="mb-1 w-fit border-0 px-0 text-slate-500 shadow-none hover:bg-transparent" onClick={() => setExitPromptOpen(false)}>
            <ArrowLeft className="size-4" />
            返回优惠管理
          </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle>有未提交的优惠修改</AlertDialogTitle>
            <AlertDialogDescription>
              离开前请确认是否保存。本次修改只有点击“提交”后才会生效。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-slate-700 hover:bg-slate-800" onClick={discardAndExit}>
              不保存并退出
            </AlertDialogAction>
            <AlertDialogAction onClick={() => void saveAndExit()}>
              保存并退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeliveryLogoutBar />
    </DeliveryPageShell>
  )
}

