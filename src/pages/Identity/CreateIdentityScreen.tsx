import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { EnvironmentType } from '@verida/types'
import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'

import AccountManager from '~/api/AccountManager'
import {
  BottomActionBar,
  Icon,
  ScreenWrapper,
  StatusInfo,
  StatusList,
  StatusListItem,
} from '~/components'
import { StepsIndicator } from '~/components/Indicators'
import { Checkbox, FormInput } from '~/components/Input'
import { NetworkSelectorRadioButtonGroup } from '~/components/Network'
import DropDownPicker, { Option } from '~/components/Select'
import { Spacer } from '~/components/Spacer'
import { Headline } from '~/components/Typography/Headline'
import { Label } from '~/components/Typography/Label'
import { Paragraph } from '~/components/Typography/Paragraph'
import { Text } from '~/components/Typography/Text'
import { HIT_SLOP_10_10 } from '~/constants'
import { PUBLIC_PROFILE_NAME_MAX_LENGTH } from '~/constants/profile'
import { useTheme } from '~/contexts'
import {
  CreateIdentityStep,
  CreateIdentityStepStatus,
} from '~/features/identities'
import { getDefaultVeridaNetwork } from '~/features/verida'
import { COUNTRIES } from '~/helpers/countries'
import { useThemeAwareStyle } from '~/hooks'
import { AuthStackParams, MainStackScreenProps } from '~/navigation'
import InputStyles from '~/styles/inputs'
import { Theme } from '~/styles/types'

// TODO: Implement username claim. See commit 8ea4a847 for the previous implementation

const pageData = [
  {
    key: 'name',
    hasNext: true,
    hasBack: true,
    canSkip: false,
  },
  {
    key: 'location',
    hasNext: true,
    hasBack: true,
    canSkip: false,
  },
  {
    key: 'confirmation',
    hasNext: false,
    hasBack: false,
    canSkip: false,
  },
]

const numberOfPages = pageData.length

enum PageType {
  Name,
  Location,
  Confirmation,
}

const defaultIdentityCreationStepStatus: Array<
  StatusListItem & { key: CreateIdentityStep }
> = [
  {
    key: 'CreateIdentifier',
    label: 'Creating your decentralized identity',
    status: 'idle',
  },
  {
    key: 'StorageLocation',
    label: 'Connecting to your storage nodes',
    status: 'idle',
  },
  {
    key: 'CreateProfile',
    label: 'Creating your public profile',
    status: 'idle',
  },
]

export type CreateIdentityScreenParams = {
  firstIdentity: boolean
}

type CreateIdentityScreenProps = MainStackScreenProps<'CreateIdentity'>

