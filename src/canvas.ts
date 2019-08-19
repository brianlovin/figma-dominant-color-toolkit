import { getFirstImagePaintFromNode, UIColorData } from "./utils";

export async function generateColorGuideFrame(node, data: UIColorData): Promise<SceneNode> {
  const { dominantColor, palette, suggestedTextColors } = data

  const swatchSize = 44
  const labelTopMargin = 24
  const labelHeight = 12
  const labelBottomMargin = 8 + labelHeight
  const swatchGap = 12
  const maxWidth = 300
  const maxImagePreviewHeight = 300
  const leftMargin = 16
  const black = { r: 0, g: 0, b: 0 }
  const white = { r: 1, g: 1, b: 1 }
  const paletteCornerRadius = 6
  
  const imagePreviewInset = 16
  const imageBoundsHeight = node.height > maxImagePreviewHeight
  ? maxImagePreviewHeight
  : node.height + (imagePreviewInset * 2) > maxImagePreviewHeight
  ? maxImagePreviewHeight
  : node.height + (imagePreviewInset * 2)
  
  const contentStartY = imageBoundsHeight + labelTopMargin
  const totalHeight = imageBoundsHeight + ((labelTopMargin + labelBottomMargin + swatchSize) * 3) + leftMargin

  const fontName = { family: 'SF Pro Text', style: 'Bold'}
  await figma.loadFontAsync(fontName)

  const frame = figma.createFrame()
  frame.resize(maxWidth, totalHeight)
  frame.x = node.x + node.width + 100
  frame.y = node.y
  frame.backgrounds = []
  frame.effects = []
  frame.name = "Palette"
  frame.clipsContent = false
  const background = figma.createRectangle()
  frame.appendChild(background)
  background.x = 0
  background.y = 0
  background.resize(maxWidth, totalHeight)
  background.cornerRadius = paletteCornerRadius
  background.fills = [{ color: white, type: 'SOLID' }]
  background.effects = [{ type: 'DROP_SHADOW', visible: true, blendMode: "NORMAL", radius: 12, offset: { x: 0, y: 2 }, color: { ...black, a: 0.16 }}]

  const imageBackground = figma.createRectangle()
  imageBackground.y = 0
  imageBackground.topLeftRadius = paletteCornerRadius
  imageBackground.topRightRadius = paletteCornerRadius
  imageBackground.resize(maxWidth, imageBoundsHeight)
  imageBackground.fills = [{ type: 'SOLID', color: dominantColor, opacity: 0.08 }]
  imageBackground.effects = [{ type: 'INNER_SHADOW', visible: true, blendMode: "NORMAL", radius: 0, offset: { x: 0, y: -1 }, color: { ...black, a: 0.08 }}]

  const imageBounds = figma.createRectangle()
  imageBounds.name = "Source image"

  frame.appendChild(imageBackground)
  frame.appendChild(imageBounds)

  const paint = getFirstImagePaintFromNode(node)
  imageBounds.fills = [ paint]
  imageBounds.cornerRadius = node.cornerRadius
  imageBounds.resize(node.width >= maxWidth ? maxWidth : node.width, node.height <= maxImagePreviewHeight ? node.height : maxImagePreviewHeight)
  imageBounds.y = node.height >= maxImagePreviewHeight
    ? 0
    : node.height + imagePreviewInset >= maxImagePreviewHeight
      ? (maxImagePreviewHeight - node.height) / 2
      : imagePreviewInset
  imageBounds.x = node.width >= maxWidth
    ? 0
    : (maxWidth - node.width) / 2
  

  const label = figma.createText()
  label.name = "Label"
  label.fontName = fontName
  label.fills = [{ type: 'SOLID', color: black }]
  label.fontSize = 10
  
  const dominantLabel = label
  dominantLabel.characters = "DOMINANT COLOR"
  dominantLabel.y = contentStartY
  dominantLabel.x = leftMargin
  
  const recommendedTextLabel = dominantLabel.clone()
  recommendedTextLabel.characters = "RECOMMENDED TEXT COLOR"
  recommendedTextLabel.y = dominantLabel.y + labelBottomMargin + swatchSize + labelTopMargin

  const paletteLabel = recommendedTextLabel.clone()
  paletteLabel.characters = "PALETTE"
  paletteLabel.y = recommendedTextLabel.y + labelBottomMargin + swatchSize + labelTopMargin

  frame.appendChild(dominantLabel)
  frame.appendChild(recommendedTextLabel)
  frame.appendChild(paletteLabel)

  const swatch = figma.createRectangle()
  swatch.name = "Swatch"
  swatch.cornerRadius = 2
  swatch.resize(swatchSize, swatchSize)
  swatch.x = leftMargin
  swatch.y = dominantLabel.y + labelBottomMargin
  const dominantSwatch = swatch
  dominantSwatch.fills = [{ type: 'SOLID', color: dominantColor }]
  frame.appendChild(dominantSwatch)

  for (let [index, color] of suggestedTextColors.entries()) {
    let paletteSwatch = dominantSwatch.clone()
    paletteSwatch.x = leftMargin + (index * (swatchSize + swatchGap))
    paletteSwatch.y = recommendedTextLabel.y + labelBottomMargin
    paletteSwatch.fills = [{ type: 'SOLID', color }]
    // hacky way to determine if the swatch is white
    const { r, g, b } = color
    if (r === 1 && g === 1 && b === 1) {
      paletteSwatch.strokeAlign = "INSIDE"
      paletteSwatch.strokes = [{ type: 'SOLID', color: black, opacity: 0.08 }]
    }
    frame.appendChild(paletteSwatch)
  }
  
  
  for (let [index, color] of palette.entries()) {
    let paletteSwatch = dominantSwatch.clone()
    paletteSwatch.x = leftMargin + (index * (swatchSize + swatchGap))
    paletteSwatch.y = paletteLabel.y + labelBottomMargin
    paletteSwatch.fills = [{ type: 'SOLID', color }]
    // hacky way to determine if the swatch is white
    const { r, g, b } = color
    if (r === 1 && g === 1 && b === 1) {
      paletteSwatch.strokeAlign = "INSIDE"
      paletteSwatch.strokes = [{ type: 'SOLID', color: black, opacity: 0.08 }]
    }
    frame.appendChild(paletteSwatch)
  }

  return Promise.resolve(frame)
}