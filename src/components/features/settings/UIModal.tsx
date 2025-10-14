import GenericModal from "@/components/layout/GenericModal";
import IconSymbol from "@/components/view/icon-components/IconView";
import { SupportedIconNames } from "@/components/view/icon-components/utils";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import globalStyles, { fontSize, spacing } from "@/configs/styles";
import { useCache } from "@/contexts/CacheContext";
import { useSetting } from "@/contexts/SettingContext";
import { Button, Text } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableHighlight, TouchableOpacity, View } from "react-native";
import SettingItem, { SettingItemProps } from "./components/SettingItem";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const UIModal = ({ open, setOpen }: Props) => {
  const theme = useTheme();
  const setting = useSetting();
  const { homeTabMode, colorOptions } = setting.settings;

  const homeSectionItems: SettingItemProps[] = [
    {
      icon: "home-work",
      title: "Layout mode ",
      description: "Select the mode for the home tab",
      leading: (
        <Text style={[globalStyles.text, { color: theme.colors.text }]}>
          {homeTabMode}
        </Text>
      ),
      onPress: () => {}
    }
  ]

  return (
    <GenericModal
      buttonItems={[{ title: "Close", onPress: () => setOpen(false), flex: 1 }]}
      open={open}
      onClose={() => setOpen(false)}
    >
      <Text
        style={[
          globalStyles.header,
          globalStyles.headerContainer,
          { color: theme.colors.text },
        ]}
      >
        UI Settings
      </Text>
      <Text style={[globalStyles.subheader, { color: theme.colors.text }]}>
        Home Tab
      </Text>
      <View style={globalStyles.container}>
        {homeSectionItems.map((item) => (
          <SettingItem
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            leading={item.leading}
          />
        ))

        }
      </View>
      <Text style={[globalStyles.subheader, { color: theme.colors.text }]}>
        User Color
      </Text>

      <View style={globalStyles.container}>

      </View>

    </GenericModal>
  );
};

export default UIModal;
