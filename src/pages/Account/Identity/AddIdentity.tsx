import { useFocusEffect, useNavigation } from '@react-navigation/native'
import color from 'color'
import { useTheme } from 'contexts/ThemeContext'
import { COUNTRIES } from 'helpers/country-list'
import isEmpty from 'lodash/isEmpty'
import LottieView from 'lottie-react-native'
import { Icon } from 'native-base'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AccountManager from 'api/AccountManager'
import { AddIdentityStepStatus, AddIdentityStepType } from 'api/types'
import AlertIcon from 'assets/alert_icon_2.svg'
import BlurCircle from 'assets/blur_circle.svg'
import FailureCross from 'assets/failure_cross.svg'
import SuccessTick from 'assets/success_tick.svg'
import Button from 'components/Button'
import AnimatedCheckbox from 'components/Checkbox/AnimatedCheckbox'
import Container from 'components/Container'
import { StepsIndicator } from 'components/Indicators'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import DropDownPicker, { Option } from 'components/Select'
import { Spacer } from 'components/Spacer'
import { Headline } from 'components/Typography/Headline'
import { Label } from 'components/Typography/Label'
import { Paragraph } from 'components/Typography/Paragraph'
import { Text } from 'components/Typography/Text'
import { PUBLIC_PROFILE_NAME_MAX_LENGTH } from 'constants/profile'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import InputStyles from 'styles/inputs'
import { Theme } from 'styles/types'

import { AddIdentityMode } from './Identity'

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

