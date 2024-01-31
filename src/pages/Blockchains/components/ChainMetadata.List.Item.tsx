import { Logo } from 'components'
import { useTheme } from 'contexts/ThemeContext'
import { ChainMetadata, useChainMetadataDetails } from 'features/blockchain'
import { Text } from 'native-base'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'

import EditIcon from 'assets/edit_icon.svg'
import HouseIcon from 'assets/icons/earth.svg'
import { NUNITO_SANS_BOLD } from 'constants/text'

import { ChainMetadataListItemTag } from './ChainMetadata.List.Item.Tag'

type ChainMetadataListItemProps = {
  readonly chainMetadata: ChainMetadata
}

export const ChainMetadataListItem: React.FunctionComponent<ChainMetadataListItemProps> =
  ({ chainMetadata }) => {
    const { theme } = useTheme()
    const { icon: uri, name: label } = chainMetadata
    const { getChainMetadataDetails } = useChainMetadataDetails()

    const { isCustom, isRegional } = getChainMetadataDetails(chainMetadata)

    return (
      <View style={[styles.row, styles.wrapper]}>
        <View style={styles.center}>
          <Logo style={styles.icon} uri={uri || ''} />
        </View>
        <View style={styles.row}>
          <View style={{ paddingLeft: 10 }}>
            <Text children={label} style={styles.label} />
            <ChainMetadataListItemTag chainMetadata={chainMetadata} />
          </View>
        </View>
        <View style={[styles.center, { width: 20 }]}>
          {isCustom && <EditIcon fill={theme.color.iconDefault} />}
          {isRegional && <HouseIcon fill={theme.color.iconDefault} />}
        </View>
      </View>
    )
  }

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 17,
    fontFamily: NUNITO_SANS_BOLD,
    textTransform: 'capitalize',
  },
  icon: { width: 45, height: 45 },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  wrapper: { paddingHorizontal: 20, paddingVertical: 10 },
})
