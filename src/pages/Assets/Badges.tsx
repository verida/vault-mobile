/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import {
  Canvas,
  Circle,
  CornerPathEffect,
  Group,
  Image as SkiaImage,
  Path,
  Skia,
  useImage,
} from '@shopify/react-native-skia'
import { useTheme } from 'contexts/ThemeContext'
import { getNFTImageUri } from 'helpers/nft'
import React, { useCallback, useEffect } from 'react'
import {
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch, useSelector } from 'react-redux'
import { VeridaWallet } from 'types/wallet'

import { NFT, NFTCollection, NFTMetadata } from 'api/types'
import NFTPlaceholder from 'assets/stubs/nft_placeholder.svg'
import { NftItem } from 'components/Assets/NftItem'
import Button from 'components/Button'
import Container from 'components/Container'
import GridView from 'components/Grids/GridView'
import { Line } from 'components/Line'
import LoadingIndicator from 'components/LoadingIndicator'
import { Tag } from 'components/Tag'
import { Title } from 'components/Typography/Title'
import { useReduxState } from 'hooks/useReduxState'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { useGetWalletNFTCollectionsQuery } from 'reduxStore/assets/api'
import {
  allWalletsSelector,
  getUniqueWalletAddresses,
  selectedWalletSelector,
} from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

import { IMAGE_WIDTH, NUMBER_OF_COLUMNS } from './constants'

const imageSize = 160
function makeHexagonPath(size, offset) {
  const path = Skia.Path.Make()
  const [xOffset, yOffset] = offset || [0, 0]
  if (!size) size = 10

  // https://www.quora.com/How-can-you-find-the-coordinates-in-a-hexagon
  const halfed = size / 2
  const sqrt = (Math.sqrt(3) * size) / 2
  const points = [
    [size, 0], //a
    [halfed, sqrt], //b
    [-halfed, sqrt], //c
    [-size, 0], //d
    [-halfed, -sqrt], //e
    [halfed, -sqrt], //f
  ].map(([x, y]) => [x + xOffset, y + yOffset])
  console.log(points)
  path.moveTo(...points[0])

  points.forEach((point) => path.lineTo(...point))
  path.close()
  return path
}

export function ClipImage({ imageSrc, path, offsetX, offsetY }) {
  const image = useImage(imageSrc)
  const hexagonSize = imageSize / 2
  // const path = makeHexagonPath(hexagonSize, [hexagonSize, hexagonSize])
  if (!image) return null
  return (
    <Group clip={path}>
      <Path
        path={path}
        color='transparent'
        style='stroke'
        strokeJoin='round'
        strokeWidth={1}>
        <CornerPathEffect r={14} />
      </Path>
      <SkiaImage
        image={image}
        fit='cover'
        x={offsetX}
        y={offsetY}
        width={imageSize + 24}
        height={imageSize + 24}
      />
    </Group>
  )
}