const AddIdentity = () => {
  const navigation = useNavigation()
  const params = useParams<{ mode?: AddIdentityMode }>()
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(creatStyles)
  const { top } = useSafeAreaInsets()
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(PageType.Name)
  const [enabledClaimUsername] = useState(false) // FIXME: disable input username
  const [processing, setProcessing] = useState(false)

  const [showCountryInPublicProfile, setShowCountryOnPublicProfile] =
    useState(true)
  function toggleCountryCheckbox() {
    setShowCountryOnPublicProfile((prevState) => !prevState)
  }

  const [showRetry, setShowRetry] = useState(false)
  const [createAccountErrorMessage, setCreateAccountErrorMessage] = useState('')
  const [isDoneCreateAccount, setDoneCreateAccount] = useState(false)

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
    state?: Partial<Record<AddIdentityStepType, AddIdentityStepStatus>> & {
      currentStep?: AddIdentityStepType
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
      setProcessing(true)
      setShowRetry(false)

      await AccountManager.getInstance().createAccount(
        {
          name: profile.name?.trim() ?? '',
          username: profile.username ?? '',
          country: showCountryInPublicProfile ? profile?.country : '',
          description: '',
        },
        profile?.country,
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

      setDoneCreateAccount(true)
    } catch (error: any) {
      if (
        error.message ===
        'Unable to force creation of storage context for this DID'
      ) {
        setCreateAccountErrorMessage(
          'Blockchain is temporarily unavailable, please try again later.'
        )
      } else {
        setCreateAccountErrorMessage(
          'Unable to create account at this time, please try again later.'
        )
      }
      setShowRetry(true)
    }
    setProcessing(false)
  }, [profile, showCountryInPublicProfile])

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
    if (currentPage < numberOfPages - 2) {
      pagerRef.current?.setPage(currentPage + 1)
      setCurrentPage(currentPage + 1)
    } else if (currentPage === PageType.Confirmation - 1) {
      // navigate to last page and create identifier
      pagerRef.current?.setPage(PageType.Confirmation)
      setCurrentPage(PageType.Confirmation)
      setProcessing(true)

      setTimeout(() => {
        createIdentifier()
      }, 0)
    }
  }, [createIdentifier, currentPage])

  const onBack = useCallback(() => {
    // Keyboard.dismiss()
    if (processing) {
      // Useful for handling hardware back button on Android
      Alert.alert("Hold on, we're building your Identity")
      return
    }

    setTimeout(() => {
      if (currentPage > 0) {
        pagerRef.current?.setPage(currentPage - 1)
        setCurrentPage(currentPage - 1)
        showRetry && setShowRetry(false)
      } else {
        navigation.goBack()
      }
    }, 0)
  }, [currentPage, navigation, processing, showRetry])

  const onRetry = useCallback(() => {
    setConfirmationState({})
    createIdentifier()
  }, [createIdentifier])

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

  const renderTopNav = useCallback(() => {
    return currentPage !== PageType.Confirmation ? (
      <>
        <NavigationHeader
          title={`Step ${currentPage + 1} of ${numberOfPages - 1}`}
          bottomBorder={false}
          left={
            pageData[currentPage].hasBack || showRetry
              ? {
                  icon: (
                    <Icon
                      name='arrow-back'
                      style={{ color: theme.color.icon }}
                    />
                  ),
                  action: () => onBack(),
                }
              : ({} as any)
          }
        />
        <StepsIndicator
          style={{ paddingHorizontal: theme.spacing.m }}
          currentStep={currentPage}
          numberOfSteps={numberOfPages - 1}
        />
      </>
    ) : null
  }, [currentPage, onBack, showRetry, theme.color.icon, theme.spacing.m])

  const renderBottomButtons = useCallback(() => {
    return (
      <View style={styles.bottomNavContainer}>
        {currentPage !== PageType.Confirmation && (
          <>
            {
              // currentPage === PageType.Username && (
              //   <Button
              //     color='transparent'
              //     style={styles.nextButton}
              //     disabled={!formValidated}
              //     onPress={() => {
              //       setProfile((p) => ({
              //         ...p,
              //         username: '',
              //       }))
              //       onNext()
              //     }}>
              //     Skip
              //   </Button>
              // )
            }

            <Button
              style={styles.nextButton}
              disabled={!formValidated}
              onPress={onNext}>
              Next
            </Button>
          </>
        )}

        {currentPage === PageType.Confirmation ? (
          showRetry ? (
            <Button
              style={styles.button}
              disabled={formValidated}
              onPress={onRetry}>
              Retry
            </Button>
          ) : !processing ? (
            <View>
              <View style={styles.seedPhraseRemindView}>
                <View style={{ alignItems: 'center', marginTop: 3 }}>
                  <AlertIcon />
                </View>
                <Text
                  style={{
                    flex: 1,
                    marginLeft: theme.spacing.s,
                  }}>
                  Record your seed phrase to create a backup for your identity.
                  You can do it later.
                </Text>
              </View>
              <Button
                style={styles.button}
                color='transparent-border'
                onPress={() => navigation.navigate('SeedPhrase')}>
                Record Seed Phrase
              </Button>
              <Button
                style={styles.button}
                onPress={() => {
                  params.mode === AddIdentityMode.Add
                    ? navigation.goBack()
                    : navigation.navigate('CreatePin') // Create a pin for the first time create an account
                }}>
                Done
              </Button>
            </View>
          ) : null
        ) : null}
      </View>
    )
  }, [
    currentPage,
    formValidated,
    navigation,
    onNext,
    onRetry,
    params,
    processing,
    showRetry,
    styles,
    theme.spacing.s,
  ])

  return (
    <Screen withSafeAreaView navBar={renderTopNav()}>
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
        <Container
          key='name'
          withKeyboardAvoidingView
          keyboadAvoidingViewProps={{ keyboardVerticalOffset: top + 60 }}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollViewContainer,
              styles.contentPadding,
            ]}
            showsVerticalScrollIndicator={false}
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
          {renderBottomButtons()}
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
            {renderBottomButtons()}
          </Container>
        )} */}

        <Container key='location'>
          <ScrollView
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
              highlightColor={theme.color.success}
              checkmarkColor={theme.color.onSuccess}
              boxOutlineColor={theme.color.grey400}
              textStyle={{ fontSize: theme.fontSize.m }}
            />
            {/* Add more space to alow scroll on showing the dropdown list */}
            <Spacer height={320} />
          </ScrollView>
          {renderBottomButtons()}
        </Container>
        <Container key='confirmation'>
          <View
            style={[
              styles.landing,
              { marginTop: Platform.OS === 'ios' ? 0 : top }, // Some layout trick for Android, TODO: reafactor
            ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                ...styles.contentPadding,
              }}>
              <View
                style={{
                  width: 128,
                  height: 128,
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                {processing ? (
                  <>
                    <BlurCircle />
                    <LottieView
                      source={require('assets/animations/dots-loader.json')}
                      autoPlay
                      loop
                      style={styles.dotsLoader}
                    />
                  </>
                ) : isDoneCreateAccount ? (
                  <SuccessTick />
                ) : (
                  <FailureCross />
                )}
              </View>

              <Headline
                style={[styles.title, { alignSelf: 'center', fontSize: 28 }]}>
                {isDoneCreateAccount
                  ? 'Success!'
                  : showRetry
                  ? 'Something went wrong'
                  : 'Building your Identity'}
              </Headline>
              <Text
                style={[
                  {
                    alignSelf: 'center',
                    fontSize: theme.fontSize.l,
                    color: theme.color.textLightGrey,
                  },
                ]}>
                {isDoneCreateAccount
                  ? 'Your Identity has been successfully created'
                  : showRetry
                  ? createAccountErrorMessage
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
                showLoading={
                  confirmationState?.state?.CreateIdentifier === 'Loading'
                }
                label='Creating your decentralized identity'
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.grey400}
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
                    showLoading={
                      confirmationState?.state?.ClaimUsername === 'Loading'
                    }
                    label='Claim username'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.onSuccess}
                    boxOutlineColor={theme.color.grey400}
                  />
                </>
              )}
              <Spacer vertical='m' />
              <AnimatedCheckbox
                checked={confirmationState?.state?.CreateProfile === 'Success'}
                failed={confirmationState?.state?.CreateProfile === 'Failure'}
                showLoading={
                  confirmationState?.state?.CreateProfile === 'Loading'
                }
                label='Creating your public profile'
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.grey400}
              />
              <Spacer vertical='m' />
              <AnimatedCheckbox
                checked={
                  confirmationState?.state?.StorageLocation === 'Success'
                }
                failed={confirmationState?.state?.StorageLocation === 'Failure'}
                showLoading={
                  confirmationState?.state?.StorageLocation === 'Loading'
                }
                label='Connecting to your storage nodes'
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.grey400}
              />
            </ScrollView>
          </View>
          {renderBottomButtons()}
        </Container>
      </PagerView>
    </Screen>
  )
}

const creatStyles = (theme: Theme) => {
  return StyleSheet.create({
    main: {
      flex: 1,
      backgroundColor: theme.color.surface,
    },
    bottomNavContainer: {
      width: '100%',
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.m,
    },
    nextButton: {
      height: 48,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.s,
      marginBottom: 0,
    },
    button: {
      height: 48,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.s,
      marginBottom: 0,
    },
    landing: {
      flex: 1,
    },
    title: {
      color: theme.color.onBackground,
      marginBottom: 10,
    },
    subTitle: {
      color: theme.color.textLightGrey,
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
    center: {
      alignItems: 'center',
      justifyContent: 'center',
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
    seedPhraseRemindView: {
      flexDirection: 'row',
      borderColor: theme.color.warning,
      backgroundColor: color.rgb(theme.color.warning).alpha(0.1).toString(),
      borderWidth: 1,
      borderRadius: 3,
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      marginHorizontal: theme.spacing.m,
    },
  })
}

export default AddIdentity
