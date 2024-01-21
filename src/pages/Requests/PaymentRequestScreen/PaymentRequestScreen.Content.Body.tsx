import {
  RequestDetails,
  RequestHeader,
  RequestHeaderProps,
  RequestMessage,
  RequestPaymentFee,
  RequestPaymentFeeProps,
  RequestPaymentValue,
  RequestPaymentValueProps,
  WalletSelectorButton,
  WalletSelectorButtonProps,
} from 'components'
import { reduceProtocols } from 'features/protocols'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import { useImmediateLayoutAnimation } from 'use-layout-animation'

import { Theme } from 'styles/types'

import { PaymentRequestScreenParams } from '.'

export const PaymentRequestScreenContentBody = React.memo(
  function PaymentRequestScreenContentBody({
    details,
    detailsOpen,
    requestHeaderProps,
    requestPaymentValueProps,
    requestPaymentFeeProps,
    walletSelectorButtonProps,
  }: {
    readonly details: PaymentRequestScreenParams['details']
    readonly detailsOpen: boolean
    readonly requestHeaderProps: Omit<
      RequestHeaderProps,
      'timestamp' | 'isDetailsOpen'
    >
    readonly requestPaymentValueProps: Omit<RequestPaymentValueProps, 'style'>
    readonly requestPaymentFeeProps: Omit<
      RequestPaymentFeeProps,
      'style'
    > | null
    readonly walletSelectorButtonProps: Omit<
      WalletSelectorButtonProps,
      'style'
    > | null
  }): JSX.Element {
    const styles = useThemeAwareStyle(createStyles)
    const protocols = reduceProtocols(details.protocols, 16)

    useImmediateLayoutAnimation([detailsOpen])

    return (
      <>
        <RequestHeader
          timestamp={details.timestamp}
          isDetailsOpen={detailsOpen}
          {...requestHeaderProps}
        />
        {Boolean(detailsOpen) && (
          <RequestDetails
            properties={[
              {
                label: 'Recipient address',
                value: details.requesterId,
              },
              {
                label: 'Protocols',
                value: <>{protocols}</>,
              },
            ]}
            style={styles.detailsContainer}
          />
        )}
        {details.message ? (
          <RequestMessage style={styles.messageContainer}>
            {details.message}
          </RequestMessage>
        ) : null}
        <React.Fragment>
          <RequestPaymentValue
            {...requestPaymentValueProps}
            style={styles.valueContainer}
          />
          {!!requestPaymentFeeProps && (
            <RequestPaymentFee
              {...requestPaymentFeeProps}
              style={styles.feeContainer}
            />
          )}
          {!!walletSelectorButtonProps && (
            <WalletSelectorButton
              {...walletSelectorButtonProps}
              style={styles.walletSelectorButton}
            />
          )}
        </React.Fragment>
      </>
    )
  }
)

// TODO: Use the theme when proper typography is available
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    detailsContainer: {
      marginTop: theme.spacing.m,
    },
    feeContainer: {
      marginTop: theme.spacing.l,
    },
    messageContainer: {
      marginTop: theme.spacing.l,
    },
    valueContainer: {
      marginTop: theme.spacing.xl,
    },
    walletSelectorButton: {
      marginTop: theme.spacing.l,
    },
  })
