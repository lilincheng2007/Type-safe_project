type OrderChatUnreadBadgeProps = {
  count: number
}

export function OrderChatUnreadBadge({ count }: OrderChatUnreadBadgeProps) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  )
}
