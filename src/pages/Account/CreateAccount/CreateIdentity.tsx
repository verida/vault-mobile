import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import { COUNTRIES } from 'helpers/country-list'
import isEmpty from 'lodash/isEmpty'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import PagerView from 'react-native-pager-view'
import Animated, { useEvent, useHandler } from 'react-native-reanimated'

import AccountManager from 'api/AccountManager'
import AnimatedCheckbox from 'components/Checkbox/AnimatedCheckbox'
import { FormInput } from 'components/Input/FormInput'
import Screen from 'components/Screen'
import DropDownPicker, { Option } from 'components/Select'
import { Spacer } from 'components/Spacer'
import TCCheckbox from 'components/TCCheckbox'
import { Headline } from 'components/Typography/Headline'
import { Paragraph } from 'components/Typography/Paragraph'
import { Title } from 'components/Typography/Title'
import { BLACK_COLOR } from 'constants/color'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import InputStyles from 'styles/inputs'
import { Theme } from 'styles/types'

import Button from '../../../components/Button'

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
    hasBack: false,
  },
  {
    key: 'location',
    hasNext: true,
    hasBack: true,
  },
  {
    key: 'confirmation',
    hasNext: true,
    hasBack: false,
  },
]

export function usePagerScrollHandler(handlers: any, dependencies?: any) {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies)
  const subscribeForEvents = ['onPageScroll']

  return useEvent<any>(
    (event) => {
      'worklet'
      const { onPageScroll } = handlers
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event, context)
      }
    },
    subscribeForEvents,
    doDependenciesDiffer
  )
}

const blurHashs = [
  'LGFFaXYk^6#M@-5c,1J5@[or[Q9.',
  'LGFFaXYk^6#M@-5c,1J5@[or[Q6.',
]

type CreateAccountStepType =
  | 'CreateIdentifier'
  | 'ClaimUsername'
  | 'StorageLocation'
  | 'CreateProfile'

type CreateAccountStepStatus = 'None' | 'Loading' | 'Success' | 'Failure'

const numberOfPage = 4

