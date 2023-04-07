import { Dimensions } from 'react-native'

// To optimize image downloading and rendering, better to compute image size first
export const NUMBER_OF_COLUMNS = 2
export const SCREEN_WIDTH = Dimensions.get('screen').width
export const PADDING = 16
export const IMAGE_WIDTH = (SCREEN_WIDTH - 3 * PADDING) / NUMBER_OF_COLUMNS
