import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTheme } from 'contexts/ThemeContext'
import {
  CreateIdentityStep,
  CreateIdentityStepStatus,
} from 'features/identities'
import { getDefaultVeridaNetwork } from 'features/verida'
import { COUNTRIES } from 'helpers/countries'
import isEmpty from 'lodash/isEmpty'
import LottieView from 'lottie-react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BottomActionBar, Icon, ScreenWrapper } from '~/components'
import { HIT_SLOP_10_10 } from '~/constants'

import AccountManager from 'api/AccountManager'
import BlurCircle from 'assets/blur_circle.svg'
import FailureCross from 'assets/failure_cross.svg'
import SuccessTick from 'assets/success_tick.svg'
import Container from 'components/Container'
import { StepsIndicator } from 'components/Indicators'
import { AnimatedCheckbox, FormInput } from 'components/Input'
import { NetworkSelectorRadioButtonGroup } from 'components/Network'
import DropDownPicker, { Option } from 'components/Select'
import { Spacer } from 'components/Spacer'
import { Headline } from 'components/Typography/Headline'
import { Label } from 'components/Typography/Label'
import { Paragraph } from 'components/Typography/Paragraph'
import { Text } from 'components/Typography/Text'
import { PUBLIC_PROFILE_NAME_MAX_LENGTH } from 'constants/profile'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { AuthStackParams, MainStackScreenProps } from 'navigation/types'
import InputStyles from 'styles/inputs'
import { Theme } from 'styles/types'

const pageData = [
  {
    key: 'name',
    hasNext: true,
    hasBack: true,
  },
  // {
  //   key: 'username',
  //   hasNext: true,
  //   hasBack: true,
  // },
  {
    key: 'location',
    hasNext: true,
    hasBack: true,
  },
  {
    key: 'confirmation',
    hasNext: false,
    hasBack: false,
  },
]

const numberOfPages = pageData.length

