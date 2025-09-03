import { Avatar } from "@/api/vrchat";
import BaseCardView from "./BaseCardView";
import ReleaseStatusChip from "../chip-badge/ReleaseStatusChip";
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from "react-native";
import { spacing } from "@/config/styles";
import { getAvatarPlatform } from "@/lib/vrchatUtils";
import { useEffect, useRef, useState } from "react";

interface Props {
  avatar: Avatar;
  onPress?: () => void;
  onLongPress?: () => void;
  [key: string]: any;
}

const extractImageUrl = (data: Avatar) => data.thumbnailImageUrl;
const extractTitle = (data: Avatar) => data.name;

const CardViewAvatar = ({ avatar, onPress, onLongPress, ...rest }: Props) => {
  const [mgn, setMgn] = useState<number>(0);
  const onLayout = (event: LayoutChangeEvent) => {
    setMgn(event.nativeEvent.layout.width);
  };

  return (
    <BaseCardView
      data={avatar}
      onPress={onPress}
      onLongPress={onLongPress}
      imageUrl={extractImageUrl}
      title={extractTitle}
      FooterStyle={{marginRight: mgn}}
      OverlapComponents={
        <View style={styles.chipContainer} onLayout={onLayout}>
          <ReleaseStatusChip data={avatar} />
        </View>
      }
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  chipContainer: {
    position: "absolute",
    padding: spacing.small,
    bottom: 0,
    right: 0,
    // borderColor: "red", borderStyle: "solid", borderWidth: 1,
  },
});

export default CardViewAvatar;