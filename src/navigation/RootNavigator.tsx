import { createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { DIDClient } from '@verida/did-client'
import { emitter } from 'helpers/emitter'
import { useEmitter } from 'hooks'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import AccountManager from 'api/AccountManager'
import LoadingView from 'components/LoadingView'
import { useAuth } from 'hooks/useAuth'
import AuthNavigator from 'navigation/AuthNavigator'
import MainNavigator from 'navigation/MainNavigator'
import { RootStackParams } from 'navigation/types'

import CONFIG from '../config/environment'

const Stack = createNativeStackNavigator<RootStackParams>()
export const navigationRef = createNavigationContainerRef<RootStackParams>()

export function navigate(name: unknown, params: unknown) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never)
  }
}

function RootNavigator() {
  const { refresh, authenticated, loaded } = useAuth()
  const [showBackupNavigation, setShowBackupNavigation] = useState(false)
  const mounted = useRef(false)

  const init = useCallback(async () => {
    try {
      await AccountManager.getInstance().init()
      await refresh()
    } catch (error: any) {
      // Handle this specific error of non-existent DID
      if (
        error.message.match(
          /Unable to locate requested storage context \(Verida: Vault\) for this DID \(.*\) -- Storage context doesn't exist \(try force create\?\)/
        )
      ) {
        const selectedAccount =
          AccountManager.getInstance().getSelectedAccount()

        // try to fetch the DID
        const did = selectedAccount!.did
        const didClient = new DIDClient({
          network: CONFIG.VERIDA_ENVIRONMENT,
        })

        try {
          await didClient.get(did)
        } catch (err) {
          // error message will be a blockchain error if the DID doesn't exist
        }

        emitter.emit('ACCOUNT_NOT_EXIST', {
          retry: (forcedInit = true) => {
            forcedInit && init()
            setShowBackupNavigation(false)
          },
        })

        setShowBackupNavigation(true)
      }
    }
  }, [refresh])

  useEffect(() => {
    if (mounted.current) {
      return
    }
    mounted.current = true
    init()
  }, [init])

  useEmitter(
    'APP_RECOVER_FROM_ERROR',
    async () => {
      setShowBackupNavigation(false)
      init()
    },
    []
  )

  if (showBackupNavigation) {
    const StackBackup = createNativeStackNavigator<any>()
    return (
      <StackBackup.Navigator screenOptions={{ headerShown: false }}>
        <StackBackup.Screen
          name={'ManageIdentities'}
          component={AuthNavigator}
        />
      </StackBackup.Navigator>
    )
  }

  if (!loaded) {
    return <LoadingView />
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!authenticated ? (
        <Stack.Screen name={'Auth'} component={AuthNavigator} />
      ) : (
        <Stack.Screen name={'Main'} component={MainNavigator} />
      )}
    </Stack.Navigator>
  )
}

export default RootNavigator
