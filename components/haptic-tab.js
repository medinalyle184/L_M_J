import { PlatformPressable } from '@react-navigation/elements';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab(props) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
