import {
  isFrametypeNode,
  nodeIsSourceImage,
  getTextNodesFromShallowSelection,
  getShapeNodesFromShallowSelection,
  getTextNodesFromDeepSelection,
  getShapeNodesFromDeepSelection,
  hasValidSelection,
  selectedSingleImage,
  selectedFrameContainsImageAndFillables,
  selectedImageAndFillables,
  seletedFillablesWithoutImage,
  getSourceImageNodeFromNodes,
  getDataForUIFromNode,
  getSourceImageNodeFromParentsOfNodes,
  applyTransformationsToNodes,
} from './utils'
import { generateColorGuideFrame } from './canvas'
console.log(figma.currentPage.selection)
figma.showUI(__html__, { visible: false })

function populateUI(data) {
  figma.ui.postMessage(data)
}

async function main(nodes) {
  if (!hasValidSelection(nodes)) return figma.closePlugin('Invalid selection')

  if (nodes.length > 1 && nodes.every(isFrametypeNode)) {
    console.log({ 1: nodes })
    for (let frame of nodes) {
      await main([frame])
    }

    return Promise.resolve()
  }

  if (nodes.length > 1 && nodes.every(nodeIsSourceImage)) {
    console.log({ 2: nodes })
    for (let image of nodes) {
      await main([ image ])
    }

    return Promise.resolve()
  }
  
  if (selectedSingleImage(nodes)) {
    console.log({ 3: nodes })

    const node = nodes[0]
    const data = await getDataForUIFromNode(node)
    populateUI(data)

    return new Promise(res => {
      figma.ui.onmessage = async data => {
        await generateColorGuideFrame(node, data).then(node => {
          figma.currentPage.selection = [ node ]
          figma.viewport.scrollAndZoomIntoView([ node ])
          res()
        })
      }

      return Promise.resolve()
    })
  }

  if (selectedFrameContainsImageAndFillables(nodes)) {
    console.log({ 4: nodes })

    // open the modal with the selected image
    const node = getSourceImageNodeFromNodes(nodes)
    const data = await getDataForUIFromNode(node)
    populateUI(data)

    const selectedNode = nodes[0]
    const textNodes = getTextNodesFromDeepSelection(selectedNode)
    const shapeNodes = getShapeNodesFromDeepSelection(selectedNode)
    const transformable = [...textNodes, ...shapeNodes]

    return new Promise(res => {
      figma.ui.onmessage = async data => {
        await applyTransformationsToNodes(transformable, data).then(() => res())
      }

      return Promise.resolve()
    })
  }

  if (selectedImageAndFillables(nodes)) {
    console.log({ 5: nodes })

    const node = getSourceImageNodeFromNodes(nodes)
    const data = await getDataForUIFromNode(node)
    populateUI(data)
  
    const textNodes = getTextNodesFromShallowSelection(nodes)
    const shapeNodes = getShapeNodesFromShallowSelection(nodes)
    const transformable = [...textNodes, ...shapeNodes]

    return new Promise(res => {
      figma.ui.onmessage = async data => {
        await applyTransformationsToNodes(transformable, data).then(() => res())
      }
    })
  }

  if (seletedFillablesWithoutImage(nodes)) {
    console.log({ 6: nodes })

    const node = getSourceImageNodeFromParentsOfNodes(nodes)
    const data = await getDataForUIFromNode(node)
    populateUI(data)

    return new Promise(res => {
      figma.ui.onmessage = async data => {
        await applyTransformationsToNodes(nodes, data).then(() => res())
      }

      return Promise.resolve()
    })
  }

  figma.closePlugin("Couldn't process your selection. Please try again")
}

const selection = figma.currentPage.selection
main(selection).then(() => figma.closePlugin('Colors generated ✨'))