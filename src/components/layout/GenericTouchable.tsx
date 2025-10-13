import { omitObject } from "@/libs/utils"
import { View } from "react-native"
import { TouchableOpacity, TouchableOpacityProps } from "react-native"

/**
 * onPress or onLongPress is defined, use TouchableOpacity, otherwise just return children directly
 * @param props 
 * @returns 
 */
const GenericTouchable = (props: TouchableOpacityProps) => {
  if (props.onPress || props.onLongPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} {...props} />
    )
  } else {
    return (
      <View {...omitObject(props, "onPress", "onLongPress")}/>
    )
  }
}

export default GenericTouchable