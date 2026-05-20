import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProviderWorkboardScreen } from './src/features/providerWorkboard/screens/ProviderWorkboardScreen';

export default function App() {

    return (
        <SafeAreaProvider>
            <ProviderWorkboardScreen />
        </SafeAreaProvider>
    );
}
