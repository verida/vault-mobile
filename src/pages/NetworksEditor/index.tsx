import { RouteProp } from '@react-navigation/native'
import { ChainId } from 'caip'
import { ChainMetadata, useChainMetadatasCustom } from 'features/caip'
import { Container } from 'native-base'
import * as React from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import TrashBinIcon from 'assets/trash_bin_icon.svg'
import Button from 'components/Button'
import NavigationHeader, {
  HeaderSideButton,
} from 'components/Navigation/NavigationHeader'
import useParams from 'hooks/useParams'
import { useMainNavigation } from 'navigation/hooks'
import { MainStackParams } from 'navigation/types'
import { ChainMetadataListSeparatorComponent } from 'pages/Networks/components'

export type NetworksEditorRouteProp = RouteProp<
  MainStackParams,
  'NetworksEditor'
>

export type NetworksEditorScreenProps = {
  readonly title: string
  readonly initialValue: ChainMetadata | null
  readonly disabled: boolean
}

const attemptedToModifyDisabledNetworkError = () =>
  new Error(
    'Attempted to modify a network that is not permitted for modification.'
  )

export const NetworksEditor = React.memo(
  function NetworksEditor(): JSX.Element {
    const { initialValue, title, disabled } =
      useParams<NetworksEditorScreenProps>()

    const navigation = useMainNavigation()

    const { removeCustomNetworks } = useChainMetadatasCustom()

    const maybeInitialNamespace = initialValue?.namespace
    const maybeInitialReference = initialValue?.reference

    // TODO: prevent the user from modifying reserved chains

    // TODO: which namespace should this be? initial or current?
    const maybeChainIdToDelete = React.useMemo(
      () =>
        maybeInitialNamespace && maybeInitialReference
          ? new ChainId({
              reference: maybeInitialReference,
              namespace: maybeInitialNamespace,
            })
          : null,
      [maybeInitialNamespace, maybeInitialReference]
    )

    const onPressDeleteNetwork = React.useCallback(async () => {
      if (disabled) throw attemptedToModifyDisabledNetworkError()

      if (!maybeChainIdToDelete) return

      const shouldDelete = await new Promise<boolean>((resolve) =>
        Alert.alert(
          'Are you sure you want to delete this network?',
          '',
          [
            {
              text: 'Cancel',
              onPress: () => resolve(false),
              style: 'cancel',
            },
            {
              text: 'Delete',
              onPress: () => resolve(true),
              style: 'destructive',
            },
          ],
          { cancelable: false }
        )
      )

      if (!shouldDelete) return

      await removeCustomNetworks([maybeChainIdToDelete])

      return navigation.goBack()
    }, [disabled, maybeChainIdToDelete, removeCustomNetworks, navigation])

    const headerSideButton: HeaderSideButton = React.useMemo(
      () => ({
        icon: <TrashBinIcon />,
        action: onPressDeleteNetwork,
      }),
      [onPressDeleteNetwork]
    )

    const onPressSave = React.useCallback(async () => {
      try {
        if (disabled) throw attemptedToModifyDisabledNetworkError()

        throw new Error('not yet implemented')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }, [disabled])

    const deleteControlsEnabled = Boolean(!disabled && maybeChainIdToDelete)

    return (
      <Container>
        <NavigationHeader
          title={title}
          renderNetInfo={false}
          right={deleteControlsEnabled ? headerSideButton : undefined}
        />
        <SafeAreaView style={[styles.flex, { marginTop: -35 }]}>
          <ScrollView style={[styles.flex]}>
            <View style={{ backgroundColor: 'red', width: 10, height: 5000 }} />
            <View style={{ height: 24 }} />
          </ScrollView>
          <View>
            <ChainMetadataListSeparatorComponent />
            <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
              <Button
                onPress={onPressSave}
                style={[styles.actionButton]}
                disabled={disabled}>
                Save
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </Container>
    )
  }
)

const styles = StyleSheet.create({
  actionButton: {
    marginBottom: 0,
  },
  content: {
    backgroundColor: '#fff',
    flex: 1,
    paddingVertical: 24,
  },
  flex: { flex: 1 },
})
