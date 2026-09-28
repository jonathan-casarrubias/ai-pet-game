const skia = require('@shopify/react-native-skia');
console.log('Top level keys:', Object.keys(skia));
if (skia.Skia) {
  console.log('Skia object keys:', Object.keys(skia.Skia));
  console.log('Skia.Path:', skia.Skia.Path);
  if (skia.Skia.Path) {
    console.log('Skia.Path keys:', Object.keys(skia.Skia.Path));
  }
}
