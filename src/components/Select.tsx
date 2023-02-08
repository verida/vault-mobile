import React, { Component } from 'react'
import {
  Keyboard,
  LayoutRectangle,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

import { LIGHTGREY_COLOR, VERIDA_COLOR, WHITE_COLOR } from 'constants/color'

const empty = (): Pick<Option, 'label' | 'value'> => ({
  label: '',
  value: '',
})

class DropDownPicker extends Component<SelectProps, SelectState> {
  inputRef = React.createRef<TextInput>()

  constructor(props: SelectProps) {
    super(props)

    const choice: Option[] = []
    if (!props.multiple) {
      choice.push(
        (props.defaultValue
          ? props.items.find((item) => item.value === props.defaultValue)
          : props.items.filter((item) => item?.selected === true)?.[0]) ??
          empty()
      )
    } else {
      if (
        props.defaultValue &&
        Array.isArray(props.defaultValue) &&
        props.defaultValue.length > 0
      ) {
        props.defaultValue.forEach((value) => {
          const item = props.items.find((i) => i.value === value)
          if (item) choice.push(item)
        })
      } else if (
        props.items.filter((item) => item?.selected === true).length > 0
      ) {
        choice.push(...props.items.filter((item) => item?.selected === true))
      }
    }

    this.state = {
      choice,
      isVisible: props.isVisible,
      props: {
        defaultValue: props.defaultValue,
        isVisible: props.isVisible,
      },
    }
  }

  static getDerivedStateFromProps(props: SelectProps, state: SelectState) {
    const { defaultValue, multiple } = props
    // Change default value (! multiple)
    if (!multiple && defaultValue !== state.props.defaultValue) {
      const { label, value } =
        (!!defaultValue &&
          props.items.find((item) => item.value === defaultValue)) ||
        empty()

      return {
        choice: [
          {
            label,
            value,
          },
        ],
        props: {
          ...state.props,
          defaultValue,
        },
      }
    }

    // Change default value (multiple)
    if (
      multiple &&
      JSON.stringify(defaultValue) !== JSON.stringify(state.props.defaultValue)
    ) {
      const items: Option[] = []

      if (
        defaultValue &&
        Array.isArray(defaultValue) &&
        defaultValue.length > 0
      ) {
        defaultValue.forEach((value) => {
          const item = props.items.find((i) => i.value === value)
          if (item) items.push(item)
        })
      }

      return {
        choice: items,
        props: {
          ...state.props,
          defaultValue,
        },
      }
    }

    // Change visibility
    if (props.isVisible !== state.props.isVisible) {
      return {
        isVisible: props.isVisible,
        props: {
          ...state.props,
          isVisible: props.isVisible,
        },
      }
    }

    return null
  }

  setOpenDropdown(isOpen: boolean) {
    this.setState(
      {
        isVisible: isOpen,
      },
      () => {
        const isVisible = this.state.isVisible

        if (isVisible) {
          this.props.onOpen()
          this.inputRef.current?.focus()
        } else {
          this.props.onClose()
          this.inputRef.current?.blur()
        }
      }
    )
  }

  select(item: Option, index: number) {
    if (this.props.multiple) {
      let choice = [...this.state.choice]
      const exists = choice.findIndex(
        (i) => i.label === item.label && i.value === item.value
      )

      if (exists > -1 && choice.length > this.props.min) {
        choice = choice.filter(
          (i) => i.label !== item.label && i.value !== item.value
        )
      } else if (exists === -1 && choice.length < this.props.max) {
        choice.push(item)
      }

      this.setState({
        choice,
      })

      // onChangeItem callback
      this.props.onChangeItems(choice.map((i) => i.value ?? ''))
    } else {
      this.setState({
        choice: [
          {
            label: item.label,
            value: item.value,
          },
        ],
        isVisible: false,
        props: {
          ...this.state.props,
          isVisible: false,
        },
      })

      // onChangeItem callback
      this.props.onChangeItem(item, index)

      // onClose callback (! multiple)
      this.props.onClose()
    }

    this.setState({
      searchableText: '',
    })

    Keyboard.dismiss()
  }

  getLayout(layout: LayoutRectangle) {
    this.setState({
      top: layout.height - 1,
    })
  }

  getItems() {
    if (this.state.searchableText) {
      const text = this.state.searchableText.toLowerCase()

      return this.props.items.filter((item) => {
        return item.label?.toLowerCase().includes(text)
      })
    }

    return this.props.items
  }

  getNumberOfItems() {
    return this.props.multiple
      ? this.props.multipleText.replace('%d', () =>
          this.state.choice.length.toString()
        )
      : ''
  }

  render() {
    const { multiple, placeholder, disabled, placeholderStyle } = this.props
    const { choice } = this.state
    const isPlaceholderActive = !choice[0].label
    const label = isPlaceholderActive ? placeholder : choice[0].label ?? ''
    const opacity = disabled ? 0.5 : 1
    const items = this.getItems()
    const selectedValue = multiple
      ? this.state.choice.length > 0
        ? this.getNumberOfItems()
        : placeholder
      : label

    return (
      <View
        style={[
          this.props.containerStyle,
          {
            ...(Platform.OS !== 'android' && {
              zIndex: this.props.zIndex,
            }),
          },
        ]}>
        <TouchableOpacity
          onLayout={(event) => this.getLayout(event.nativeEvent.layout)}
          disabled={disabled}
          onPress={() => {
            this.setOpenDropdown(!this.state.isVisible)
          }}
          activeOpacity={1}
          style={[
            styles.dropDown,
            this.props.style,
            // this.state.isVisible && styles.noBottomRadius,
            this.state.isVisible && styles.textInputFocus,
            {
              flexDirection: 'row',
              flex: 1,
            },
          ]}>
          <View style={styles.dropDownDisplay}>
            {this.props.searchable ? (
              <TextInput
                ref={this.inputRef}
                editable={!disabled}
                autoFocus={this.props.autoFocus}
                style={[
                  styles.input,
                  this.props.searchableStyle,
                  this.state.isVisible ? styles.textInputFocus : {},
                ]}
                defaultValue={this.state.searchableText}
                placeholder={this.props.searchablePlaceholder}
                placeholderTextColor={LIGHTGREY_COLOR}
                onChangeText={(text) => {
                  this.setState({
                    searchableText: text,
                  })
                  if (text === '') this.setState({ choice: [empty()] })
                }}
                value={this.state.searchableText || selectedValue}
                onFocus={() => this.setOpenDropdown(true)}
                onBlur={() => this.setOpenDropdown(false)}
              />
            ) : (
              <Text
                style={[
                  this.props.labelStyle,
                  isPlaceholderActive && placeholderStyle,
                  { opacity },
                ]}>
                {selectedValue}
              </Text>
            )}
          </View>
          {this.props.showArrow && (
            <View style={styles.arrow}>
              <View style={[this.props.arrowStyle, { opacity }]}>
                {!this.state.isVisible
                  ? this.props.customArrowDown(
                      this.props.arrowSize,
                      this.props.arrowColor
                    )
                  : this.props.customArrowUp(
                      this.props.arrowSize,
                      this.props.arrowColor
                    )}
              </View>
            </View>
          )}
        </TouchableOpacity>
        {!disabled && (
          <View
            style={[
              styles.dropDown,
              styles.dropDownBox,
              this.props.dropDownStyle,
              !this.state.isVisible && styles.hidden,
              {
                top: this.state.top,
                maxHeight: this.props.dropDownMaxHeight,
                zIndex: this.props.zIndex,
                marginTop: 8,
              },
            ]}>
            <ScrollView
              style={{ width: '100%' }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps='handled'>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => this.select(item, index)}
                    style={[
                      styles.dropDownItem,
                      this.props.itemStyle,
                      choice[0].value === item.value &&
                        this.props.activeItemStyle,
                      {
                        opacity: item?.disabled ? 0.3 : 1,
                        ...(multiple && {
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }),
                      },
                    ]}
                    disabled={item?.disabled}>
                    <Text
                      style={[
                        this.props.labelStyle,
                        choice[0].value === item.value &&
                          this.props.activeLabelStyle,
                      ]}>
                      {item.flag ? `${item.flag} ` : ''}
                      {item.label}
                    </Text>
                    {multiple &&
                      this.state.choice.findIndex(
                        (i: Option) =>
                          i.label === item.label && i.value === item.value
                      ) > -1 &&
                      this.props.customTickIcon()}
                  </TouchableOpacity>
                ))
              ) : (
                <Text
                  style={[
                    styles.notFound,
                    {
                      fontFamily: this.props.labelStyle?.fontFamily,
                    },
                  ]}>
                  {this.props.searchableError}
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    )
  }

  static defaultProps = {
    placeholder: 'Select an item',
    dropDownMaxHeight: 150,
    style: {},
    dropDownStyle: {},
    containerStyle: {},
    itemStyle: {},
    labelStyle: {},
    placeholderStyle: {},
    activeItemStyle: {},
    activeLabelStyle: {},
    arrowStyle: {},
    arrowColor: '#000',
    showArrow: true,
    arrowSize: 15,
    customArrowUp: (size?: number, color?: string) => (
      <Feather name='chevron-up' size={size} color={color} />
    ),
    customArrowDown: (size?: number, color?: string) => (
      <Feather name='chevron-down' size={size} color={color} />
    ),
    customTickIcon: () => <Feather name='check' size={15} />,
    zIndex: 5000,
    disabled: false,
    searchable: false,
    searchablePlaceholder: 'Search for an item',
    searchableError: 'Not Found',
    searchableStyle: {},
    isVisible: false,
    multiple: false,
    multipleText: '%d items have been selected',
    min: 0,
    max: 10000000,
    onOpen: () => ({}),
    onClose: () => ({}),
    onChangeItem: () => ({}),
  }
}

type SelectState = {
  choice: Option[]
  searchableText?: string
  isVisible: boolean
  top?: number
  props: {
    defaultValue?: string | string[]
    isVisible?: boolean
  }
}

export type Option = {
  label: string
  value: string
  disabled?: boolean
  flag?: string
  selected?: boolean
}

type SelectProps = {
  autoFocus?: boolean
  items: Array<Option>
  placeholder: string
  placeholderStyle: StyleProp<TextStyle>
  dropDownMaxHeight: number
  style: StyleProp<ViewStyle>
  dropDownStyle: StyleProp<ViewStyle>
  containerStyle: StyleProp<ViewStyle>
  itemStyle: StyleProp<ViewStyle>
  labelStyle: TextStyle
  activeItemStyle: StyleProp<ViewStyle>
  activeLabelStyle: StyleProp<TextStyle>
  showArrow: boolean
  arrowStyle: StyleProp<ViewStyle>
  arrowColor: string
  arrowSize: number
  customArrowUp: (size: number, color: string) => Component
  customArrowDown: (size: number, color: string) => Component
  customTickIcon: () => Component
  zIndex: number
  disabled: boolean
  searchable: boolean
  searchablePlaceholder: string
  searchableError: string
  searchableStyle: StyleProp<TextStyle>
  isVisible: boolean
  onOpen: () => void
  onClose: () => void
} & (
  | {
      multiple: true
      defaultValue?: string[]
      multipleText: string
      min: number
      max: number
      onChangeItems: (items: string[]) => void
    }
  | {
      multiple?: false
      defaultValue?: string
      onChangeItem: (item: Option, idx?: number) => void
    }
)

const styles = StyleSheet.create({
  arrow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  dropDown: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: WHITE_COLOR,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#dfdfdf',
  },
  dropDownDisplay: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    textAlign: 'center',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 5,
    flexGrow: 1,
  },
  dropDownBox: {
    // borderTopLeftRadius: 0,
    // borderTopRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
  },
  dropDownItem: {
    paddingVertical: 8,
    width: '100%',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
  },
  hidden: {
    position: 'relative',
    display: 'none',
    borderWidth: 0,
  },
  noBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  textInputFocus: {
    borderColor: VERIDA_COLOR,
  },
  notFound: {
    textAlign: 'center',
    color: 'grey',
    marginVertical: 10,
    marginBottom: 15,
  },
})

export default DropDownPicker
