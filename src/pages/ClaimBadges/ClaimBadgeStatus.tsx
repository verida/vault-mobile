import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ErrorStatusIcon from 'assets/icons/error_status_icon.svg'
import Button from 'components/Button'
import { TEXT_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'

const STATUS = {
  success: {
    type: 'success',
    title: `Success!`,
    message: 'Your Verida Identity Badge has been successfully generated',
  },
  error: {
    type: 'error',
    title: `Ooops...`,
    message: `Something went wrong. Please try again.`,
  },
}

type StatusType = 'success' | 'error' | undefined

type ClaimBadgeStatusProps = {
  type: StatusType
}

const ClaimBadgeStatus: React.FC<ClaimBadgeStatusProps> = ({
  type = 'error',
}) => {
  const [status] = useState(STATUS)

  const SuccessActionButton = (
    <View>
      <Button color='primary' disabled={false} loading={false}>
        Share
      </Button>
      <Button color='secondary' disabled={false} loading={false}>
        View in Verida One
      </Button>
    </View>
  )
  const ErrorActionButton = (
    <Button color='primary' disabled={false} loading={false}>
      Go Back
    </Button>
  )
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ErrorStatusIcon />
        <View style={styles.statusInfo}>
          <Text style={styles.title}>{status[type].title}</Text>
          <Text style={styles.bodyText}>{status[type].message}</Text>
        </View>
      </View>
      <View>
        {type === 'success' && SuccessActionButton}
        {type === 'error' && ErrorActionButton}
      </View>
    </View>
  )
}

export default ClaimBadgeStatus

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 104,
    paddingHorizontal: 40,
  },
  statusInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontWeight: '600',
    fontSize: 28,
    textAlign: 'center',
    color: TEXT_COLOR,
    marginTop: 24,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: NUNITO_SANS,
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
    color: TEXT_COLOR,
    marginBottom: 16,
  },
})
