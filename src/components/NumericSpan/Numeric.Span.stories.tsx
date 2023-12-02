import React from 'react'
import { View } from 'react-native'

//import { NumericSpan } from './Numeric.Span'

export default {
  title: 'NumericSpan',
  component: React.Fragment,
  //argTypes: {
  //  onPress: { action: 'pressed the button' },
  //},
  args: {
    text: 'Hello world',
  },
  decorators: [
    (Story: React.FC) => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
}

export const ScenarioOne = {}

export const ScenarioTwo = {
  args: {
    text: 'Another example 2',
  },
}