export const CreateIdentityScreen: React.FC<CreateIdentityScreenProps> = (
  props
) => {
  const {
    route: { params },
  } = props
  const navigation = useNavigation() as NativeStackNavigationProp<
    AuthStackParams,
    'CreateIdentity'
  > // TODO: Take it from the props once we have combined the MainStackNavigator and the AuthStackNavigator

  const defaultNetwork = getDefaultVeridaNetwork()

  const { theme } = useTheme()
  const styles = useThemeAwareStyle(creatStyles)

  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.Name)

  const [network, setNetwork] = useState<EnvironmentType>(defaultNetwork)

  const [profile, setProfile] = useState<{
    name: string
    username: string
    country: string
  }>({
    name: '',
    username: '',
    country: '',
  })

  const [showCountryInPublicProfile, setShowCountryOnPublicProfile] =
    useState<boolean>(true)

  const toggleCountryCheckbox = useCallback(() => {
    setShowCountryOnPublicProfile((prevState) => !prevState)
  }, [])

  const [createIdentityStatus, setCreateIdentityStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle')

  const [identityCreationStatusItems, setIdentityCreationStatusItems] =
    useState(defaultIdentityCreationStepStatus)

  const [createIdentityErrorMessage, setCreateIdentityErrorMessage] =
    useState<string>('')

  const [confirmationState, setConfirmationState] = useState<{
    state?: Partial<Record<CreateIdentityStep, CreateIdentityStepStatus>> & {
      currentStep?: CreateIdentityStep
    }
  }>()

  const updateIdentityCreationStepStatus = useCallback(
    (step: CreateIdentityStep, status: CreateIdentityStepStatus) => {
      setIdentityCreationStatusItems((prevItems) =>
        prevItems.map((item) =>
          item.key === step
            ? {
                ...item,
                status,
              }
            : item
        )
      )
    },
    []
  )

  const createIdentity = useCallback(async () => {
    try {
      setCreateIdentityStatus('processing')

      await AccountManager.getInstance().createAccount(
        {
          name: profile.name?.trim() ?? '',
          username: profile.username ?? '',
          country: showCountryInPublicProfile ? profile?.country : '',
          description: '',
        },
        profile?.country,
        network,
        updateIdentityCreationStepStatus
      )

      setCreateIdentityStatus('success')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          'Unable to force creation of storage context for this DID'
      ) {
        setCreateIdentityErrorMessage(
          'Blockchain is temporarily unavailable, please try again later.'
        )
      } else {
        setCreateIdentityErrorMessage(
          'Unable to create account at this time, please try again later.'
        )
      }

      setCreateIdentityStatus('error')
    }
  }, [
    profile,
    network,
    showCountryInPublicProfile,
    updateIdentityCreationStepStatus,
  ])

  const { formValidated } = useMemo(() => {
    switch (currentPage) {
      case PageType.Name:
        return {
          formValidated:
            !isEmpty(profile.name) &&
            profile.name?.length <= PUBLIC_PROFILE_NAME_MAX_LENGTH,
        }
      case PageType.Location:
        return { formValidated: !isEmpty(profile.country) }
      case PageType.Confirmation:
        return {
          formValidated:
            confirmationState?.state?.CreateIdentifier === 'success' &&
            confirmationState?.state?.StorageLocation === 'success' &&
            confirmationState?.state?.CreateProfile === 'success',
        }
      default:
        return {}
    }
  }, [confirmationState, currentPage, profile])

  const handleCountryChange = useCallback((option: Option) => {
    setProfile((p) => ({ ...p, country: option.value }))
  }, [])

  const navigateForward = useCallback(() => {
    setCurrentPage((prevPage) => prevPage + 1)
  }, [])

  useEffect(() => {
    pagerRef.current?.setPage(currentPage)
  }, [currentPage])

  useEffect(() => {
    if (
      currentPage === PageType.Confirmation &&
      createIdentityStatus === 'idle'
    ) {
      setTimeout(() => {
        createIdentity()
      }, 0)
    }
  }, [currentPage, createIdentityStatus, createIdentity])

  const navigateBack = useCallback(() => {
    if (createIdentityStatus === 'processing') {
      // Useful for handling hardware back button on Android
      Alert.alert("Hold on, we're building your identity")
      return
    }

    setTimeout(() => {
      if (currentPage > 0) {
        setCurrentPage((prevPage) => prevPage - 1)
        setCreateIdentityStatus('idle')
      } else {
        navigation.goBack()
      }
    }, 0)
  }, [createIdentityStatus, currentPage, navigation])

  const handleRetryButtonPress = useCallback(() => {
    setConfirmationState({})
    createIdentity()
  }, [createIdentity])

  const handleRecordSeedPhraseButtonPress = useCallback(() => {
    navigation.navigate('SeedPhrase')
  }, [navigation])

  const handleDoneButtonPress = useCallback(() => {
    if (params.firstIdentity) {
      // FIXME: CreateIdentityScreen is in both AuthNavigator and MainNavigator but here it's calling 'CreatePin' which is only in AuthNavigator. Even if it's controlled by 'firstIdentity' param, it's still a risk of bug.
      navigation.navigate('CreatePin') // Create a pin for the first time creating an identity
    } else {
      navigation.goBack()
    }
  }, [params.firstIdentity, navigation])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigateBack()
        return true // Manually handle Android Back press event
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )

      return () => subscription.remove()
    }, [navigateBack])
  )

  useEffect(() => {
    navigation.setOptions({
      headerShown: currentPage !== PageType.Confirmation,
      title: `Step ${currentPage + 1} of ${numberOfPages - 1}`,
      headerShadowVisible: false,
      headerLeft: pageData[currentPage].hasBack
        ? () => (
            <TouchableOpacity
              onPress={navigateBack}
              hitSlop={HIT_SLOP_10_10}
              style={styles.headerBackButton}>
              <Icon name='back' size={24} color={theme.color.onBackground} />
            </TouchableOpacity>
          )
        : undefined,
    })
  }, [
    navigation,
    currentPage,
    navigateBack,
    styles.headerBackButton,
    theme.color.onBackground,
  ])

  const ProgressBar = useCallback(() => {
    return currentPage !== PageType.Confirmation ? (
      <StepsIndicator
        style={styles.progressBar}
        currentStep={currentPage}
        numberOfSteps={numberOfPages - 1}
      />
    ) : null
  }, [currentPage, styles.progressBar])

  return (
    <ScreenWrapper
      keyboardAvoiding
      allSafeAreaEdges={
        currentPage === PageType.Confirmation // Because there is no header
      }>
      <ProgressBar />
      <PagerView
        ref={pagerRef}
        initialPage={currentPage}
        scrollEnabled={false}
        style={styles.pager}>
        <View key='name' style={styles.page}>
          <ScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            style={styles.container}
            contentContainerStyle={styles.content}>
            <Headline style={styles.title}>Public name</Headline>
            <Text>
              A public name visible to other users and applications. You can
              change this anytime.
            </Text>
            <Spacer vertical='l' />
            <FormInput
              label='Public Name'
              placeholder='Enter your public name'
              autoCorrect={false}
              autoFocus={true}
              inputAccessoryViewID='isv'
              autoComplete='off'
              returnKeyType='next'
              errorMessage={
                profile.name?.length > PUBLIC_PROFILE_NAME_MAX_LENGTH
                  ? `Public name must be shorter than ${PUBLIC_PROFILE_NAME_MAX_LENGTH} characters`
                  : undefined
              }
              onChangeText={(text) => setProfile((p) => ({ ...p, name: text }))}
              value={profile.name}
              onSubmitEditing={() => formValidated && navigateForward()}
            />
            <Label style={{ marginTop: 2 }}>
              Your public name is required and public
            </Label>
          </ScrollView>
        </View>
        <View key='location' style={styles.page}>
          <ScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            style={styles.container}
            contentContainerStyle={styles.content}>
            <Headline style={styles.title}>Data Region</Headline>
            <Paragraph>
              Select your country to determine the default servers that store
              your encrypted personal data. You can change both your country and
              the data regions later.
            </Paragraph>
            <Spacer vertical='l' />
            <Label style={{ marginBottom: 2 }}>Country</Label>
            <DropDownPicker
              searchable
              searchablePlaceholder='Search for country'
              showArrow
              autoFocus={false}
              dropDownMaxHeight={160}
              placeholder=''
              items={COUNTRIES}
              containerStyle={InputStyles.select}
              onChangeItem={handleCountryChange}
            />
            <Spacer vertical='m' />
            <Checkbox
              checked={showCountryInPublicProfile}
              onToggle={toggleCountryCheckbox}>
              Show country in my public profile
            </Checkbox>
            <NetworkSelectorRadioButtonGroup
              selectedNetwork={network}
              onSelectionChange={setNetwork}
              style={styles.networkSelection}
            />
          </ScrollView>
        </View>
        <View key='confirmation' style={styles.page}>
          <StatusBar
            // There is no header with this page, so has to set the status bar accordingly, just in case it takes the status bar color from  previous screen (ie: OnboardingScreen)
            barStyle={theme.statusBar.defaultStyle}
            backgroundColor='transparent'
            translucent={true}
          />
          <ScrollView
            alwaysBounceVertical={true}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            style={styles.container}
            contentContainerStyle={styles.content}>
            <StatusInfo
              statusType={
                createIdentityStatus === 'success'
                  ? 'success'
                  : createIdentityStatus === 'error'
                    ? 'error'
                    : 'processsing'
              }
              title={
                createIdentityStatus === 'success'
                  ? 'Success!'
                  : createIdentityStatus === 'error'
                    ? 'Something went wrong'
                    : 'Building your identity'
              }
              subtitle={
                createIdentityStatus === 'success'
                  ? 'Your identity has been successfully created'
                  : createIdentityStatus === 'error'
                    ? createIdentityErrorMessage
                    : 'Please wait...'
              }
            />
            <StatusList
              statusItems={identityCreationStatusItems}
              style={styles.identityCreationStepStatusList}
            />
          </ScrollView>
        </View>
      </PagerView>
      <BottomActionBar
        hideBorder
        actionsOrientation='column'
        actions={
          currentPage !== PageType.Confirmation
            ? [
                {
                  label: 'Next',
                  onPress: navigateForward,
                  disabled: !formValidated,
                },
              ]
            : createIdentityStatus === 'success'
              ? [
                  {
                    label: 'Record Seed Phrase',
                    variant: 'secondary',
                    onPress: handleRecordSeedPhraseButtonPress,
                  },
                  {
                    label: 'Done',
                    onPress: handleDoneButtonPress,
                  },
                ]
              : createIdentityStatus === 'error'
                ? [
                    {
                      label: 'Retry',
                      onPress: handleRetryButtonPress,
                    },
                  ]
                : undefined
        }
        alertType='warning'
        alertContent={
          currentPage === PageType.Confirmation &&
          createIdentityStatus === 'success'
            ? 'Record your seed phrase to recover your identity.'
            : undefined
        }
      />
    </ScreenWrapper>
  )
}

const creatStyles = (theme: Theme) => {
  return StyleSheet.create({
    headerBackButton: {
      marginLeft: theme.spacing.m,
    },
    progressBar: {
      marginHorizontal: theme.spacing.m,
    },
    pager: {
      flex: 1,
    },
    page: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingTop: theme.spacing.l,
      paddingBottom: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
    },
    identityCreationStepStatusList: {
      marginTop: theme.spacing.xxl,
    },
    title: {
      color: theme.color.onBackground,
      marginBottom: 10,
    },
    networkSelection: {
      marginTop: theme.spacing.l,
    },
  })
}
