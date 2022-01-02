import { render } from '@testing-library/react-native'
import Start from '../src/pages/Account/Start'

test('Should render the Start screen correctly', () => {
  const { getAllByA11yLabel, getByText } = render(<Start />)
})
