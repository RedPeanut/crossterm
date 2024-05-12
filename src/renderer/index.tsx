import { createRoot } from 'react-dom/client';
import App from './App';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <ChakraProvider>
    {/* <ColorModeScript initialColorMode={theme.config.initialColorMode} /> */}
    <App />
  </ChakraProvider>
);

