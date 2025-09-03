import { useRouter } from "expo-router";
import IconButton from "./icon-components/IconButton";
import { spacing } from "@/config/styles";

const BackButtonForHeader = () => {
  const router = useRouter();
  return (
    <IconButton 
      style={{paddingRight: spacing.large}} 
      name="chevron-left" 
      onPress={router.back} 
    />
  );
};

export default BackButtonForHeader;
