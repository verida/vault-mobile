import { AuthorizationRequestMessage } from '@0xpolygonid/js-sdk'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { RequestDetailProperty } from '~/components'
import { usePolygonId } from '~/features/polygonid'
import { reduceProtocols } from '~/features/protocols'
import { MainStackParams } from '~/navigation/types'

import { ConnectionRequestScreenParams } from './ConnectionRequestScreen'
import { ConnectionRequestScreenContent } from './ConnectionRequestScreen.Content'

interface WalletConnectConnectionRequestScreenProps {
  params: ConnectionRequestScreenParams
  data: AuthorizationRequestMessage
}

export const PolygonIDConnectionRequestScreen: React.FunctionComponent<
  WalletConnectConnectionRequestScreenProps
> = ({ params, data }) => {
  const { details } = params
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(false)
  const [erroMessage, setErrorMessage] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const { manager: polygonIdManager, isPolygonIdReady } = usePolygonId()

  const polygonIdNotReady =
    details.protocols.includes('polygonid') &&
    (!isPolygonIdReady || !polygonIdManager)

  const processButtonDisabled = processing || polygonIdNotReady

  const handleClose = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleGoToPolygonIdStatus = useCallback(() => {
    handleClose()
    navigation.navigate('PolygonIdStatus')
  }, [handleClose, navigation])

  const handleConnect = useCallback(async () => {
    if (!polygonIdManager) {
      return
    }

    setProcessing(true)
    // TODO: Handle different actions depending on the type of request

    // Doesn't need a try/catch as handled in the function itself
    const { result, error: requestError } =
      await polygonIdManager.processConnectionRequest(
        data as AuthorizationRequestMessage
      )
    if (result) {
      setSuccess(true)
    } else {
      setError(true)
      setErrorMessage(requestError?.message)
    }
    setProcessing(false)
    // TODO: Handle the case where the user closes the screen before the request is processed
  }, [polygonIdManager, data])

  const protocols = reduceProtocols(details.protocols, 16)

  const detailProperties: RequestDetailProperty[] = useMemo(() => {
    const properties = []

    properties.push({
      label: 'Requested on',
      value: (details.timestamp
        ? new Date(details.timestamp)
        : new Date()
      ).toLocaleString(),
    })

    properties.push({
      label: 'From',
      value: details.requesterId,
    })

    properties.push({
      label: 'Via',
      value: <>{protocols}</>,
    })

    return properties
  }, [details.requesterId, details.timestamp, protocols])

  useEffect(() => {
    setErrorMessage(
      polygonIdNotReady
        ? 'The Polygon ID feature is not ready. Check its status in the Settings and try again.'
        : undefined
    )
  }, [polygonIdNotReady])

  return (
    <ConnectionRequestScreenContent
      handleConnect={handleConnect}
      handleReject={handleClose}
      params={params}
      error={error}
      processing={processing}
      success={success}
      processButtonDisabled={processButtonDisabled}
      detailProperties={detailProperties}
      handleAlertProcess={handleGoToPolygonIdStatus}
      errorMessage={erroMessage}
    />
  )
}
