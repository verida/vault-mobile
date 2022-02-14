import React from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR } from '../../constants/color'
import { NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import { addWord, removeWord } from '../../reduxStore/words/actions'
import Text from '../Text'
import Words from './Words'

const WordLayout = ({ words, template, ...props }) => (
  <View style={style.layout}>
    <View style={style.container}>
      {!template.length && <Text>None words in the order</Text>}
      <Words
        id='selected'
        words={template}
        template={[]}
        onSelect={props.removeWord}
      />
    </View>
    <Text style={style.text}>Please tap each word in the correct order.</Text>
    <View style={style.vocabulary}>
      <Words
        id='vocabulary'
        words={words}
        template={template}
        containerStyle={style.wordContainer}
        onSelect={props.addWord}
      />
    </View>
  </View>
)

const mapStateToProps = (state) => {
  return { template: state.template }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addWord: (item) => dispatch(addWord(item)),
    removeWord: (item) => dispatch(removeWord(item)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WordLayout)

const style = StyleSheet.create({
  layout: {
    justifyContent: 'flex-start',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHTGREY_COLOR,
    borderRadius: 4,
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 32,
  },
  vocabulary: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    marginVertical: 24,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR_OPACITY(0.8),
  },
  wordContainer: {
    backgroundColor: BLACK_COLOR_OPACITY(0.05),
    borderColor: BLACK_COLOR_OPACITY(0),
  },
})
