import React from 'react'

import SuccessFailure from 'components/SuccessFailure'

export default ({ navigation }) => {
  const titleText = 'Ooops..'
  const descriptionText =
    'Something went wrong, your transaction failed, please try again.'
  const buttonLabel = 'Try Again'

  return (
    <SuccessFailure
      failure={true}
      titleText={titleText}
      descriptionText={descriptionText}
      buttonLabel={buttonLabel}
      actionButtonOnPress={() => navigation.navigate('Tokens')}
    />
  )
}
