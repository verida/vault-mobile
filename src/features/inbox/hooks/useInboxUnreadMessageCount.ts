import { selectNewMessagesCount } from '~/features/inbox'
import { useAppSelector } from '~/reduxStore/types'

const MAX_INBOX_COUNT = 10

export function useInboxUnreadMessageCount() {
  const unreadMessagesCount = useAppSelector(selectNewMessagesCount)
  const displayedInboxCount =
    unreadMessagesCount >= MAX_INBOX_COUNT
      ? `${MAX_INBOX_COUNT - 1}+`
      : unreadMessagesCount
  return { displayedInboxCount, unreadMessagesCount }
}
