import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import { COUNTRIES } from 'helpers/country-list'
import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert, BackHandler, ScrollView, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'

import AccountManager from 'api/AccountManager'
import { AddIdentityStepStatus, AddIdentityStepType } from 'api/types'
import Button from 'components/Button'
import AnimatedCheckbox from 'components/Checkbox/AnimatedCheckbox'
import { FormInput } from 'components/Input/FormInput'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import DropDownPicker, { Option } from 'components/Select'
import { Spacer } from 'components/Spacer'
import { Headline } from 'components/Typography/Headline'
import { Label } from 'components/Typography/Label'
import { Paragraph } from 'components/Typography/Paragraph'
import useParams from 'hooks/useParams'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import InputStyles from 'styles/inputs'
import { Theme } from 'styles/types'

const pageData = [
  {
    key: 'name',
    hasNext: true,
    hasBack: true,
  },
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

export enum AddIdentityMode {
  CreateNew,
  Add,
}

enum PageType {
  Name,
  Location,
  Confirmation,
}

const AddIdentity = () => {
  const navigation = useNavigation()
  const params = useParams<{ mode?: AddIdentityMode }>()
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(creatStyles)
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(PageType.Name)
  const [enabledClaimUsername] = useState(false) // FIXME: disable input username
  const [processing, setProcessing] = useState(false)

  const [checkingUsername, setCheckingUsername] = useState(false)
  const [availableUsername, setAvailableUsername] = useState(false)
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined
  )
  const [showRetry, setShowRetry] = useState(false)

  const checkUsername = useCallback(async () => {
    // FIXME: Remove fake check-username availability request
    setCheckingUsername(true)
    setTimeout(() => {
      if (Math.random() >= 0.5) {
        setAvailableUsername(true)
        setUsernameError(undefined)
      } else {
        setAvailableUsername(false)
        setUsernameError('Username is taken')
      }

      setCheckingUsername(false)
    }, 3000)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const claimUsername = useCallback(async () => {
    // FIXME: Remove fake claim-username request
    setConfirmationState((cstate) => ({
      state: {
        ...cstate?.state,
        ['DefineNameAndUsername']: 'Loading',
      },
    }))
    setTimeout(() => {
      setConfirmationState((cstate) => ({
        state: {
          ...cstate?.state,
          ['DefineNameAndUsername']:
            Math.random() >= 0.5 ? 'Success' : 'Failure',
        },
      }))
    }, 3000)
  }, [])

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

      // TODO: remove fake request
      // claimUsername()

      await AccountManager.getInstance().createAccount(
        {
          name: profile.name,
          country: profile?.country,
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

      params.mode === AddIdentityMode.Add
        ? navigation.goBack()
        : navigation.navigate('CreatePin') // Create a pin for the first time create an account
    } catch (error) {
      setShowRetry(true)
    }
    setProcessing(false)
  }, [navigation, params.mode, profile?.country, profile.name])

  const { formValidated } = useMemo(() => {
    switch (currentPage) {
      case PageType.Name:
        console.log('profile.name', profile.name)
        return {
          formValidated: !isEmpty(profile.name),
        }
      case PageType.Location:
        return { formValidated: true }
      case PageType.Confirmation:
        return {
          formValidated: confirmationState?.state?.CreateProfile === 'Success',
        }
      default:
        return {}
    }
  }, [confirmationState?.state?.CreateProfile, currentPage, profile])

  const onCountryChange = (option: Option) => {
    setProfile((p) => ({ ...p, country: option.value }))
  }

  const onNext = useCallback(() => {
    if (currentPage < numberOfPages - 1) {
      pagerRef.current?.setPage(currentPage + 1)
      setCurrentPage(currentPage + 1)
      if (currentPage === numberOfPages - 2) {
        // navigate to last page and create identifier
        createIdentifier()
      }
    }
  }, [createIdentifier, currentPage])

  const onBack = useCallback(() => {
    if (processing) {
      // Useful for handling hardware back button on Android
      Alert.alert("Hold on, we're building your Identity")
      return
    }

    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1)
      setCurrentPage(currentPage - 1)
      showRetry && setShowRetry(false)
    } else {
      navigation.goBack()
    }
  }, [currentPage, navigation, processing, showRetry])

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

  return (
    <Screen withSafeAreaView withKeyboardAvoidingView>
      <NavigationHeader title='Identity' />
      <View style={styles.main}>
        <PagerView
          style={styles.pagerView}
          initialPage={currentPage}
          // scrollEnabled={false}
          onPageSelected={(event) => {
            setCurrentPage(event.nativeEvent.position)
          }}
          ref={pagerRef}
          overScrollMode='auto'>
          <View key='name' style={styles.landing}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'>
              <Headline style={styles.title}>Name(1/2)</Headline>
              <Spacer vertical='xxl' />
              <Paragraph>
                Your public name can be used by applications you are connecting
                with. Use whatever you like and change it when you want.
              </Paragraph>
              <Spacer vertical='xxl' />
              <FormInput
                label='Public Name *'
                onChangeText={(text) =>
                  setProfile((p) => ({ ...p, name: text }))
                }
                value={profile.name}
              />
              <Label style={{ marginTop: 2 }}>
                Your name is required and public
              </Label>
              {enabledClaimUsername && (
                <>
                  <Spacer vertical='xxxl' />
                  <Paragraph>
                    Optionally, you can claim a Verida Username. It is linked to
                    your identity. (Coming soon)
                  </Paragraph>
                  <Spacer vertical='xxl' />
                  <FormInput
                    label='Check your username is available'
                    withAnimatedChecbox={profile.username.length > 0}
                    disabled
                    autoCapitalize='none'
                    autoCorrect={false}
                    loading={checkingUsername}
                    onChangeText={(text) =>
                      setProfile((p) => ({ ...p, username: text }))
                    }
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
                </>
              )}
            </ScrollView>
          </View>
          <View key='location' style={styles.landing}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={{ height: '100%' }}>
              <Headline style={styles.title}>Data Region (2/2)</Headline>
              <Spacer vertical='xxl' />
              <Paragraph>
                {'Your personal data is encrypted and stored on a network of decentralized servers.\n' +
                  'Select your country to determine the default servers that store your encrypted personal data. You can change both your country and the data regions later.'}
              </Paragraph>
              <Spacer vertical='xxl' />
              <Label>Country</Label>
              <DropDownPicker
                searchable
                searchablePlaceholder='Search for country'
                showArrow
                dropDownMaxHeight={200}
                placeholder=''
                items={COUNTRIES}
                containerStyle={InputStyles.select}
                onChangeItem={onCountryChange}
              />
              <Label style={{ marginTop: 2 }}>
                Your country is optional and public
              </Label>
            </ScrollView>
          </View>
          <View key='confirmation' style={styles.landing}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Headline style={styles.title}>
                We are building your Identity
              </Headline>
              <Spacer vertical='xxxl' />
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
                label='Create identifier'
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.grey400}
              />
              {enabledClaimUsername && (
                <>
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={
                      confirmationState?.state?.DefineNameAndUsername ===
                      'Success'
                    }
                    failed={
                      confirmationState?.state?.DefineNameAndUsername ===
                      'Failure'
                    }
                    showLoading={
                      confirmationState?.state?.DefineNameAndUsername ===
                      'Loading'
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
                showLoading={
                  confirmationState?.state?.CreateProfile === 'Loading'
                }
                label='Create public profile'
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.grey400}
              />
              <Spacer vertical='m' />
              <AnimatedCheckbox
                checked={
                  confirmationState?.state?.StorageLocation === 'Success'
                }
                showLoading={
                  confirmationState?.state?.StorageLocation === 'Loading'
                }
                label='Connect storage nodes'
                highlightColor={theme.color.success}
                checkmarkColor={theme.color.onSuccess}
                boxOutlineColor={theme.color.grey400}
              />
            </ScrollView>
          </View>
        </PagerView>
        <View style={styles.bottomNavContainer}>
          {/* {(pageData[currentPage].hasBack || showRetry) && (
            <Button
              color='transparent'
              style={styles.backButton}
              onPress={onBack}>
              Back
            </Button>
          )} */}

          {!showRetry && pageData[currentPage].hasNext && (
            <Button
              style={styles.nextButton}
              disabled={!formValidated}
              onPress={onNext}>
              Next
            </Button>
          )}

          {/* {showRetry && (
            <Button
              style={styles.retryButton}
              onPress={() => {
                setShowRetry(false)
                createIdentifier()
              }}>
              Retry
            </Button>
          )} */}
        </View>
      </View>
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
      marginTop: theme.spacing.sm,
      // paddingHorizontal: theme.spacing.l,
      // paddingVertical: theme.spacing.m,
      height: 48,
      flexDirection: 'row',
      width: '100%',
      alignSelf: 'flex-end',
    },
    actionButton: {
      width: '100%',
      alignSelf: 'center',
    },
    backButton: {
      position: 'absolute',
      left: theme.spacing.l,
      paddingHorizontal: theme.spacing.l,
    },
    nextButton: {
      position: 'absolute',
      right: theme.spacing.m,
      paddingHorizontal: theme.spacing.l,
    },
    retryButton: {
      position: 'absolute',
      right: 0,
      paddingHorizontal: theme.spacing.l,
      backgroundColor: theme.color.error,
      borderColor: theme.color.error,
      textcolor: theme.color.onError,
    },
    landing: {
      flex: 1,
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
    },
    title: {
      color: theme.color.onBackground,
    },
    subTitle: {
      // marginTop: theme.spacing.m,
      color: theme.color.textLightGrey,
    },
    termAndCondition: {
      marginTop: theme.spacing.xxxl,
      color: theme.color.onBackground,
    },
    pagerView: {
      flex: 1,
    },
    scrollViewContainer: {
      paddingBottom: theme.spacing.xxl,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}

export default AddIdentity
