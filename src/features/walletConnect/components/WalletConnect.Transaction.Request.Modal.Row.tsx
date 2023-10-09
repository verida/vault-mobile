import * as React from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import JSONTree, { JSONTreeProps } from 'react-native-json-tree'

import { BLACK_COLOR, NUNITO_SANS_SEMIBOLD } from '../../../constants'

const defaultNormalize = (obj: Record<string, unknown>) =>
  JSON.parse(JSON.stringify(obj))

const defaultTheme: JSONTreeProps['theme'] = {
  scheme: 'default',
  base00: '#181818',
  base01: '#282828',
  base02: '#383838',
  base03: '#585858',
  base04: '#b8b8b8',
  base05: '#d8d8d8',
  base06: '#e8e8e8',
  base07: '#f8f8f8',
  base08: '#ab4642',
  base09: '#dc9656',
  base0A: '#f7ca88',
  base0B: '#a1b56c',
  base0C: '#86c1b9',
  base0D: '#7cafc2',
  base0E: '#ba8baf',
  base0F: '#a16946',
  tree: {
    flexDirection: 'column',
    padding: 2,
    backgroundColor: '#f8f8f8',
  },
  nestedNode: {},
  rootNode: {},
  rootNodeChildren: {},
  valueLabel: {},
  value: {
    flexWrap: 'wrap',
    // justifyContent: 'space-between',
    marginBottom: 2,
  },
  valueText: {
    marginBottom: 6,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
}

const shouldExpandNode = () => true

const keyPath = ['Object']

const labelRenderer: JSONTreeProps['labelRenderer'] = (raw) => (
  <Text style={{ maxWidth: '20%' }} children={raw[0]} />
)

const valueRenderer: JSONTreeProps['valueRenderer'] = (raw) => (
  <Text style={{ flex: 1, textAlign: 'left' }} ellipsizeMode='middle'>
    {raw}
  </Text>
)

export const WalletConnectTransactionRequestModalRow = React.memo(
  function WalletConnectTransactionRequestModalRow({
    left,
    right,
    normalize = defaultNormalize,
    theme: maybeTheme = defaultTheme,
    ...extras
  }: ViewProps & {
    readonly left: React.ReactNode
    readonly right: string | Record<string, unknown>
    readonly normalize?: (
      obj: Record<string, unknown>
    ) => Record<string, unknown>
    readonly theme?: JSONTreeProps['theme']
  }): JSX.Element {
    const theme = React.useMemo(() => ({ extend: maybeTheme }), [maybeTheme])
    return (
      <View style={styles.container} {...extras}>
        <Text style={styles.leftText}>{left}</Text>
        {typeof right === 'string' ? (
          <Text style={styles.rightText}>{right}</Text>
        ) : (
          <View style={styles.rightJsonView}>
            <JSONTree
              // @ts-expect-error incorrect typing
              theme={theme}
              invertTheme
              hideRoot={false}
              keyPath={keyPath}
              shouldExpandNode={shouldExpandNode}
              data={normalize(right)}
              labelRenderer={labelRenderer}
              valueRenderer={valueRenderer}
            />
          </View>
        )}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  leftText: {
    minWidth: '8%',
    fontSize: 14,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
    opacity: 0.5,
  },
  rightText: {
    flex: 9,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  rightJsonView: {
    flex: 9,
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: NUNITO_SANS_SEMIBOLD,
    color: BLACK_COLOR,
  },
})
