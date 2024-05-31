import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import DatePicker from 'react-native-datepicker'

import {
  BLACK_COLOR_OPACITY,
  PRIMARY_COLOR,
  WHITE_COLOR,
} from '~/constants/color'

export interface DateOfBirthProps {
  selected: string | Date
}

const DateOfBirth: React.FC<DateOfBirthProps> = (props) => {
  const { selected } = props
  const [value, setValue] = useState<string | Date>(selected)

  return (
    <DatePicker
      style={{ height: 20 }}
      date={value}
      mode='date'
      placeholder='Not set'
      format='DD/MM/YY'
      showIcon={false}
      confirmBtnText='Save Changes'
      cancelBtnText='Cancel'
      customStyles={style}
      onDateChange={(date) => {
        setValue(date)
      }}
    />
  )
}

export default DateOfBirth

const text = {
  color: BLACK_COLOR_OPACITY(0.6),
  fontFamily: 'NunitoSans',
  fontSize: 17,
}

const style = StyleSheet.create({
  dateInput: {
    alignItems: 'flex-end',
    borderWidth: 0,
    marginRight: 26,
    marginTop: -14,
  },
  btnConfirm: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
    margin: 4,
    height: 34,
  },
  btnTextConfirm: {
    color: WHITE_COLOR,
    fontSize: 14,
  },
  placeholderText: text,
  dateText: text,
})
