import React, { Component } from 'react'
import {
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

import { LIGHTGREY_COLOR, WHITE_COLOR } from 'constants/color'

class DropDownPicker extends Component<SelectProps, any> {
  constructor(props: SelectProps) {
    super(props)

    let choice
    let items = []
    if (!props.multiple) {
      choice = props.defaultValue
        ? props.items.find((item) => item.value === props.defaultValue)
        : props.items.filter((item) => item?.selected === true)?.[0] ??
          this.null()
    } else {
      if (
        props.defaultValue &&
        Array.isArray(props.defaultValue) &&
        props.defaultValue.length > 0
      ) {
        props.defaultValue.forEach((value) => {
          items.push(props.items.find((item) => item.value === value))
        })
      } else if (
        props.items.filter((item) => item?.selected === true).length > 0
      ) {
        items = props.items.filter((item) => item?.selected === true)
      }
    }

    this.state = {
      choice: props.multiple
        ? items
        : {
            label: choice.label,
            value: choice.value,
          },
      searchableText: null,
      isVisible: props.isVisible,
      props: {
        multiple: props.multiple,
        defaultValue: props.defaultValue,
        isVisible: props.isVisible,
      },
    }
  }

  static getDerivedStateFromProps(props: SelectProps, state: any) {
    // Change default value (! multiple)
    if (
      !state.props.multiple &&
      props.defaultValue !== state.props.defaultValue
    ) {
      const { label, value } =
        props.defaultValue === null
          ? {
              label: null,
              value: null,
            }
          : props.items.find((item) => item.value === props.defaultValue)
      return {
        choice: {
          label,
          value,
        },
        props: {
          ...state.props,
          defaultValue: props.defaultValue,
        },
      }
    }

    // Change default value (multiple)
    if (
      state.props.multiple &&
      JSON.stringify(props.defaultValue) !==
        JSON.stringify(state.props.defaultValue)
    ) {
      const items: any[] = []
      if (
        props.defaultValue &&
        Array.isArray(props.defaultValue) &&
        props.defaultValue.length > 0
      ) {
        props.defaultValue.forEach((value) => {
          items.push(props.items.find((item) => item.value === value))
        })
      }

      return {
        choice: items,
        props: {
          ...state.props,
          defaultValue: props.defaultValue,
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

  null() {
    return {
      label: null,
      value: null,
    }
  }

  toggle() {
    this.setState(
      {
        isVisible: !this.state.isVisible,
      },
      () => {
        const isVisible = this.state.isVisible

        if (isVisible) {
          this.props.onOpen()
        } else {
          this.props.onClose()
        }
      }
    )
  }

  select(item: any, index: number) {
    const { multiple } = this.state.props
    if (!multiple) {
      this.setState({
        choice: {
          label: item.label,
          value: item.value,
        },
        isVisible: false,
        props: {
          ...this.state.props,
          isVisible: false,
        },
      })

      // onChangeItem callback
      this.props.onChangeItem(item, index)
    } else {
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
      this.props.onChangeItem(choice.map((i) => i.value))
    }

    // onClose callback (! multiple)
    if (!multiple) this.props.onClose()
    this.setState({
      searchableText: '',
    })
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
        return item.label && item.label.toLowerCase().indexOf(text) > -1
      })
    }

    return this.props.items
  }

  getNumberOfItems() {
    return this.props.multipleText.replace('%d', this.state.choice.length)
  }

  render() {
    const { multiple } = this.state.props
    const { placeholder, disabled } = this.props
    const isPlaceholderActive = this.state.choice.label === null
    const label = isPlaceholderActive ? placeholder : this.state.choice.label
    const placeholderStyle = isPlaceholderActive && this.props.placeholderStyle
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
          onPress={() => this.toggle()}
          activeOpacity={1}
          style={[
            styles.dropDown,
            this.props.style,
            this.state.isVisible && styles.noBottomRadius,
            {
              flexDirection: 'row',
              flex: 1,
            },
          ]}>
          <View style={styles.dropDownDisplay}>
            {this.props.searchable ? (
              <TextInput
                editable={!disabled}
                autoFocus={this.props.autoFocus}
                style={[styles.input, this.props.searchableStyle]}
                defaultValue={this.state.searchableText}
                placeholder={this.props.searchablePlaceholder}
                placeholderTextColor={LIGHTGREY_COLOR}
                onChangeText={(text) => {
                  this.setState({
                    searchableText: text,
                  })
                  if (text === '') this.setState({ choice: this.null() })
                }}
                value={this.state.searchableText || selectedValue}
                onFocus={() => this.toggle()}
              />
            ) : (
              <Text
                style={[this.props.labelStyle, placeholderStyle, { opacity }]}>
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
              },
            ]}>
            <ScrollView style={{ width: '100%' }} nestedScrollEnabled={true}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => this.select(item, index)}
                    style={[
                      styles.dropDownItem,
                      this.props.itemStyle,
                      this.state.choice.value === item.value &&
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
                        this.state.choice.value === item.value &&
                          this.props.activeLabelStyle,
                      ]}>
                      {item.flag ? `${item.flag} ` : ''}
                      {item.label}
                    </Text>
                    {multiple &&
                      this.state.choice.findIndex(
                        (i) => i.label === item.label && i.value === item.value
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
    customArrowUp: (size, color) => (
      <Feather name='chevron-up' size={size} color={color} />
    ),
    customArrowDown: (size, color) => (
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

interface SelectProps {
  autoFocus?: boolean | undefined
  items: Array<any>
  defaultValue: any
  placeholder: string
  placeholderStyle: StyleProp<TextStyle>
  dropDownMaxHeight: number
  style: StyleProp<ViewStyle>
  dropDownStyle: StyleProp<ViewStyle>
  containerStyle: StyleProp<ViewStyle>
  itemStyle: StyleProp<ViewStyle>
  labelStyle: StyleProp<TextStyle>
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
  searchableStyle: StyleProp<any>
  isVisible: boolean
  multiple: boolean
  multipleText: string
  min: number
  max: number
  onOpen: () => void
  onClose: () => void
  onChangeItem: (item: any, idx?: number) => void
}

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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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
  notFound: {
    textAlign: 'center',
    color: 'grey',
    marginVertical: 10,
    marginBottom: 15,
  },
})

export default DropDownPicker
