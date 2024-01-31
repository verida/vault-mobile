import {
  ChainMetadata,
  isSupportedCaipNamespace,
  SupportedBlockchainNamespace,
} from 'features/blockchain'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { Theme } from 'styles/types'

const TAG_CHILDREN: { readonly [key in SupportedBlockchainNamespace]: string } =
  {
    [SupportedBlockchainNamespace.EIP_155]: 'EVM',
    [SupportedBlockchainNamespace.NEAR]: 'NEAR',
  }

export const ChainMetadataListItemTag = React.memo(
  function ChainMetadataListItemTag({
    chainMetadata: { namespace },
  }: {
    readonly chainMetadata: ChainMetadata
  }): JSX.Element {
    const styles = useThemeAwareStyle(createStyles)

    const children = isSupportedCaipNamespace(namespace)
      ? TAG_CHILDREN[namespace]
      : 'Unknown'

    return (
      <View style={styles.container}>
        <Text children={children} style={styles.wrapper} />
      </View>
    )
  }
)

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      // @ts-expect-error truthy
      flexWrap: 1,
    },
    wrapper: {
      fontSize: 13,
      fontFamily: NUNITO_SANS_SEMIBOLD,
      borderRadius: theme.spacing.xs,
      overflow: 'hidden',
      paddingHorizontal: 8,
      backgroundColor: '#F6F8F8',
      color: '#808695',
      paddingVertical: 1,
    },
  })
