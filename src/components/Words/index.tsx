import React from 'react'
import { StyleSheet, View } from 'react-native'

import Text from '~/components/Text'
import { BLACK_COLOR_OPACITY, LIGHTGREY_COLOR } from '~/constants/color'
import { NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import {
  addWord,
  removeWord,
  selectSeedPhraseTemplate,
} from '~/features/seedphrases'
import { useAppDispatch, useAppSelector } from '~/reduxStore/types'

import Words from './Words'

interface WordLayoutProps {
  words: string[]
}

const WordLayout: React.FC<WordLayoutProps> = ({ words }: WordLayoutProps) => {
  const dispatch = useAppDispatch()
  const template = useAppSelector(selectSeedPhraseTemplate)

  const addWordHandler = (index: number) => dispatch(addWord(index))
  const removeWordHandler = (index: number) => dispatch(removeWord(index))

  return (
    <View style={style.layout}>
      <View style={style.container}>
        {!template.length && <Text>No words in the correct order</Text>}
        <Words
          id='selected'
          words={words}
          template={template}
          onSelect={removeWordHandler}
        />
      </View>
      <Text style={style.text}>Please tap each word in the correct order.</Text>
      <View style={style.vocabulary}>
        <Words
          id='vocabulary'
          words={words}
          template={template}
          containerStyle={style.wordContainer}
          onSelect={addWordHandler}
        />
      </View>
    </View>
  )
}

export default WordLayout

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
