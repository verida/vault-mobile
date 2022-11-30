import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import { COUNTRIES } from 'helpers/country-list'
import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import Animated from 'react-native-reanimated'

import AccountManager from 'api/AccountManager'
import { CreateIdentityStepStatus, CreateIdentityStepType } from 'api/types'
import Button from 'components/Button'
import AnimatedCheckbox from 'components/Checkbox/AnimatedCheckbox'
import { FormInput } from 'components/Input/FormInput'
import Screen from 'components/Screen'
import DropDownPicker, { Option } from 'components/Select'
import { Spacer } from 'components/Spacer'
import TCCheckbox from 'components/TCCheckbox'
import { Caption } from 'components/Typography/Caption'
import { Headline } from 'components/Typography/Headline'
import { Paragraph } from 'components/Typography/Paragraph'
import { Title } from 'components/Typography/Title'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import InputStyles from 'styles/inputs'
import { Theme } from 'styles/types'

const AnimatedPager = Animated.createAnimatedComponent(PagerView)

const pageData = [
  {
    key: 'start',
    hasNext: false,
    hasBack: true,
  },
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

const numberOfPage = 4

const CreateIdentity = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(creatStyles)
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const [agreedTC, setAgreedTC] = useState(false)
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

  const claimUsername = useCallback(async () => {
    // FIXME: Remove fake claim-username request
    setConfromationState((cstate) => ({
      state: {
        ...cstate?.state,
        ['DefineNameAndUsername']: 'Loading',
      },
    }))
    setTimeout(() => {
      setConfromationState((cstate) => ({
        state: {
          ...cstate?.state,
          ['DefineNameAndUsername']:
            Math.random() >= 0.5 ? 'Success' : 'Failure',
        },
      }))
    }, 3000)
  }, [])

  const [confromationState, setConfromationState] = useState<{
    state?: Partial<
      Record<CreateIdentityStepType, CreateIdentityStepStatus>
    > & {
      currentStep?: CreateIdentityStepType
    }
  }>()

  const [profile, setProfile] = useState<{
    name: string
    username: string
    country: string
  }>({
    name: '',
    username: '',
    country: 'Australia', // FIXME: Use default Australia for now
  })

  const creatIdentifier = useCallback(() => {
    setTimeout(async () => {
      try {
        // TODO: remove fake request
        claimUsername()

        await AccountManager.getInstance().createAccount(
          {
            name: profile.name,
            country: profile?.country,
            description: '',
          },
          profile?.country,
          (step, status) => {
            setConfromationState((cstate) => ({
              state: {
                ...cstate?.state,
                currentStep: step,
                [step]: status,
              },
            }))
          }
        )

        navigation.navigate('CreatePin')
      } catch (error) {
        setShowRetry(true)
      }
    }, 0)
  }, [claimUsername, navigation, profile])

  const { formValidated } = useMemo(() => {
    switch (currentPage) {
      case 1: // Name
        return {
          formValidated:
            !isEmpty(profile.name) &&
            (isEmpty(profile.username) ||
              (!isEmpty(profile.username) && availableUsername)),
        }
      case 2: // location
        return { formValidated: true } //!isEmpty(profile.country) }
      case 3: // Confirmation
        return {
          formValidated: confromationState?.state?.CreateProfile === 'Success',
        }
      default:
        return {}
    }
  }, [
    availableUsername,
    confromationState?.state?.CreateProfile,
    currentPage,
    profile,
  ])

  const onCountryChange = (option: Option) => {
    setProfile((p) => ({ ...p, country: option.value }))
  }

  function toggleAgreedTC() {
    setAgreedTC((prevState) => !prevState)
  }

  return (
    <Screen withSafeAreaView withKeyboardAvoidingView>
      <View style={styles.main}>
        <AnimatedPager
          style={styles.pagerView}
          initialPage={currentPage}
          scrollEnabled={false}
          onPageSelected={(event) => {
            setCurrentPage(event.nativeEvent.position)
          }}
          ref={pagerRef}
          overScrollMode='never'>
          <View key='start'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <View>
                  <Headline style={styles.title}>Identity</Headline>
                  <Spacer vertical='xxl' />
                  <TCCheckbox
                    checked={agreedTC}
                    style={styles.termAndCondition}
                    onToggle={toggleAgreedTC}
                  />
                  <Title style={styles.subTitle}>
                    Create your Verida identity
                  </Title>
                  <Spacer vertical='xxl' />
                  <Button
                    disabled={!agreedTC}
                    style={styles.actionButton}
                    onPress={() => {
                      pagerRef.current?.setPage(currentPage + 1)
                      setCurrentPage(currentPage + 1)
                    }}>
                    Create Identity
                  </Button>
                  <Spacer vertical='xxl' />
                  <Title style={styles.subTitle}>
                    Already have a Verida Identity?
                  </Title>
                  <Spacer vertical='xxl' />
                  <Button
                    disabled={!agreedTC}
                    color='transparent'
                    style={styles.actionButton}
                    onPress={() => {
                      navigation.navigate('SeedPhraseEntered')
                    }}>
                    Import Identity
                  </Button>
                </View>
              </View>
            </View>
          </View>
          <View key='name'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <ScrollView
                  contentContainerStyle={styles.scrollViewContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps='handled'>
                  <Headline style={styles.title}>Name and Username</Headline>
                  <Spacer vertical='xxxl' />
                  <FormInput
                    label='Public Name *'
                    onChangeText={(text) =>
                      setProfile((p) => ({ ...p, name: text }))
                    }
                    value={profile.name}
                  />
                  <Spacer vertical='m' />
                  <Paragraph>
                    This name is public, use whatever you like. It is required
                    as used across the UI and dApps
                  </Paragraph>
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
                </ScrollView>
              </View>
            </View>
          </View>
          <View key='location'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps='handled'>
                  <Headline style={styles.title}>
                    Location of your data
                  </Headline>
                  <Spacer vertical='xxxl' />
                  <Paragraph>You are the owner of your data</Paragraph>
                  <Spacer vertical='m' />
                  <Paragraph>It is stored on multiple storage nodes.</Paragraph>
                  <Spacer vertical='xxxxl' />
                  <DropDownPicker
                    searchable
                    searchablePlaceholder='Search for country'
                    showArrow
                    placeholder=''
                    items={COUNTRIES}
                    containerStyle={InputStyles.select}
                    onChangeItem={onCountryChange}
                  />
                  <Spacer vertical='xxxxl' />
                  <Paragraph>
                    {
                      'Your country is private, we only use it to determine the best geographycal location of your data.'
                    }
                  </Paragraph>
                </ScrollView>
              </View>
            </View>
          </View>
          <View key='confirmation'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Headline style={styles.title}>
                    We are building your Identity
                  </Headline>
                  <Spacer vertical='xxxl' />
                  <AnimatedCheckbox
                    checked={
                      confromationState?.state?.CreateIdentifier === 'Success'
                    }
                    failed={
                      confromationState?.state?.CreateIdentifier === 'Failure'
                    }
                    showLoading={
                      confromationState?.state?.CreateIdentifier === 'Loading'
                    }
                    label='Create identifier'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.onSuccess}
                    boxOutlineColor={theme.color.gray400}
                  />
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={
                      confromationState?.state?.DefineNameAndUsername ===
                      'Success'
                    }
                    failed={
                      confromationState?.state?.DefineNameAndUsername ===
                      'Failure'
                    }
                    showLoading={
                      confromationState?.state?.DefineNameAndUsername ===
                      'Loading'
                    }
                    label='Claim username'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.onSuccess}
                    boxOutlineColor={theme.color.gray400}
                  />
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={
                      confromationState?.state?.StorageLocation === 'Success'
                    }
                    showLoading={
                      confromationState?.state?.StorageLocation === 'Loading'
                    }
                    label='Connect storage nodes'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.onSuccess}
                    boxOutlineColor={theme.color.gray400}
                  />
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={
                      confromationState?.state?.CreateProfile === 'Success'
                    }
                    showLoading={
                      confromationState?.state?.CreateProfile === 'Loading'
                    }
                    label='Create public profile'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.onSuccess}
                    boxOutlineColor={theme.color.gray400}
                  />
                </ScrollView>
              </View>
            </View>
          </View>
        </AnimatedPager>
        <View style={styles.bottomNavContainer}>
          {(pageData[currentPage].hasBack || showRetry) && (
            <Button
              color='transparent'
              style={styles.backButton}
              onPress={() => {
                if (currentPage > 0) {
                  pagerRef.current?.setPage(currentPage - 1)
                  setCurrentPage(currentPage - 1)
                  showRetry && setShowRetry(false)
                } else {
                  navigation.goBack()
                }
              }}>
              Back
            </Button>
          )}
          {!showRetry && pageData[currentPage].hasNext && (
            <Button
              style={styles.nextButton}
              disabled={!formValidated}
              onPress={() => {
                if (currentPage < numberOfPage - 1) {
                  pagerRef.current?.setPage(currentPage + 1)
                  setCurrentPage(currentPage + 1)
                  if (currentPage === 2) {
                    creatIdentifier()
                  }
                }
              }}>
              Next
            </Button>
          )}
          {showRetry && (
            <Button
              style={styles.retryButton}
              onPress={() => {
                setShowRetry(false)
                creatIdentifier()
              }}>
              Retry
            </Button>
          )}
        </View>
      </View>
    </Screen>
  )
}

const creatStyles = (theme: Theme) => {
  return StyleSheet.create({
    main: {
      flex: 1,
      paddingHorizontal: theme.spacing.l,
    },
    bottomNavContainer: {
      marginTop: theme.spacing.sm,
      height: 48,
      flexDirection: 'row',
      width: '100%',
      alignSelf: 'flex-end',
    },
    actionButton: {
      width: '50%',
      alignSelf: 'center',
    },
    backButton: {
      position: 'absolute',
      left: 0,
      paddingHorizontal: theme.spacing.l,
    },
    nextButton: {
      position: 'absolute',
      right: 0,
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

    positionAbsolute: {
      ...StyleSheet.absoluteFillObject,
      position: 'absolute',
      paddingTop: theme.spacing.xxxl,
      justifyContent: 'space-between',
    },
    landing: {
      flex: 1,
    },
    title: {
      color: theme.color.onBackground,
    },
    subTitle: {
      marginTop: theme.spacing.xxxl,
    },
    termAndCondition: {
      marginTop: theme.spacing.m,
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

export default CreateIdentity
