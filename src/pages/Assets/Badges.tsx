import { useNavigation } from '@react-navigation/native'
import {
  Canvas,
  CornerPathEffect,
  DashPathEffect,
  Group,
  Image as SkiaImage,
  Path,
  RadialGradient,
  Rect,
  Skia,
  useImage,
  vec,
} from '@shopify/react-native-skia'
import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { Line } from 'components/Line'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import { IMAGE_WIDTH } from './constants'

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
  // console.log(points)
  path.moveTo(...points[0])

  points.slice(1, 6).forEach((point) => path.lineTo(...point))
  path.close()
  return path
}

export function ClipImage({
  imageSrc,
  path,
  innerPath,
  color,
  offsetX,
  offsetY,
}) {
  const image = useImage(imageSrc)
  return (
    <Group clip={image ? path : null}>
      <Path
        path={path}
        color={color}
        style='stroke'
        strokeJoin='round'
        strokeWidth={0.5}>
        <CornerPathEffect r={14} />
      </Path>
      <Path
        path={innerPath}
        color={'blue'}
        style='stroke'
        strokeJoin='round'
        strokeWidth={1}>
        <DashPathEffect intervals={[8, 8]} />
        <CornerPathEffect r={14} />
      </Path>
      {image && (
        <SkiaImage
          image={image}
          fit='cover'
          x={offsetX}
          y={offsetY}
          width={imageSize + 25}
          height={imageSize + 25}
        />
      )}
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

    const badgesData = {
      '1-2': {
        name: 'Verida Identity',
        image:
          'https://ipfs.moralis.io:2053/ipfs/QmbPHjLsp48QuSoCtDHvXRnfzAqRDYsX4udQXRQ5gB2w87/Gen0/verida-identity.png',
      },
      '2-2': {
        name: 'Discord Account',
        image:
          'https://ipfs.moralis.io:2053/ipfs/QmQsghP7Y1dbZHgoo48hQz8SHdFk2mjmPikhkHg69HHhWb/Gen0/discord-account.png',
      },
      '1-3': {
        name: 'Facebook Account',
        image:
          'https://ipfs.moralis.io:2053/ipfs/QmT1hqphvztijTtEKd1xdUMtPXFfKqrx7qRby3mpeLeiMQ/Gen0/facebook-account.png',
      },
      '2-3': {
        name: 'Twitter Account',
        image:
          'https://ipfs.moralis.io:2053/ipfs/QmVZYkMfNC26LcwRJPdZmfUVGs5bmGFxz6AFpwwrAcVuuz/Gen0/twitter-account.png',
      },
      '1-4': {
        name: 'LinkedIn Account',
        image:
          'https://ipfs.moralis.io:2053/ipfs/QmeAJDpYUzfjguoEqsvg7taZzoUryLohDLGCo5NREgQ2zX/Gen0/linkedin-account.png',
      },
      '2-4': {
        name: 'Github Account',
        image:
          'https://ipfs.moralis.io:2053/ipfs/QmZ9wDPdjHAzC8WwqvbsqLPKkfiQNgwXT8hSkwKWrCMKY2/Gen0/github-account.png',
      },
      '1-5': {
        name: 'Test Account',
        // image:
        //   'https://ipfs.moralis.io:2053/ipfs/QmeAJDpYUzfjguoEqsvg7taZzoUryLohDLGCo5NREgQ2zX/Gen0/linkedin-account.png',
      },
      '2-5': {
        name: 'Test Account 2',
        // image:
        //   'https://ipfs.moralis.io:2053/ipfs/QmZ9wDPdjHAzC8WwqvbsqLPKkfiQNgwXT8hSkwKWrCMKY2/Gen0/github-account.png',
      },
      '1-6': {
        name: 'Test Account 3',
        // image:
        //   'https://ipfs.moralis.io:2053/ipfs/QmeAJDpYUzfjguoEqsvg7taZzoUryLohDLGCo5NREgQ2zX/Gen0/linkedin-account.png',
      },
      '2-6': {
        name: 'Test Account 4',
        // image:
        //   'https://ipfs.moralis.io:2053/ipfs/QmZ9wDPdjHAzC8WwqvbsqLPKkfiQNgwXT8hSkwKWrCMKY2/Gen0/github-account.png',
      },
    }

    for (let i = 0; i < numberOfCols; i++) {
      console.log('Enter col:', i)
      rowOffset = -size * 3 + size / 2 + 16
      const extraRowOffset = (i * size) / 2 // - size / 4
      for (let j = 0; j < numberOfRows; j++) {
        console.log('Enter row:', j)
        const path = makeHexagonPath(hexagonSize + 12, [
          colOffset + hexagonSize,
          rowOffset + hexagonSize + extraRowOffset,
        ])
        rowOffset += size
        const badgePosition = `${i}-${j}` as any
        if (badgesData[badgePosition]) {
          const innePath = makeHexagonPath(hexagonSize + 6, [
            colOffset + hexagonSize,
            rowOffset - size + hexagonSize + extraRowOffset,
          ])

          hexagons.push(
            <ClipImage
              key={'hex' + `${i}-${j}`}
              imageSrc={badgesData[badgePosition].image}
              path={path}
              innerPath={innePath}
              color={'#73b4be'}
              offsetX={(size + 1) * (i - 1) + (size / 5 - 7.5) * (2 - i)}
              offsetY={rowOffset + extraRowOffset - size - 12}
            />
          )
          continue
        }

        hexagons.push(
          <Path
            key={'hex' + `${i}-${j}`}
            path={path}
            color={'#73b4be'}
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

  const checkIfWithinShape = (locationX, locationY, shapeProps) => {
    if (shapeProps.type === 'circle') {
      const { cx, cy, r } = shapeProps
      const distanceSquared = (locationX - cx) ** 2 + (locationY - cy) ** 2
      return distanceSquared <= r ** 2
    }

    if (shapeProps.type === 'rect') {
      const { x, y, width, height } = shapeProps
      return (
        locationX >= x &&
        locationX <= x + width &&
        locationY >= y &&
        locationY <= y + height
      )
    }

    // Add support for other shapes if needed
    return false
  }

  // TODO: Fix touch event
  // Shape properties
  const mainCircle = { type: 'circle', cx: 0, cy: 0, r: 200 }
  const handleTouchEnd = (e) => {
    const { locationX, locationY } = e.nativeEvent
    // Check if the touch coordinates fall within the bounds of the shapes
    if (checkIfWithinShape(locationX, locationY, mainCircle)) {
      navigation.navigate('ClaimableBadges')
    }
  }

  return (
    <View style={styles.container}>
      <Line style={{ marginTop: theme.spacing.s }} />

      <ScrollView>
        <Canvas
          style={{ flex: 1, minHeight: 8 * size }}
          onTouchEnd={handleTouchEnd}>
          <Rect x={0} y={0} width={width} height={8 * size}>
            <RadialGradient
              c={vec(width, 0)}
              r={1283}
              colors={['rgba(55, 213, 199, 0.06)', 'rgba(174, 71, 255, 0.1)']}
              positions={[0, 0.5]}
            />
          </Rect>

          {drawHexagonGrid()}
        </Canvas>
      </ScrollView>
      {/* <Button
        style={{ margin: theme.spacing.m }}
        onPress={() => navigation.navigate('ClaimableBadges')}>
        Claim Badges
      </Button> */}
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
