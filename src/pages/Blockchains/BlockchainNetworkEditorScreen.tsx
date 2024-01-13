import { ChainId } from 'caip'
import {
  useChainMetadataDetails,
  useChainMetadatasCustom,
} from 'features/blockchain'
import { ChainMetadata } from 'features/caip'
import { Logger } from 'features/telemetry'
import { Container } from 'native-base'
import * as React from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import TrashBinIcon from 'assets/trash_bin_icon.svg'
import Button from 'components/Button'
import NavigationHeader, {
  HeaderSideButton,
} from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'
import { ChainMetadataListSeparatorComponent } from 'pages/Blockchains/components'

import { ChainsMetadataForm } from './components'
import { useCreateChainMetadataFormFields } from './hooks'

const attemptedToModifyDisabledNetworkError = () =>
  new Error(
    'Attempted to modify a network that is not permitted for modification.'
  )

const logger = new Logger('BlockchainNetworkEditorScreen')

export type BlockchainNetworksEditorScreenParams = {
  readonly title: string
  readonly initialValue: ChainMetadata | null
  readonly disabled: boolean
}

type BlockchainNetworkEditorScreenProps =
  MainStackScreenProps<'BlockchainNetworkEditor'>

export const BlockchainNetworkEditorScreen: React.FC<BlockchainNetworkEditorScreenProps> =
  (props) => {
    const {
      navigation,
      route: { params },
    } = props
    const { initialValue, title, disabled } = params

    const { removeCustomNetworks, addCustomNetworks } =
      useChainMetadatasCustom()

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

    const deleteControlsEnabled = Boolean(!disabled && maybeChainIdToDelete)

    const chainMetadataFormFields = useCreateChainMetadataFormFields({
      initialValue,
    })

    const { evaluationResult, getMaybeEvaluatedChainMetadata } =
      chainMetadataFormFields

    const isMalformed = Boolean(evaluationResult.error)

    const saveControlsEnabled = !isMalformed && !disabled

    const { isReservedChainId } = useChainMetadataDetails()

    const onPressSave = React.useCallback(async () => {
      try {
        if (!saveControlsEnabled) throw attemptedToModifyDisabledNetworkError()

        const { data } = getMaybeEvaluatedChainMetadata()

        if (!data)
          throw new Error(
            `Developer error. Expected EvaluatedChainMetadata, encountered "${String(
              data
            )}".`
          )

        const { namespace, reference } = data

        const desiredChainId = new ChainId({ namespace, reference })

        if (isReservedChainId(desiredChainId)) {
          Alert.alert(
            'Unable to continue',
            `Sorry, ${desiredChainId.toString()} is currently reserved.`
          )

          // Prevent the operation from continuing.
          throw new Error('Attempted to save a reserved chainId.')
        }

        // HACK: Adding a custom network will implicitly overwrite
        //       duplicate fields.
        await addCustomNetworks([data])

        return navigation.goBack()
      } catch (e) {
        logger.error(e)
      }
    }, [
      isReservedChainId,
      saveControlsEnabled,
      navigation,
      getMaybeEvaluatedChainMetadata,
      addCustomNetworks,
    ])

    return (
      <Container>
        <NavigationHeader
          title={title}
          renderNetInfo={false}
          right={deleteControlsEnabled ? headerSideButton : undefined}
        />
        <SafeAreaView style={[styles.flex, { marginTop: -35 }]}>
          <ScrollView
            style={[styles.flex]}
            keyboardShouldPersistTaps='always'
            keyboardDismissMode='on-drag'>
            {/* TODO: Needs KeyboardAwareScrollView, the component specified in package.json causes crashes? */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <ChainsMetadataForm
                {...chainMetadataFormFields}
                disabled={disabled}
              />
              <View style={{ height: 24 }} />
            </KeyboardAvoidingView>
          </ScrollView>
          <View>
            <ChainMetadataListSeparatorComponent />
            <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
              <Button
                onPress={onPressSave}
                style={[styles.actionButton]}
                disabled={!saveControlsEnabled}>
                {isMalformed ? 'Invalid' : 'Save'}
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </Container>
    )
  }

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
