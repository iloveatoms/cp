// app/fonts/poppins.tsx
import localFont from 'next/font/local';

export const poppins = localFont({
  src: [
    { path: './poppins/Poppins-Thin.ttf', weight: '100', style: 'normal' },
    // { path: './poppins/Poppins-ThinItalic.ttf', weight: '100', style: 'italic' },
    // { path: './poppins/Poppins-ExtraLight.ttf', weight: '200', style: 'normal' },
    // { path: './poppins/Poppins-ExtraLightItalic.ttf', weight: '200', style: 'italic' },
    // { path: './poppins/Poppins-Light.ttf', weight: '300', style: 'normal' },
    // { path: './poppins/Poppins-LightItalic.ttf', weight: '300', style: 'italic' },
    // { path: './poppins/Poppins-Regular.ttf', weight: '400', style: 'normal' },
    // { path: './poppins/Poppins-Italic.ttf', weight: '400', style: 'italic' },
    { path: './poppins/Poppins-Medium.ttf', weight: '500', style: 'normal' },
    // { path: './poppins/Poppins-MediumItalic.ttf', weight: '500', style: 'italic' },
    // { path: './poppins/Poppins-SemiBold.ttf', weight: '600', style: 'normal' },
    // { path: './poppins/Poppins-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    // { path: './poppins/Poppins-Bold.ttf', weight: '700', style: 'normal' },
    // { path: './poppins/Poppins-BoldItalic.ttf', weight: '700', style: 'italic' },
    // { path: './poppins/Poppins-ExtraBold.ttf', weight: '800', style: 'normal' },
    // { path: './poppins/Poppins-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
    // { path: './poppins/Poppins-Black.ttf', weight: '900', style: 'normal' },
    // { path: './poppins/Poppins-BlackItalic.ttf', weight: '900', style: 'italic' },
  ],
  display: 'swap',
});
