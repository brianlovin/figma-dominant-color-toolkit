import { RGB } from './colors'

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

function nodeContainsImagePaint(node): boolean {
  if (node.fills) return node.fills.some(paintIsImage)
  if (node.backgrounds) return node.backgrounds.some(paintIsImage)
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
  if (isShapeNode(node)) return nodeContainsImagePaint(node)
  if (isFrametypeNode(node)) {
    const frameIsSourceImage = nodeContainsImagePaint(node)
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

  return nodeContainsImagePaint(selectedNode)
}

export function selectedFrameContainsImageAndFillables(nodes): boolean {
  const singleSelectedNode = nodes.length === 1
  if (!singleSelectedNode) return false

  const selectedNode = nodes[0]
  const isFrame = isFrametypeNode(selectedNode)
  if (!isFrame) return false

  // does the frame itself contain a valid paint?
  if (nodeContainsImagePaint(selectedNode)) {
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
  return nodes.some(node => {
    // if we get outside of a frame, we've gone too far
    if (nodeContainsSourceImage(node)) return true
    if (node.type === "PAGE") return false
    const parentContainsSource = nodesContainSourceImage(node.parent.children)
    const parentIsSource = nodeIsSourceImage(node.parent)
    return parentContainsSource || parentIsSource
  })
}

export function seletedFillablesWithoutImage(nodes) {
  const hasFillables = nodesContainFillable(nodes)
  if (!hasFillables) return false

  const hasSourceImage = nodesContainSourceImage(nodes)
  if (hasSourceImage) return false

  return parentTreeOfNodesHasSourceImage(nodes)
}

export function getSourceImageNodeFromParentsOfNodes(nodes) {
  for (let node of nodes) {
    if (nodeIsSourceImage(node)) return node
    if (nodeIsSourceImage(node.parent)) return node.parent
    return getSourceImageNodeFromParentsOfNodes(node.parent.children)
  }
}

export function nodeIsSourceImage(node): boolean {
  if (isShapeNode(node)) {
    if(nodeContainsImagePaint(node)) {
      return true
    }

    return false
  }

  if (isFrametypeNode(node)) {
    if (nodeContainsImagePaint(node)) {
      return true
    }

    return false
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
  const copies = node.fills.slice().map(fill => ({ ...fill, color, ...options }))
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
      if (!nodeContainsImagePaint(node)) setNodeFillFromRGB(node, dominantColor)
    }

    if (isFrametypeNode(node)) {
      return applyTransformationsToNodes(node.children, data)
    }
  }
}