enum PageType {
  Name,
  // Username,
  Location,
  Confirmation,
}

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
  const { top } = useSafeAreaInsets()

  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(PageType.Name)

  const [enabledClaimUsername] = useState(false) // FIXME: disable input username
  const [network, setNetwork] = useState(defaultNetwork)

  const [showCountryInPublicProfile, setShowCountryOnPublicProfile] =
    useState(true)

  const toggleCountryCheckbox = useCallback(() => {
    setShowCountryOnPublicProfile((prevState) => !prevState)
  }, [])

  const [createIdentityStatus, setCreateIdentityStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle')
  const [createIdentityErrorMessage, setCreateIdentityErrorMessage] =
    useState('')

  // const publicNameInputRef = useRef<TextInput>(null)
  // const usernameInputRef = useRef<TextInput>(null)
  // // const [manualFocusUsenameInput, setManualFocusUsenameInput] = useState(true)
  // const [checkingUsername, setCheckingUsername] = useState(false)
  // const [availableUsername, setAvailableUsername] = useState(false)
  // const [usernameError, setUsernameError] = useState<string | undefined>(
  //   undefined
  // )
  // const checkUsername = useCallback(async () => {
  //   // FIXME: Need an API for checking username is available to claim
  //   setCheckingUsername(true)
  //   setTimeout(() => {
  //     setCheckingUsername(false)
  //     setAvailableUsername(true)
  //   }, 300)
  // }, [])

  const [confirmationState, setConfirmationState] = useState<{
    state?: Partial<Record<CreateIdentityStep, CreateIdentityStepStatus>> & {
      currentStep?: CreateIdentityStep
    }
  }>()

  const [profile, setProfile] = useState<{
    name: string
    username: string
    country: string
  }>({
    name: '',
    username: '',
    country: '',
  })

  const createIdentifier = useCallback(async () => {
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
        (step, status) => {
          setConfirmationState((cstate) => ({
            state: {
              ...cstate?.state,
              currentStep: step,
              [step]: status,
            },
          }))
        }
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
  }, [profile, network, showCountryInPublicProfile])

  const { formValidated } = useMemo(() => {
    switch (currentPage) {
      case PageType.Name:
        return {
          formValidated:
            !isEmpty(profile.name) &&
            profile.name?.length <= PUBLIC_PROFILE_NAME_MAX_LENGTH,
        }
      // case PageType.Username:
      //   return {
      //     formValidated: true,
      //   }
      case PageType.Location:
        return { formValidated: !isEmpty(profile.country) }
      case PageType.Confirmation:
        return {
          formValidated:
            confirmationState?.state?.CreateIdentifier === 'Success' &&
            confirmationState?.state?.StorageLocation === 'Success' &&
            confirmationState?.state?.CreateProfile === 'Success',
        }
      default:
        return {}
    }
  }, [confirmationState, currentPage, profile])

  const onCountryChange = (option: Option) => {
    setProfile((p) => ({ ...p, country: option.value }))
  }

  const onNext = useCallback(() => {
    setCurrentPage((prevPage) => prevPage + 1)
    // if (currentPage < numberOfPages - 2) {
    //   pagerRef.current?.setPage(currentPage + 1)
    //   setCurrentPage(currentPage + 1)
    // } else if (currentPage === PageType.Confirmation - 1) {
    //   // navigate to last page and create identifier
    //   pagerRef.current?.setPage(PageType.Confirmation)
    //   setCurrentPage(PageType.Confirmation)

    //   setTimeout(() => {
    //     createIdentifier()
    //   }, 0)
    // }
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
        createIdentifier()
      }, 0)
    }
  }, [currentPage, createIdentityStatus, createIdentifier])

  const onBack = useCallback(() => {
    // Keyboard.dismiss()
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

  const onRetry = useCallback(() => {
    setConfirmationState({})
    createIdentifier()
  }, [createIdentifier])

  const handleRecordSeedPhraseButtonPress = useCallback(() => {
    navigation.navigate('SeedPhrase')
  }, [navigation])

  const handleDoneButtonPress = useCallback(() => {
    if (params.firstIdentity) {
      // FIXME: CreateidentityScreen is in both AuthNavigator and MainNavigator but here it's calling 'CreatePin' which is only in AuthNavigator. Even if it's controlled by 'firstIdentity' param, it's still a risk of bug.
      navigation.navigate('CreatePin') // Create a pin for the first time creating an identity
    } else {
      navigation.goBack()
    }
  }, [params.firstIdentity, navigation])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        onBack()
        return true // Manually handle Android Back press event
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )

      return () => subscription.remove()
    }, [onBack])
  )

  useEffect(() => {
    navigation.setOptions({
      headerShown: currentPage !== PageType.Confirmation,
      title: `Step ${currentPage + 1} of ${numberOfPages - 1}`,
      headerShadowVisible: false,
      headerLeft: pageData[currentPage].hasBack
        ? () => (
            <TouchableOpacity
              onPress={onBack}
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
    onBack,
    styles.headerBackButton,
    theme.color.onBackground,
  ])

  const ProgressBar = useCallback(() => {
    return currentPage !== PageType.Confirmation ? (
      <StepsIndicator
        style={{ paddingHorizontal: theme.spacing.m }}
        currentStep={currentPage}
        numberOfSteps={numberOfPages - 1}
      />
    ) : null
  }, [currentPage, theme.spacing.m])

  return (
    <ScreenWrapper
      keyboardAvoiding
      allSafeAreaEdges={
        currentPage === PageType.Confirmation // Because there is no header
      }>
      <ProgressBar />
      <PagerView
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        // onPageSelected={() => {
        //   setTimeout(() => {
        //     if (manualFocusUsenameInput && currentPage === PageType.Username) {
        //       usernameInputRef.current?.focus()
        //       setManualFocusUsenameInput(false)
        //     }
        //   }, 0)
        // }}
        ref={pagerRef}>
        <Container key='name'>
          <ScrollView
            contentContainerStyle={[
              styles.scrollViewContainer,
              styles.contentPadding,
            ]}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={false}
            keyboardShouldPersistTaps='handled'>
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
              onSubmitEditing={() => formValidated && onNext()}
            />
            <Label style={{ marginTop: 2 }}>
              Your public name is required and public
            </Label>
          </ScrollView>
        </Container>

        {/* {enabledClaimUsername && (
          <Container
            key='username'
            withKeyboardAvoidingView
            keyboadAvoidingViewProps={{ keyboardVerticalOffset: top + 60 }}>
            <ScrollView
              contentContainerStyle={[
                styles.scrollViewContainer,
                styles.contentPadding,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'>
              <Headline style={styles.title}>Username</Headline>
              <Text>Your username is unique to your identity.</Text>
              <Spacer vertical='l' />
              <FormInput
                label='Username'
                placeholder='veridaname.vda'
                suffix={profile.username ? '.vda' : undefined}
                ref={usernameInputRef}
                withAnimatedChecbox={profile.username.length > 0}
                keyboardType='url'
                autoCapitalize='none'
                autoCorrect={false}
                autoFocus={false}
                autoComplete='off'
                loading={checkingUsername}
                onChangeText={(text) => {
                  setProfile((p) => ({ ...p, username: text }))
                }}
                onBlur={() => {
                  if (profile.username.length > 0) checkUsername()
                }}
                onFocus={() => {
                  setUsernameError(undefined)
                }}
                value={profile.username}
                checked={availableUsername}
                errorMessage={usernameError}
              />
              <Label style={{ marginTop: 2 }}>
                Your username is public and optional
              </Label>
            </ScrollView>
          </Container>
        )} */}

        <Container key='location'>
          <ScrollView
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{
              ...styles.contentPadding,
              paddingBottom: theme.spacing.xxxxl,
            }}>
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
              onChangeItem={onCountryChange}
            />
            <Spacer vertical='m' />
            <AnimatedCheckbox
              checked={showCountryInPublicProfile}
              onToggle={toggleCountryCheckbox}
              label='Show country in my public profile'
              textStyle={{ fontSize: theme.fontSize.m }}
            />
            <NetworkSelectorRadioButtonGroup
              selectedNetwork={network}
              onSelectionChange={setNetwork}
              style={styles.networkSelection}
            />
          </ScrollView>
        </Container>
        <Container key='confirmation'>
          <View
            style={[
              styles.landing,
              { marginTop: Platform.OS === 'ios' ? 0 : top }, // Some layout trick for Android, TODO: reafactor
            ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={false}
              contentContainerStyle={{
                ...styles.contentPadding,
              }}>
              <View
                // TODO: Use <StatusInfo> component instead
                style={{
                  width: 128,
                  height: 128,
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                {createIdentityStatus === 'success' ? (
                  <SuccessTick />
                ) : createIdentityStatus === 'error' ? (
                  <FailureCross />
                ) : (
                  <>
                    <BlurCircle />
                    <LottieView
                      source={require('assets/animations/dots-loader.json')}
                      autoPlay
                      loop
                      style={styles.dotsLoader}
                    />
                  </>
                )}
              </View>

              <Headline
                style={[styles.title, { alignSelf: 'center', fontSize: 28 }]}>
                {createIdentityStatus === 'success'
                  ? 'Success!'
                  : createIdentityStatus === 'error'
                    ? 'Something went wrong'
                    : 'Building your identity'}
              </Headline>
              <Text
                style={[
                  {
                    alignSelf: 'center',
                    fontSize: theme.fontSize.l,
                    color: theme.color.textLightGrey,
                  },
                ]}>
                {createIdentityStatus === 'success'
                  ? 'Your identity has been successfully created'
                  : createIdentityStatus === 'error'
                    ? createIdentityErrorMessage
                    : 'Please wait...'}
              </Text>
              <Spacer vertical='xxl' />
              <AnimatedCheckbox
                checked={
                  confirmationState?.state?.CreateIdentifier === 'Success'
                }
                failed={
                  confirmationState?.state?.CreateIdentifier === 'Failure'
                }
                loading={
                  confirmationState?.state?.CreateIdentifier === 'Loading'
                }
                label='Creating your decentralized identity'
              />
              {enabledClaimUsername && (
                <>
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={
                      confirmationState?.state?.ClaimUsername === 'Success'
                    }
                    failed={
                      confirmationState?.state?.ClaimUsername === 'Failure'
                    }
                    loading={
                      confirmationState?.state?.ClaimUsername === 'Loading'
                    }
                    label='Claim username'
                  />
                </>
              )}
              <Spacer vertical='m' />
              <AnimatedCheckbox
                checked={
                  confirmationState?.state?.StorageLocation === 'Success'
                }
                failed={confirmationState?.state?.StorageLocation === 'Failure'}
                loading={
                  confirmationState?.state?.StorageLocation === 'Loading'
                }
                label='Connecting to your storage nodes'
              />
              <Spacer vertical='m' />
              <AnimatedCheckbox
                checked={confirmationState?.state?.CreateProfile === 'Success'}
                failed={confirmationState?.state?.CreateProfile === 'Failure'}
                loading={confirmationState?.state?.CreateProfile === 'Loading'}
                label='Creating your public profile'
              />
            </ScrollView>
          </View>
        </Container>
      </PagerView>
      <BottomActionBar
        hideBorder
        actionsOrientation='column'
        actions={
          currentPage !== PageType.Confirmation
            ? [
                {
                  label: 'Next',
                  onPress: onNext,
                  disabled: !formValidated,
                },
              ]
            : createIdentityStatus === 'success'
              ? [
                  {
                    label: 'Record Seed Phrase',
                    color: 'transparent-border',
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
                      onPress: onRetry,
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
    landing: {
      flex: 1,
    },
    title: {
      color: theme.color.onBackground,
      marginBottom: 10,
    },
    termAndCondition: {
      marginTop: theme.spacing.m,
      color: theme.color.onBackground,
    },
    pagerView: {
      flex: 1,
    },
    scrollViewContainer: {
      flexGrow: 1,
      paddingBottom: theme.spacing.xxl,
    },
    contentPadding: {
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
    },
    dotsLoader: {
      width: 48,
      height: 48,
      position: 'absolute',
    },
    networkSelection: {
      marginTop: theme.spacing.l,
    },
  })
}
