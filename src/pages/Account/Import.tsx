import React, { useState } from 'react'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Label from 'components/Label'
import ImportOption from 'pages/Account/ImportOption'
import { StyleSheet, View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParams } from 'navigation/types'
import Button from 'components/Button'
import { Container, Content } from 'native-base'
import { WHITE_COLOR } from 'constants/color'
import CustomFooter from 'components/Layouts/CustomFooter'
import Layout from 'components/Layouts/Layout'

function Import(
  props: NativeStackScreenProps<AuthStackParams, 'ImportAccount'>
) {
  const { navigation } = props
  const [selectedOption, setSelectedOption] = useState(0)

  function onContinue() {
    switch (selectedOption) {
      case 0:
        navigation.navigate('SeedPhraseEntered')
        break
      default:
        navigation.navigate('SelectNetwork')
    }
  }

  return (
    <Container>
      <NavigationHeader title='Import An Account' />
      <Content>
        <Layout>
          <View style={styles.content}>
            <Label>Import type</Label>
            <ImportOption
              text={'Saved seed phrase'}
              selected={selectedOption === 0}
              style={styles.firstOption}
              onPress={() => setSelectedOption(0)}
            />
            <ImportOption
              text={'Existing blockchain account'}
              selected={selectedOption === 1}
              onPress={() => setSelectedOption(1)}
            />
          </View>
        </Layout>
      </Content>
      <CustomFooter>
        <Button color='primary' onPress={onContinue}>
          Continue
        </Button>
      </CustomFooter>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  firstOption: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'column',
    backgroundColor: WHITE_COLOR,
  },
})

export default Import
