import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Register third-party components with NativeWind
// This allows them to accept className prop and convert it to style

cssInterop(SafeAreaView, {
  className: 'style',
});

cssInterop(LinearGradient, {
  className: 'style',
});
