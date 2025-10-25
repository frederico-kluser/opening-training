/**
 * Custom RightClickAnnotator Extension
 * Modificado para usar marcadores quadrados (casa inteira) ao invés de círculos
 * Baseado em: cm-chessboard/src/extensions/right-click-annotator/RightClickAnnotator.js
 */

// Tipos de setas (mantidos do original)
export const ARROW_TYPE = {
    success: { class: "arrow-success"},
    warning: { class: "arrow-warning"},
    info: { class: "arrow-info"},
    danger: { class: "arrow-danger"}
}

// Tipos de marcadores - MODIFICADO para usar markerSquare
export const MARKER_TYPE = {
    success: {class: "marker-square-success", slice: "markerSquare"},
    warning: {class: "marker-square-warning", slice: "markerSquare"},
    info: {class: "marker-square-info", slice: "markerSquare"},
    danger: {class: "marker-square-danger", slice: "markerSquare"},
}

export class CustomRightClickAnnotator {
    constructor(chessboard, props = {}) {
        this.chessboard = chessboard
        this.props = props || {}

        // Garantir que extensões Arrows e Markers existem
        // Note: cm-chessboard não tem getExtension, então assumimos que já foram adicionadas

        this.onContextMenu = this.onContextMenu.bind(this)
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)

        this.dragStart = undefined // {square, modifiers}
        this.previewActiveTo = undefined // cache last to-square for preview

        this.chessboard.context.addEventListener("contextmenu", this.onContextMenu)
        this.chessboard.context.addEventListener("mousedown", this.onMouseDown)
        this.chessboard.context.addEventListener("mousemove", this.onMouseMove)
        this.chessboard.context.addEventListener("mouseup", this.onMouseUp)
        this.chessboard.context.addEventListener("mouseleave", this.onMouseUp)

        // API pública
        this.chessboard.getAnnotations = this.getAnnotations.bind(this)
        this.chessboard.setAnnotations = this.setAnnotations.bind(this)
    }

    destroy() {
        this.chessboard.context.removeEventListener("contextmenu", this.onContextMenu)
        this.chessboard.context.removeEventListener("mousedown", this.onMouseDown)
        this.chessboard.context.removeEventListener("mousemove", this.onMouseMove)
        this.chessboard.context.removeEventListener("mouseup", this.onMouseUp)
        this.chessboard.context.removeEventListener("mouseleave", this.onMouseUp)
    }

    getAnnotations() {
        return {
            arrows: this.chessboard.getArrows(),
            markers: this.chessboard.getMarkers()
        }
    }

    setAnnotations(annotations) {
        this.chessboard.removeArrows()
        this.chessboard.removeMarkers()
        if (annotations.arrows) {
            for (const arrow of annotations.arrows) {
                this.chessboard.addArrow(arrow.type, arrow.from, arrow.to)
            }
        }
        if (annotations.markers) {
            for (const marker of annotations.markers) {
                this.chessboard.addMarker(marker.type, marker.square)
            }
        }
    }

    onContextMenu(event) {
        event.preventDefault()
    }

    onMouseDown(event) {
        // right button only
        if (event.button !== 2) {
            return
        }
        const square = this.findSquareFromEvent(event)
        if (!square) {
            return
        }
        this.dragStart = {
            square,
            modifiers: {
                alt: event.altKey,
                shift: event.shiftKey
            }
        }
    }

    onMouseUp(event) {
        // clear preview regardless of button, but only act on right-button release
        this.removePreviewArrow()
        const start = this.dragStart
        this.dragStart = undefined
        if (!start || event.button !== 2) {
            return
        }
        const endSquare = this.findSquareFromEvent(event) || start.square
        const colorKey = this.modifiersToColorKey(start.modifiers)
        const {arrowType, squareType} = this.typesForColorKey(colorKey)

        if (start.square && endSquare && start.square !== endSquare) {
            // toggle arrow
            const existing = this.chessboard.getArrows(arrowType, start.square, endSquare)
            if (existing && existing.length > 0) {
                this.chessboard.removeArrows(arrowType, start.square, endSquare)
            } else {
                this.chessboard.removeArrows(undefined, start.square, endSquare)
                this.chessboard.addArrow(arrowType, start.square, endSquare)
            }
        } else if (start.square) {
            // toggle marker on start square - USANDO QUADRADO
            const existingMarkers = this.chessboard.getMarkers(squareType, start.square)
            if (existingMarkers && existingMarkers.length > 0) {
                this.chessboard.removeMarkers(squareType, start.square)
            } else {
                this.chessboard.removeMarkers(undefined, start.square)
                this.chessboard.addMarker(squareType, start.square)
            }
        }
    }

    findSquareFromEvent(event) {
        const target = event.target
        if (!target) return undefined
        if (target.getAttribute && target.getAttribute("data-square")) {
            return target.getAttribute("data-square")
        }
        const el = target.closest && target.closest("[data-square]")
        return el ? el.getAttribute("data-square") : undefined
    }

    onMouseMove(event) {
        if (!this.dragStart) {
            return
        }
        const toSquare = this.findSquareFromEvent(event)
        if (!toSquare || toSquare === this.dragStart.square) {
            return
        }
        if (this.previewActiveTo === toSquare) {
            return // no change
        }
        this.previewActiveTo = toSquare
        const colorKey = this.modifiersToColorKey(this.dragStart.modifiers)
        const {arrowType} = this.typesForColorKey(colorKey)
        this.drawPreviewArrow(this.dragStart.square, toSquare, arrowType)
    }

    drawPreviewArrow(from, to, type) {
        if(!this.previewArrowType) {
            this.previewArrowType = {...type}
        }
        this.chessboard.removeArrows(this.previewArrowType)
        this.chessboard.addArrow(this.previewArrowType, from, to)
    }

    removePreviewArrow() {
        if(this.previewArrowType) {
            this.chessboard.removeArrows(this.previewArrowType)
            this.previewArrowType = undefined
        }
    }

    modifiersToColorKey(modifiers) {
        if (modifiers.shift && modifiers.alt) return "warning"
        if (modifiers.shift) return "danger"
        if (modifiers.alt) return "info"
        return "success"
    }

    typesForColorKey(key) {
        return {
            arrowType: ARROW_TYPE[key],
            squareType: MARKER_TYPE[key] // Mudado de circleType para squareType
        }
    }
}
