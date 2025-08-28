import p5 from 'p5'
import { Pane } from 'tweakpane'

interface DrawingSettings {
  divisions: number
  mirrorHorizontal: boolean
  mirrorVertical: boolean
  strokeWeight: number
  strokeColor: { r: number; g: number; b: number }
  backgroundColor: { r: number; g: number; b: number }
  sensitivity: number
}

const settings: DrawingSettings = {
  divisions: 8,
  mirrorHorizontal: true,
  mirrorVertical: true,
  strokeWeight: 2,
  strokeColor: { r: 1, g: 1, b: 1 },
  backgroundColor: { r: 0, g: 0, b: 0 },
  sensitivity: 1.0
}

let isDrawing = false
let lastX = 0
let lastY = 0

const sketch = (p: p5) => {
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
    canvas.parent('app')
    p.background(settings.backgroundColor.r * 255, settings.backgroundColor.g * 255, settings.backgroundColor.b * 255)
  }

  p.draw = () => {
    if (isDrawing && (p.mouseIsPressed || (p.touches && p.touches.length > 0))) {
      let currentX, currentY
      if (p.touches && p.touches.length > 0) {
        currentX = p.touches[0].x
        currentY = p.touches[0].y
      } else {
        currentX = p.mouseX
        currentY = p.mouseY
      }
      drawSymmetrical(p, currentX, currentY, lastX, lastY)
      lastX = currentX
      lastY = currentY
    }
  }

  const startDrawing = (x: number, y: number) => {
    // UI要素の範囲を取得
    const uiElement = document.getElementById('ui')
    if (uiElement) {
      const rect = uiElement.getBoundingClientRect()
      // 座標がUI要素の範囲内かチェック
      if (x >= rect.left && x <= rect.right && 
          y >= rect.top && y <= rect.bottom) {
        return // UI範囲内なら描画処理をスキップ
      }
    }
    
    if (x >= 0 && x <= p.width && y >= 0 && y <= p.height) {
      isDrawing = true
      lastX = x
      lastY = y
    }
  }

  p.mousePressed = () => {
    startDrawing(p.mouseX, p.mouseY)
  }

  p.mouseReleased = () => {
    isDrawing = false
  }

  p.touchStarted = () => {
    if (p.touches && p.touches.length > 0) {
      startDrawing(p.touches[0].x, p.touches[0].y)
    }
    return false // prevent default
  }

  p.touchEnded = () => {
    isDrawing = false
    return false // prevent default
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    p.background(settings.backgroundColor.r * 255, settings.backgroundColor.g * 255, settings.backgroundColor.b * 255)
  }

  p.keyPressed = () => {
    if (p.key === 'c' || p.key === 'C') {
      p.background(settings.backgroundColor.r * 255, settings.backgroundColor.g * 255, settings.backgroundColor.b * 255)
    }
  }
}

function drawSymmetrical(p: p5, x: number, y: number, lastX: number, lastY: number) {
  const centerX = p.width / 2
  const centerY = p.height / 2
  
  p.stroke(settings.strokeColor.r * 255, settings.strokeColor.g * 255, settings.strokeColor.b * 255)
  p.strokeWeight(settings.strokeWeight)
  
  const angleStep = (2 * Math.PI) / settings.divisions
  
  for (let i = 0; i < settings.divisions; i++) {
    const angle = i * angleStep
    
    p.push()
    p.translate(centerX, centerY)
    p.rotate(angle)
    
    const localX = x - centerX
    const localY = y - centerY
    const localLastX = lastX - centerX
    const localLastY = lastY - centerY
    
    p.line(localLastX, localLastY, localX, localY)
    
    if (settings.mirrorHorizontal) {
      p.line(-localLastX, localLastY, -localX, localY)
    }
    
    if (settings.mirrorVertical) {
      p.line(localLastX, -localLastY, localX, -localY)
    }
    
    if (settings.mirrorHorizontal && settings.mirrorVertical) {
      p.line(-localLastX, -localLastY, -localX, -localY)
    }
    
    p.pop()
  }
}

const pane = new Pane({ container: document.getElementById('ui')! })

pane.addBinding(settings, 'divisions', { 
  min: 1, 
  max: 32, 
  step: 1,
  label: '分割数'
})
pane.addBinding(settings, 'mirrorHorizontal', { label: '水平ミラー' })
pane.addBinding(settings, 'mirrorVertical', { label: '垂直ミラー' })
pane.addBinding(settings, 'strokeWeight', { 
  min: 0.5, 
  max: 20, 
  step: 0.5,
  label: '線の太さ'
})
pane.addBinding(settings, 'strokeColor', { 
  color: { type: 'float' },
  label: '線の色'
})
pane.addBinding(settings, 'backgroundColor', { 
  color: { type: 'float' },
  label: '背景色'
}).on('change', () => {
  const p5Instance = (window as any).p5Instance
  if (p5Instance) {
    p5Instance.background(
      settings.backgroundColor.r * 255, 
      settings.backgroundColor.g * 255, 
      settings.backgroundColor.b * 255
    )
  }
})
pane.addBinding(settings, 'sensitivity', { 
  min: 0.1, 
  max: 3.0, 
  step: 0.1,
  label: '感度'
})

pane.addButton({ title: 'キャンバスをクリア' }).on('click', () => {
  const p5Instance = (window as any).p5Instance
  if (p5Instance) {
    p5Instance.background(settings.backgroundColor.r * 255, settings.backgroundColor.g * 255, settings.backgroundColor.b * 255)
  }
})

pane.addButton({ title: 'PNG で保存' }).on('click', () => {
  const p5Instance = (window as any).p5Instance
  if (p5Instance) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    p5Instance.save(`symmetric-drawing-${timestamp}.png`)
  }
})

const p5Instance = new p5(sketch);
(window as any).p5Instance = p5Instance