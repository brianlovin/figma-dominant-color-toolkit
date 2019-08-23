import { RGB } from './colors'
import { isArray } from 'util';

function isTextNode(node): boolean {
  return node.type === "TEXT"
}

const validShapeTypes = ["RECTANGLE", "ELLIPSE", "POLYGON", "STAR", "VECTOR"]
function isShapeNode(node): boolean {
  return validShapeTypes.indexOf(node.type) >= 0
}

const validFrameTypes = ["COMPONENT", "INSTANCE", "FRAME"]
export function isFrametypeNode(node): boolean {
  return validFrameTypes.indexOf(node.type) >= 0
}

// doesnt traverse into any children
export function getTextNodesFromShallowSelection(nodes) {
  return nodes.filter(isTextNode)
}

// doesnt traverse into any children
export function getShapeNodesFromShallowSelection(nodes) {
  return nodes.filter(isShapeNode)
}

// gets all nodes regardless of how deep the selection goes
export function getTextNodesFromDeepSelection(node) {
  let filtered = []
  
  if (isTextNode(node)) {
    filtered.push(node)
  }

  if (isFrametypeNode(node)) {
    if (node.children.length > 0) {
      filtered.push(...node.children.map(getTextNodesFromDeepSelection).filter(Boolean))
    }
  }

  return [].concat.apply([], filtered)
}

// gets all nodes regardless of how deep the selection goes
export function getShapeNodesFromDeepSelection(node) {
  let filtered = []
  
  if (isShapeNode(node)) {
    if (!nodeIsSourceImage(node)) filtered.push(node)
  }

  if (isFrametypeNode(node)) {
    if (node.children.length > 0) {
      filtered.push(...node.children.map(getShapeNodesFromDeepSelection).filter(Boolean))
    }
  }

  return [].concat.apply([], filtered)
}

function paintIsImage(paint): boolean {
  return paint.type === "IMAGE"
}

function nodeFillsContainsImagePaint(node): boolean {
  if (node.fills) {
    if (node.fills.length === 0) return false
    if (!Array.isArray(node.fills)) return false
    return node.fills.some(paintIsImage)
  }

  if (node.backgrounds) {
    if (node.backgrounds.length === 0) return false
    if (!Array.isArray(node.backgrounds)) return false
    return node.backgrounds.some(paintIsImage)
  }

  return false
}

function nodesContainFillable(nodes): boolean {
  if (nodes.length === 0) return false

  return nodes.some(node => {
    if (node.children) return nodesContainFillable(node.children)
    return isShapeNode(node) || isTextNode(node)
  })
}

function nodeContainsSourceImage(node): boolean {
  if (isShapeNode(node)) return nodeFillsContainsImagePaint(node)
  if (isFrametypeNode(node)) {
    const frameIsSourceImage = nodeFillsContainsImagePaint(node)
    const frameContainsChildrenWithSourceImage = nodesContainSourceImage(node.children)
    return frameIsSourceImage || frameContainsChildrenWithSourceImage
  }
}

function nodesContainSourceImage(nodes): boolean {
  if (nodes.length === 0) return false
  return nodes.some(nodeContainsSourceImage)
}

export function getFirstImagePaintFromNode(node) {
  if (node.fills) return node.fills.find(paintIsImage)
  if (node.backgrounds) return node.backgrounds.find(paintIsImage)
}

export function hasValidSelection(nodes): boolean {
  return nodes.length > 0
}

export function selectedSingleImage(nodes) {
  const singleSelectedNode = nodes.length === 1
  if (!singleSelectedNode) return false
  
  const selectedNode = nodes[0]
  const isShape = isShapeNode(selectedNode)
  const isFrame = isFrametypeNode(selectedNode)
  if (!isShape && !isFrame) return false

  const hasChildren = isFrame && selectedNode.children.length > 0
  if (hasChildren) return false

  return nodeFillsContainsImagePaint(selectedNode)
}

export function selectedFrameContainsImageAndFillables(nodes): boolean {
  const singleSelectedNode = nodes.length === 1
  if (!singleSelectedNode) return false

  const selectedNode = nodes[0]
  const isFrame = isFrametypeNode(selectedNode)
  if (!isFrame) return false

  // does the frame itself contain a valid paint?
  if (nodeFillsContainsImagePaint(selectedNode)) {
    // see if fillables exist within the frame
    return nodesContainFillable(selectedNode.children)
  } else {
    // otherwise find a source image from the node's children
    return nodesContainSourceImage(selectedNode.children)
  }
}

