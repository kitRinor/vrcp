import IconSymbol from "@/components/view/icon-components/IconView";
import { SupportedIconNames } from "@/components/view/icon-components/utils";
import globalStyles, { fontSize, spacing } from "@/configs/styles";
import { Text } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface SettingItemProps {
  icon: SupportedIconNames;
  title: string;
  description?: string;
  leading?: React.ReactNode;
  onPress?: () => void;
}
const SettingItem = ({
  icon,
  title,
  description,
  leading,
  onPress,
}: SettingItemProps ) => {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.container} >
        <View style={{ marginRight: spacing.medium }}>
          <IconSymbol name={icon} size={fontSize.large} color={theme.colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[globalStyles.text, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[globalStyles.description, { color: theme.colors.subText }]}>
            {description}
          </Text>
        </View>
        <View>{leading}</View>
      </View>
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default SettingItem