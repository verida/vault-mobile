import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AccountManager from 'api/AccountManager'

const REMIND_EXPIRATION_TIME = 24 * 60 * 60 * 1000 // 24 hours

function useSeedPhraseReminder() {
  const [shouldShowReminder, setShouldShowReminder] = useState(true)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const selectedAccount = useSelector((state) => state.selectedAccount)

  useEffect(() => {
    async function checkReminder() {
      if (selectedAccount?.seedPhraseReminder?.backedup) {
        return
      }

      const expired =
        Date.now() - (selectedAccount?.seedPhraseReminder?.lastTime || 0) >
        REMIND_EXPIRATION_TIME
      if (!selectedAccount?.seedPhraseReminder || expired) {
        setShouldShowReminder(true)
        await AccountManager.getInstance().updateLastTimeSeedPhraseReminder(
          false
        )
      }
    }

    checkReminder()
  }, [selectedAccount])

  function hideReminder() {
    setShouldShowReminder(false)
  }

  return {
    shouldShowReminder,
    hideReminder,
  }
}

export default useSeedPhraseReminder
