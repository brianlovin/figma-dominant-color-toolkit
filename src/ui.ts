import Colorthief from '../node_modules/colorthief/dist/color-thief.umd.js'
import { getTextColorsFromRGB } from './colors'

interface ImageProps {
  img: HTMLElement;
  dominantColor: RGB;
  palette: RGB[][];
}

function getImageColors(bytes): Promise<ImageProps> {
  const img = document.getElementById('main')
  const blob = new Blob( [ bytes ], { type: "image/jpeg" });
  const urlCreator = window.URL
  const imageUrl = urlCreator.createObjectURL(blob)
  img.setAttribute('src', imageUrl)
  return new Promise(res => {
    img.onload = function() {
      const thief = new Colorthief()
      
      const rawDominantColor = thief.getColor(img, 1)
      const dominantColor = { r: rawDominantColor[0] / 255, g: rawDominantColor[1] / 255, b: rawDominantColor[2] / 255 }
      
      const rawPalette = thief.getPalette(img, 5, 1)
      const palette = rawPalette.map(arr => ({ r: arr[0] / 255, g: arr[1] / 255, b: arr[2] / 255 }))
      
      res({ img, dominantColor, palette })
    }
  })
}

window.onmessage = async (event) => {
  const { data } = event
  const { pluginMessage } = data
  const { imageBytes, width, height } = pluginMessage
  const { img, dominantColor, palette } = await getImageColors(imageBytes)
  img.setAttribute('width', width)
  img.setAttribute('height', height)
  const suggestedTextColors = getTextColorsFromRGB(dominantColor)
  window.parent.postMessage({ pluginMessage: { dominantColor, suggestedTextColors, palette } }, '*')
}