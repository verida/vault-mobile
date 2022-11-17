import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import { COUNTRIES } from 'helpers/country-list'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Blurhash } from 'react-native-blurhash'
import PagerView from 'react-native-pager-view'
import Animated, { useEvent, useHandler } from 'react-native-reanimated'

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

const title = 'Identity'
// const info =
//   'To delete your account, please remove any record of your recovery passphrase then logout of this application. \n\n' +
//   'Please note that this operation is final - Verida has no access to your data and cannot recover your account without that passphrase.'

// const pages = {
//   start: {
//     component: () => {},
//     hasNext: true,
//     hasBack: false,
//   },
//   name: {
//     component: () => {},
//     hasNext: true,
//     hasBack: false,
//   },
//   location: {
//     component: () => {},
//     hasNext: true,
//     hasBack: true,
//   },
//   confirmation: {
//     component: () => {},
//     hasNext: true,
//     hasBack: false,
//   },
// }

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

const CreateIdentity = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(creatStyles)
  const [processing, setProcessing] = useState(false)
  const [agreedTC, setAgreedTC] = useState(false)
  const [country, setCountry] = useState<Option | null>(null)
  const [availableUsername, setAvailableUsername] = useState(false)

  const handler = usePagerScrollHandler({
    onPageScroll: (e: any) => {
      'worklet'
      console.log(e.offset, e.position)
    },
  })

  const onCountryChange = (option: Option) => {
    setCountry(option)
  }

  function toggleAgreedTC() {
    setAgreedTC((prevState) => !prevState)
  }

  useEffect(() => {
    const tid = setInterval(() => {
      setAvailableUsername((value) => !value)
    }, 5000)

    return () => {
      clearInterval(tid)
    }
  }, [])

  return (
    <Screen withSafeAreaView>
      <Blurhash
        blurhash={blurHashs[Math.floor(Math.random() * blurHashs.length)]}
        style={{ ...StyleSheet.absoluteFillObject, opacity: 0.3 }}
      />
      <View style={styles.main}>
        <AnimatedPager
          style={styles.pagerView}
          initialPage={3}
          overScrollMode='never'
          onPageScroll={handler}>
          <View key='start'>
            <View style={styles.landing}>
              {/* <Texture width={425} height={428} /> */}
              <View style={styles.positionAbsolute}>
                <View>
                  <Headline style={styles.title}>{title}</Headline>
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
                    onPress={() => {}}>
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
                      navigation.navigate('ImportAccount', null)
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
                <ScrollView>
                  <Headline style={styles.title}>Name and Username</Headline>
                  <Spacer vertical='xxxl' />
                  <FormInput label='Public Name *' />
                  <Spacer vertical='m' />
                  <Paragraph>
                    This name is public, use whatever you like. It is required
                    as used across the UI and dApps
                  </Paragraph>
                  <Spacer vertical='xxxxl' />
                  <Paragraph>
                    Optionally, you can claim a Verida Username. It is linked to
                    your identity and allows you to...
                  </Paragraph>
                  <Spacer vertical='xxl' />
                  <FormInput
                    label='Check your username is available'
                    withAnimatedChecbox={true}
                    checked={availableUsername}
                  />
                </ScrollView>
                <Spacer vertical='xxl' />
              </View>
            </View>
          </View>
          <View key='location'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <ScrollView>
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
                    Your country is private, we only use it to determine the
                    best geographycal locatiion of your data. \nIf you leave it
                    empty we will choose a default locationn
                  </Paragraph>
                </ScrollView>
                <Spacer vertical='xxl' />
              </View>
            </View>
          </View>
          <View key='confirmation'>
            <View style={styles.landing}>
              <View style={styles.positionAbsolute}>
                <ScrollView>
                  <Headline style={styles.title}>
                    We are building your Identity
                  </Headline>
                  <Spacer vertical='xxxl' />
                  <AnimatedCheckbox
                    checked={true}
                    showLoading={false}
                    label='Create Identifier'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.primary}
                    boxOutlineColor={theme.color.success}
                  />
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={false}
                    showLoading={true}
                    label='Claim Username'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.primary}
                    boxOutlineColor={theme.color.success}
                  />
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={false}
                    showLoading={false}
                    label='Select Storage Locations'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.primary}
                    boxOutlineColor={theme.color.success}
                  />
                  <Spacer vertical='m' />
                  <AnimatedCheckbox
                    checked={false}
                    showLoading={false}
                    label='Create Profille'
                    highlightColor={theme.color.success}
                    checkmarkColor={theme.color.primary}
                    boxOutlineColor={theme.color.success}
                  />
                </ScrollView>
                <Spacer vertical='xxl' />
              </View>
            </View>
          </View>
        </AnimatedPager>
        <View style={styles.bottomNavContainer}>
          <Button
            color='transparent'
            style={styles.backButton}
            onPress={() => {
              navigation.navigate('ImportAccount')
            }}>
            Back
          </Button>
          <Button
            style={styles.nextButton}
            onPress={() => {
              navigation.navigate('ImportAccount')
            }}>
            Next
          </Button>
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
      height: 48,
      flex: 0,
      // paddingHorizontal: 24,
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignSelf: 'flex-end',
    },
    actionButton: {
      width: '50%',
      // paddingHorizontal: 24,
      alignSelf: 'center',
    },
    backButton: {
      paddingHorizontal: theme.spacing.l,
    },
    nextButton: {
      paddingHorizontal: theme.spacing.l,
    },
    positionAbsolute: {
      position: 'absolute',
      // paddingHorizontal: 24,
      paddingVertical: theme.spacing.xxxl,
      height: '100%',
      width: '100%',
      justifyContent: 'space-between',
    },
    landing: {
      flex: 1,
    },
    title: {
      color: theme.color.onBackground,
    },
    subTitle: {
      marginTop: '15%',
    },
    termAndCondition: {
      marginTop: theme.spacing.m,
      color: BLACK_COLOR,
    },
    pagerView: {
      flex: 1,
    },
  })
}

export default CreateIdentity