const CreateIdentity = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(creatStyles)
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const [processing, setProcessing] = useState(false)
  const [agreedTC, setAgreedTC] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [availableUsername, setAvailableUsername] = useState(false)

  const checkUsername = useCallback(async () => {
    // FIXME: Remove fake check-username availability request
    setCheckingUsername(true)
    setTimeout(() => {
      setAvailableUsername(Math.random() >= 0.3)
      setCheckingUsername(false)
    }, 3000)
  }, [])

  const claimUsername = useCallback(async () => {
    // FIXME: Remove fake claim-username request
    setConfromationState((cstate) => ({
      state: {
        ...cstate?.state,
        ['ClaimUsername']: 'Loading',
      },
    }))
    setTimeout(() => {
      setConfromationState((cstate) => ({
        state: {
          ...cstate?.state,
          ['ClaimUsername']: Math.random() >= 0.3 ? 'Success' : 'Failure',
        },
      }))
    }, 3000)
  }, [])

  const [confromationState, setConfromationState] = useState<{
    state?: {
      currentStep?: CreateAccountStepType
      CreateIdentifier?: CreateAccountStepStatus
      ClaimUsername?: CreateAccountStepStatus
      StorageLocation?: CreateAccountStepStatus
      CreateProfile?: CreateAccountStepStatus
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

  const creatIdentifier = useCallback(() => {
    setProcessing(true)
    setTimeout(async () => {
      try {
        // TODO: remove fake request
        claimUsername()

        await AccountManager.getInstance().createAccount(
          {
            name: profile.name,
            country: profile?.country || '',
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
        setProcessing(false)
        Alert.alert('Error', 'Failed to create account, please try again later')
      }
    }, 0)
  }, [claimUsername, navigation, profile])

  const { formValidated, nextButtonText, nextButtonColor } = useMemo(() => {
    switch (currentPage) {
      case 1: // Name
        return {
          formValidated:
            !isEmpty(profile.name) &&
            (isEmpty(profile.username) ||
              (!isEmpty(profile.username) && availableUsername)),
        }
      case 2: // location
        return { formValidated: !isEmpty(profile.country) }
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

  const handler = usePagerScrollHandler({
    onPageScroll: (e: any) => {
      'worklet'
      console.log(e.offset, e.position)
    },
  })

  const onCountryChange = (option: Option) => {
    setProfile((p) => ({ ...p, country: option.value }))
  }

  function toggleAgreedTC() {
    setAgreedTC((prevState) => !prevState)
  }

  return (
    <Screen withSafeAreaView withKeyboardAvoidingView>
      <Blurhash
        blurhash={blurHashs[Math.floor(Math.random() * blurHashs.length)]}
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.3 }}
      />
      <View style={styles.main}>
        <AnimatedPager
          style={styles.pagerView}
          initialPage={currentPage}
          scrollEnabled={false}
          onPageSelected={(event) => {
            setCurrentPage(event.nativeEvent.position)
          }}
          ref={pagerRef}
          overScrollMode='never'
          onPageScroll={handler}>
          <View key='start'>
            <View style={styles.landing}>
              {/* <Texture width={425} height={428} /> */}
              <View style={styles.positionAbsolute}>
                <View>
                  <Headline style={styles.title}>Identity</Headline>
                  <Title style={styles.subTitle}>
                    Create your Verida identity...
                  </Title>
                  <TCCheckbox
                    checked={agreedTC}
                    style={styles.termAndCondition}
                    onToggle={toggleAgreedTC}
                  />
                  <Spacer vertical='xxxl' />
                  <Button
                    disabled={!agreedTC}
                    style={styles.actionButton}
                    onPress={() => {
                      pagerRef.current?.setPage(currentPage + 1)
                      setCurrentPage(currentPage + 1)
                    }}>
                    Create Identity
                  </Button>
                  <Spacer vertical='xxxxl' />
                  <Title style={styles.subTitle}>
                    Already have an existring Verida Identity? Import it.
                  </Title>
                  <Spacer vertical='sm' />
                  <Button
                    disabled={!agreedTC}
                    style={styles.actionButton}
                    onPress={() => {
                      navigation.navigate('SeedPhraseEntered')
                    }}>
                    Import Identity
                  </Button>
                </View>
                <Spacer vertical='xxxl' />
              </View>
            </View>
          </View>
          <View key='name'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <ScrollView
                  contentContainerStyle={styles.scrollViewContainer}
                  showsVerticalScrollIndicator={false}>
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
                    your identity and allows you to...
                  </Paragraph>
                  <Spacer vertical='xxl' />
                  <FormInput
                    label='Check your username is available'
                    withAnimatedChecbox={profile.username.length > 0}
                    disabled={checkingUsername}
                    autoCapitalize='none'
                    autoCorrect={false}
                    loading={checkingUsername}
                    onChangeText={(text) =>
                      setProfile((p) => ({ ...p, username: text }))
                    }
                    onInputBlur={() => {
                      if (profile.username.length > 0) checkUsername()
                    }}
                    value={profile.username}
                    checked={availableUsername}
                  />
                </ScrollView>
              </View>
            </View>
          </View>
          <View key='location'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Headline style={styles.title}>
                    Location of your data
                  </Headline>
                  <Spacer vertical='xxxl' />
                  <Paragraph>You are the owner of your data</Paragraph>
                  <Spacer vertical='m' />
                  <Paragraph>
                    It is stored on multiple storage nides with your...
                  </Paragraph>
                  <Spacer height={100} />
                  <DropDownPicker
                    searchable
                    disabled={processing}
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
                    showLoading={
                      confromationState?.state?.CreateIdentifier === 'Loading'
                    }
                    label='Create Identifier'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.onSuccess}
                    boxOutlineColor={theme.color.gray400}
                  />
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={
                      confromationState?.state?.ClaimUsername === 'Success'
                    }
                    showLoading={
                      confromationState?.state?.ClaimUsername === 'Loading'
                    }
                    label='Claim Username'
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
                    label='Select Storage Locations'
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
                    label='Create Profille'
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
          {pageData[currentPage].hasBack && (
            <Button
              color='transparent'
              style={styles.backButton}
              onPress={() => {
                if (currentPage > 0) {
                  pagerRef.current?.setPage(currentPage - 1)
                  setCurrentPage(currentPage - 1)
                } else {
                  navigation.goBack()
                }
              }}>
              Back
            </Button>
          )}
          {pageData[currentPage].hasNext && formValidated && (
            <Button
              style={styles.nextButton}
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
      color: BLACK_COLOR,
    },
    pagerView: {
      flex: 1,
    },
    scrollViewContainer: {
      paddingBottom: theme.spacing.xxl,
    },
  })
}

export default CreateIdentity