const Badges = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const { width, height } = useWindowDimensions()
  // const center = vec(width / 2, height / 2)
  const size = 160
  // const r = size * 0.33

  const drawHexagonGrid = () => {
    const hexagons = []
    const numberOfCols = Math.floor(width / size) + 2
    const numberOfRows = Math.floor(height / size) + 6
    const hexagonSize = size / 2
    let colOffset = -size / 2 - 20
    let rowOffset = -size * 3 + size / 3

    console.log(
      'Grid',
      JSON.stringify({ numberOfCols, numberOfRows, colOffset, rowOffset })
    )
    let imgIndex = 0
    const images = [
      'https://ipfs.moralis.io:2053/ipfs/QmbPHjLsp48QuSoCtDHvXRnfzAqRDYsX4udQXRQ5gB2w87/Gen0/verida-identity.png',
      'https://ipfs.moralis.io:2053/ipfs/QmQsghP7Y1dbZHgoo48hQz8SHdFk2mjmPikhkHg69HHhWb/Gen0/discord-account.png',
      'https://ipfs.moralis.io:2053/ipfs/QmT1hqphvztijTtEKd1xdUMtPXFfKqrx7qRby3mpeLeiMQ/Gen0/facebook-account.png',
      'https://ipfs.moralis.io:2053/ipfs/QmVZYkMfNC26LcwRJPdZmfUVGs5bmGFxz6AFpwwrAcVuuz/Gen0/twitter-account.png',
      'https://ipfs.moralis.io:2053/ipfs/QmeAJDpYUzfjguoEqsvg7taZzoUryLohDLGCo5NREgQ2zX/Gen0/linkedin-account.png',
      'https://ipfs.moralis.io:2053/ipfs/QmZ9wDPdjHAzC8WwqvbsqLPKkfiQNgwXT8hSkwKWrCMKY2/Gen0/github-account.png',
    ]

    for (let i = 0; i < numberOfCols; i++) {
      console.log('Enter col:', i)
      rowOffset = -size * 3 + size / 2 + 20
      const extraRowOffset = (i * size) / 2 // - size / 4
      for (let j = 0; j < numberOfRows; j++) {
        console.log('Enter row:', j)
        const path = makeHexagonPath(hexagonSize + 12, [
          colOffset + hexagonSize,
          rowOffset + hexagonSize + extraRowOffset,
        ])
        rowOffset += size
        if (imgIndex < images.length && i >= 1 && j >= 2) {
          hexagons.push(
            <ClipImage
              key={'hex' + `${i}-${j}`}
              imageSrc={images[imgIndex]}
              path={path}
              offsetX={size / 5 - 6}
              offsetY={rowOffset + extraRowOffset - size - 12}
            />
          )
          imgIndex++
          continue
        }

        hexagons.push(
          <Path
            key={'hex' + `${i}-${j}`}
            path={path}
            color={theme.color.primary}
            style='stroke'
            strokeJoin='round'
            strokeWidth={0.5}>
            <CornerPathEffect r={14} />
          </Path>
        )
      }
      colOffset += size - size / 7
    }

    return hexagons
  }

  return (
    <View style={styles.container}>
      <Line style={{ marginTop: theme.spacing.s }} />

      <ScrollView>
        <Canvas style={{ flex: 1, minHeight: 8 * size }}>
          {/* <ClipImage
          imageSrc={
            'https://ipfs.moralis.io:2053/ipfs/QmbPHjLsp48QuSoCtDHvXRnfzAqRDYsX4udQXRQ5gB2w87/Gen0/verida-identity.png'
          }
        /> */}
          {drawHexagonGrid()}
          {/* <Group blendMode='multiply'>
          <Circle cx={r} cy={r} r={r} color='cyan' />
          <Circle cx={size - r} cy={r} r={r} color='magenta' />
          <Circle cx={size / 2} cy={size - r} r={r} color='yellow' />
        </Group>
        <Path
          path='M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z'
          color='lightblue'
        /> */}
        </Canvas>
      </ScrollView>
      <Button
        style={{ margin: theme.spacing.m }}
        onPress={() => navigation.navigate('ClaimableBadges')}>
        Claim Badges
      </Button>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    grid: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    listEmptyContainer: { height: '100%' },
    column: {
      flex: 0.48,
    },
    image: {
      width: IMAGE_WIDTH,
      minHeight: IMAGE_WIDTH,
      borderRadius: theme.roundness.xs,
    },
    itemTag: {
      position: 'absolute',
      left: theme.spacing.s,
      bottom: theme.spacing.s,
    },
    tagLabel: {
      maxWidth: 0.68 * IMAGE_WIDTH,
      color: theme.color.onPrimary,
    },
    tagLabelNumber: {
      marginLeft: theme.spacing.s,
      color: theme.color.onPrimary,
    },
    emptyListContainer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.xxxxl,
    },
    emptyListTitle: {
      fontSize: theme.fontSize.xxl,
      marginTop: theme.spacing.m,
      textAlign: 'center',
    },
  })

export default Badges
