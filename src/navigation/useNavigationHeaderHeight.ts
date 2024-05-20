import { useHeaderHeight } from '@react-navigation/elements'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const iOSModalMaskHeight = 10

export function useNavigationHeaderHeight(options: { isModal: boolean }) {
  const { isModal } = options

  // The following have been copied from react-navigation's Header component:
  const insets = useSafeAreaInsets()
  const hasDynamicIsland = Platform.OS === 'ios' && insets.top > 50
  const statusBarHeight = hasDynamicIsland ? insets.top - 5 : insets.top
  // https://github.com/react-navigation/react-navigation/blob/968840cb4f98303562de9e29fae7fbfda9c8d2fa/packages/elements/src/Header/Header.tsx#L86C55-L86C70
  // Reason is that, for some reason, `isParentHeaderShown` (see link above) is true in stack screens while it shouldn't and thus set the status bar height to 0, so have to set it ourselves. It's likely the `isParentHeaderShown=true` is due to a mistake of ours somewhere.

  const statusBarHeightForHeaderComponent =
    isModal && Platform.OS === 'ios' ? 0 : statusBarHeight

  const reportedHeaderHeight = useHeaderHeight()
  const headerHeight =
    reportedHeaderHeight -
    (isModal && Platform.OS === 'ios' ? 0 : statusBarHeight)

  const totalHeaderAndStatusBarHeight =
    headerHeight +
    (isModal && Platform.OS === 'ios' ? iOSModalMaskHeight : 0) +
    statusBarHeight

  return {
    statusBarHeight,
    statusBarHeightForHeaderComponent,
    headerHeight,
    totalHeaderAndStatusBarHeight,
  }
}
