import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { registerRemoteNotification } from 'api/utils'
import { isEmpty } from 'lodash'

export function useRegisterRemoteNotification() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const deviceToken = useSelector((state) => state.deviceToken)

  useEffect(() => {
    if (!isEmpty(deviceToken)) {
      console.log('deviceToken:', deviceToken)
      registerRemoteNotification(deviceToken)
    }
  }, [deviceToken])
}
