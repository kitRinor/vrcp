import GenericScreen from "@/components/layout/GenericScreen";
import globalStyles from "@/config/styles";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@react-navigation/native";
import { Text } from "react-native";

const TODO_TEXT = `
[ToDo]  
  - webhook for Feed,
  - globally state controll
    - how to handle data pagenation?
    - how to handle data update?
  - push notification for Feed update
`;

export default function Home() {
  const theme = useTheme();
  const {currentUser} = useData();

  return (
    <GenericScreen>
      <Text style={[globalStyles.text, {color: theme.colors.subText, fontSize: 20}]}>
        Favorite friends and their Locations,
      </Text>

      <Text style={[globalStyles.text, {color: theme.colors.text}]}>
        {TODO_TEXT}
      </Text>
    </GenericScreen>
  );
}