export function selectedImageAndFillables(nodes): boolean {
  const singleSelectedNode = nodes.length === 1
  if (singleSelectedNode) return false
  
  const hasSourceImage = nodesContainSourceImage(nodes)
  const hasFillables = nodesContainFillable(nodes)
  return hasSourceImage && hasFillables
}

function parentTreeOfNodesHasSourceImage(nodes): boolean {
  for (let node of nodes) {
    // we've gone too far
    if (node.type === "PAGE") return false

    if (nodeIsSourceImage(node)) return true
    if (nodeContainsSourceImage(node)) return true

    const parentContainsSource = nodesContainSourceImage(node.parent.children)
    const parentIsSource = nodeIsSourceImage(node.parent)
    if (parentContainsSource || parentIsSource) return true

    return parentTreeOfNodesHasSourceImage(node.parent.parent.children)
  }
}

export function seletedFillablesWithoutImage(nodes) {
  const hasFillables = nodesContainFillable(nodes)
  if (!hasFillables) return false

  const hasSourceImage = nodesContainSourceImage(nodes)
  if (hasSourceImage) return false

  return parentTreeOfNodesHasSourceImage(nodes)
}

export function nodeIsSourceImage(node): boolean {
  return nodeFillsContainsImagePaint(node)
}

export function getSourceImageNodeFromParentsOfNodes(nodes) {
  for (let node of nodes) {
    if (node.type === "PAGE") return null
    if (node.parent.type === "PAGE") {
      if (!nodeIsSourceImage(node)) return null
    }

    if (nodeIsSourceImage(node)) return node
    if (nodeIsSourceImage(node.parent)) return node.parent
    
    const siblingIsSourceImage = node.parent.children.find(nodeIsSourceImage)
    if (siblingIsSourceImage) return siblingIsSourceImage

    if (parentTreeOfNodesHasSourceImage(nodes)) return getSourceImageNodeFromParentsOfNodes(node.parent.parent.children)
    return null
  }
}

export function getSourceImageNodeFromNodes(nodes) {
  for (let node of nodes) {
    if (nodeIsSourceImage(node)) return node
    if (node.children) return getSourceImageNodeFromNodes(node.children)
  }
}


export async function getDataForUIFromNode(node) {
  const paint = getFirstImagePaintFromNode(node)
  const hash = figma.getImageByHash(paint.imageHash)
  const imageBytes = await hash.getBytesAsync()
  const { width, height, name } = node
  return { imageBytes, width, height, name }
}
              

export interface UIColorData {
  dominantColor: RGB;
  suggestedTextColors: RGB[];
  palette: RGB[]
}

function setNodeFillFromRGB(node, color: RGB, options = {}) {
  // only override the color and optional properties, but retain all 
  // existing properties like fill opacity
  const gradientFillTypes = [ "GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"]
  const solidFill = (fill) => ({ ...fill, color, ...options })
  const gradientFill = (fill) => ({ 
    ...fill,
    gradientStops: fill.gradientStops.map(gs => ({ ...gs, color: { ...gs.color, ...color }})),
    ...options
  })

  if (!Array.isArray(node.fills)) return

  const copies = node.fills.slice().map(fill => { 
    if (fill.type === "IMAGE") return fill
    if (fill.type === 'SOLID') return solidFill(fill)
    if (gradientFillTypes.indexOf(fill.type) >= 0) return gradientFill(fill)
    return fill
  })

  return node.fills = copies
}

export async function applyTransformationsToNodes(nodes, data: UIColorData) {
  const { dominantColor, suggestedTextColors } = data

  for (let node of nodes) {
    if (isTextNode(node)) {
      const textColor = node.name.includes('dominant')
        ? dominantColor
        : suggestedTextColors[0]
      setNodeFillFromRGB(node, textColor, { opacity: 0.9 })
    }

    if (isShapeNode(node)) {
      if (!nodeFillsContainsImagePaint(node)) setNodeFillFromRGB(node, dominantColor)
    }

    if (isFrametypeNode(node)) {
      return applyTransformationsToNodes(node.children, data)
    }
  }
}