import { ChainId } from 'caip'
import { BottomActionBar, ScreenWrapper } from 'components'
import {
  useChainMetadataDetails,
  useChainMetadatasCustom,
} from 'features/blockchain'
import { ChainMetadata } from 'features/caip'
import { Logger } from 'features/telemetry'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { Alert, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import TrashBinIcon from 'assets/trash_bin_icon.svg'
import NavigationHeader, {
  HeaderSideButton,
} from 'components/Navigation/NavigationHeader'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

import { ChainsMetadataForm } from './components'
import { useCreateChainMetadataFormFields } from './hooks'

const attemptedToModifyDisabledNetworkError = () =>
  new Error(
    'Attempted to modify a network that is not permitted for modification.'
  )

const logger = new Logger('BlockchainNetworkEditorScreen')

export type BlockchainNetworkEditorScreenParams = {
  readonly title: string
  readonly initialValue: ChainMetadata | null
  readonly isEditable: boolean
}

type BlockchainNetworkEditorScreenProps =
  MainStackScreenProps<'BlockchainNetworkEditor'>

export const BlockchainNetworkEditorScreen: React.FC<BlockchainNetworkEditorScreenProps> =
  (props) => {
    const {
      navigation,
      route: { params },
    } = props
    const { initialValue, title, isEditable } = params

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
      if (!isEditable) throw attemptedToModifyDisabledNetworkError()

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
    }, [isEditable, maybeChainIdToDelete, removeCustomNetworks, navigation])

    const headerSideButton: HeaderSideButton = React.useMemo(
      () => ({
        icon: <TrashBinIcon />,
        action: onPressDeleteNetwork,
      }),
      [onPressDeleteNetwork]
    )

    const deleteControlsEnabled = Boolean(isEditable && maybeChainIdToDelete)

    const chainMetadataFormFields = useCreateChainMetadataFormFields({
      initialValue,
    })

    const { evaluationResult, getMaybeEvaluatedChainMetadata } =
      chainMetadataFormFields

    const hasErrors = Boolean(evaluationResult.error)

    const { isReservedChainId } = useChainMetadataDetails()

    const onPressSave = React.useCallback(async () => {
      try {
        if (!isEditable) throw attemptedToModifyDisabledNetworkError()

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
      isEditable,
      navigation,
      getMaybeEvaluatedChainMetadata,
      addCustomNetworks,
    ])

    const styles = useThemeAwareStyle(createStyles)

    return (
      <ScreenWrapper keyboardAvoiding>
        <NavigationHeader
          title={title}
          renderNetInfo={false}
          right={deleteControlsEnabled ? headerSideButton : undefined}
        />
        <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
          <ChainsMetadataForm
            {...chainMetadataFormFields}
            disabled={!isEditable}
          />
        </ScrollView>
        <BottomActionBar
          alertType={isEditable ? (hasErrors ? 'error' : undefined) : 'info'}
          alertContent={
            isEditable
              ? hasErrors
                ? 'Some fields are invalid'
                : undefined
              : 'This network is built-in and non-editable'
          }
          actions={
            isEditable
              ? [
                  {
                    label: 'Save',
                    onPress: onPressSave,
                    disabled: hasErrors,
                  },
                ]
              : []
          }
        />
      </ScreenWrapper>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: {
      padding: theme.spacing.m,
    },
  })
