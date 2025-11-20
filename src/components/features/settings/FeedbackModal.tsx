import GenericModal from "@/components/layout/GenericModal";
import { ButtonItemForFooter } from "@/components/layout/type";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import SelectGroupButton from "@/components/view/SelectGroupButton";
import { fontSize, spacing } from "@/configs/styles";
import { useToast } from "@/contexts/ToastContext";
import { useTheme } from "@react-navigation/native";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const FeedbackModal = ({ open, setOpen }: Props) => {
  const theme = useTheme();
  const {showToast} = useToast();
  const webhookUrl = process.env.EXPO_PUBLIC_DISCORD_WEBHOOK_URL;
  const [type, setType] = useState<string>("feedback");
  const [email, setEmail] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const emailRef = useRef<TextInput>(null);
  const contentRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendFeedback = async () => {
    if (!type) return;
    if (!email) return emailRef.current?.focus();
    if (!content) return contentRef.current?.focus();

    const MsgContent = 
`----------------
**Type:** ${type}
**Email:** ${email}

**Content:**
${content}
----------------`

    try {
      setIsLoading(true);
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: MsgContent,
        }),
      });
      if (res.ok) {
        showToast("success", "Thank you for your feedback!");
        setOpen(false);
        setType("feedback");
        setEmail("");
        setContent("");
      } else {
        showToast("error", "oops! failed to send feedback...");
      }
    } catch (error) {
      showToast("error", "oops! failed to send feedback...");
    } finally {
      setIsLoading(false);
    }

  };

  const buttonItems: ButtonItemForFooter[] = [
    {
      title: "Cancel",
      onPress: () => setOpen(false),
    },
    {
      title: "Send Feedback",
      flex: 1,
      onPress: sendFeedback,
    },
  ];

  return (
    <GenericModal
      title="Feedback"
      showCloseButton
      buttonItems={buttonItems}
      size="large"
      open={open}
      onClose={() => setOpen(false)}
    >
      {isLoading && (<LoadingIndicator absolute />)}
      <Text style={{ color: theme.colors.text }}>
        pls send your feedback or request to improving this app! 
      </Text>

      <SelectGroupButton
        data={["feedback", "bug-report", "request"]}
        value={type}
        onChange={setType}
      />

      <TextInput
        ref={emailRef}
        style={[styles.input, { color: theme.colors.text }]}
        placeholder="Email"
        placeholderTextColor={theme.colors.subText}
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        inputMode="email"
      />
      <TextInput
        ref={contentRef}
        style={[styles.mlinput, { color: theme.colors.text }]}
        placeholder="Your feedback"
        placeholderTextColor={theme.colors.subText}
        multiline
        numberOfLines={5}
        value={content}
        onChangeText={setContent}
      />
    </GenericModal>
  );
};


const styles = StyleSheet.create({
  // container styles
  container: {
    padding: spacing.small,
  },
  text: {
    fontSize: fontSize.medium,
    fontWeight: "normal"
  },
  description: {
    fontSize: fontSize.small,
    fontWeight: "normal"
  },

  // form elements
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    padding: spacing.medium,
  },
  mlinput: {
    height: 150,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    padding: spacing.medium,
    marginTop: spacing.small,
    textAlignVertical: 'top',
  },
})

export default FeedbackModal;
