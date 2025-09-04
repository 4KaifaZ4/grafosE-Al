export class GraphRenderer {
    constructor(canvasId, graph) {
        this.canvas = document.getElementById(canvasId);
        this.graph = graph;
        this.selectedElement = null;
        
        // Crear definición de marcador para flechas
        this.createArrowMarker();
    }
    
    createArrowMarker() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Marcador para flechas normales
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#6c757d');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        
        // Marcador para flechas de auto-conexiones
        const loopMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        loopMarker.setAttribute('id', 'arrowhead-loop');
        loopMarker.setAttribute('markerWidth', '10');
        loopMarker.setAttribute('markerHeight', '7');
        loopMarker.setAttribute('refX', '9');
        loopMarker.setAttribute('refY', '3.5');
        loopMarker.setAttribute('orient', 'auto');
        
        const loopPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        loopPolygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        loopPolygon.setAttribute('fill', '#6c757d');
        
        loopMarker.appendChild(loopPolygon);
        defs.appendChild(loopMarker);
        
        this.canvas.appendChild(defs);
    }
    
    render() {
        this.clearCanvas();
        this.renderEdges();
        this.renderVertices();
    }
    
    clearCanvas() {
        // Mantener solo la definición del marcador
        const defs = this.canvas.querySelector('defs');
        this.canvas.innerHTML = '';
        if (defs) {
            this.canvas.appendChild(defs);
        }
    }
    
    renderVertices() {
        this.graph.vertices.forEach(vertex => {
            // Usar el radio calculado según el tamaño del texto
            const radius = vertex.radius || 20;
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', vertex.x);
            circle.setAttribute('cy', vertex.y);
            circle.setAttribute('r', radius);
            circle.setAttribute('class', 'vertex');
            circle.setAttribute('fill', vertex.color);
            circle.setAttribute('data-id', vertex.id);
            
            if (this.selectedElement?.type === 'vertex' && this.selectedElement.id === vertex.id) {
                circle.classList.add('selected');
            }
            
            this.canvas.appendChild(circle);
            
            // Renderizar etiqueta
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', vertex.x);
            text.setAttribute('y', vertex.y);
            text.setAttribute('class', 'vertex-text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = vertex.label;
            this.canvas.appendChild(text);
        });
    }
    
    renderEdges() {
        this.graph.edges.forEach(edge => {
            const sourceVertex = this.graph.getVertex(edge.source);
            const targetVertex = this.graph.getVertex(edge.target);
            
            if (!sourceVertex || !targetVertex) return;
            
            if (sourceVertex.id === targetVertex.id) {
                // Auto-conexión (arista al mismo nodo)
                this.renderSelfLoop(sourceVertex, edge);
            } else {
                // Arista normal entre nodos diferentes
                this.renderNormalEdge(sourceVertex, targetVertex, edge);
            }
        });
    }
    
    renderNormalEdge(sourceVertex, targetVertex, edge) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        // Calcular desplazamiento para que la línea no se superponga con los vértices
        const sourceRadius = sourceVertex.radius || 20;
        const targetRadius = targetVertex.radius || 20;
        
        // Calcular ángulo y puntos de inicio/fin
        const dx = targetVertex.x - sourceVertex.x;
        const dy = targetVertex.y - sourceVertex.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return; // Evitar división por cero
        
        const offsetX = (dx / distance) * sourceRadius;
        const offsetY = (dy / distance) * sourceRadius;
        
        line.setAttribute('x1', sourceVertex.x + offsetX);
        line.setAttribute('y1', sourceVertex.y + offsetY);
        line.setAttribute('x2', targetVertex.x - offsetX);
        line.setAttribute('y2', targetVertex.y - offsetY);
        line.setAttribute('class', 'edge');
        line.setAttribute('data-id', edge.id);
        
        if (edge.directed) {
            line.setAttribute('marker-end', 'url(#arrowhead)');
        }
        
        if (this.selectedElement?.type === 'edge' && this.selectedElement.id === edge.id) {
            line.classList.add('selected');
        }
        
        this.canvas.appendChild(line);
        
        // Renderizar peso si es ponderado
        if (this.graph.weighted && edge.weight !== undefined) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const midX = (sourceVertex.x + targetVertex.x) / 2;
            const midY = (sourceVertex.y + targetVertex.y) / 2;
            
            // Desplazar ligeramente el texto para mejor legibilidad
            const textOffsetX = -dy / distance * 15;
            const textOffsetY = dx / distance * 15;
            
            text.setAttribute('x', midX + textOffsetX);
            text.setAttribute('y', midY + textOffsetY);
            text.setAttribute('class', 'edge-text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = edge.weight.toString();
            this.canvas.appendChild(text);
        }
    }
    
    renderSelfLoop(vertex, edge) {
        // Dibujar un bucle (círculo) para auto-conexiones
        const loop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const radius = vertex.radius || 20;
        
        loop.setAttribute('cx', vertex.x);
        loop.setAttribute('cy', vertex.y - radius - 15);
        loop.setAttribute('r', '15');
        loop.setAttribute('class', 'edge-loop');
        loop.setAttribute('data-id', edge.id);
        
        if (edge.directed) {
            loop.setAttribute('marker-end', 'url(#arrowhead-loop)');
        }
        
        if (this.selectedElement?.type === 'edge' && this.selectedElement.id === edge.id) {
            loop.classList.add('selected');
        }
        
        this.canvas.appendChild(loop);
        
        // Renderizar peso si es ponderado
        if (this.graph.weighted && edge.weight !== undefined) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', vertex.x);
            text.setAttribute('y', vertex.y - radius - 35);
            text.setAttribute('class', 'edge-text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = edge.weight.toString();
            this.canvas.appendChild(text);
        }
    }
    
    getElementAtPosition(x, y) {
        // Buscar vértices primero (están encima de las aristas)
        for (let i = this.graph.vertices.length - 1; i >= 0; i--) {
            const vertex = this.graph.vertices[i];
            const radius = vertex.radius || 20;
            const distance = Math.sqrt(Math.pow(vertex.x - x, 2) + Math.pow(vertex.y - y, 2));
            if (distance <= radius) {
                return { type: 'vertex', id: vertex.id };
            }
        }
        
        // Buscar aristas
        for (let i = this.graph.edges.length - 1; i >= 0; i--) {
            const edge = this.graph.edges[i];
            const sourceVertex = this.graph.getVertex(edge.source);
            const targetVertex = this.graph.getVertex(edge.target);
            
            if (!sourceVertex || !targetVertex) continue;
            
            if (sourceVertex.id === targetVertex.id) {
                // Auto-conexión: verificar si el clic está cerca del bucle
                const radius = sourceVertex.radius || 20;
                const loopX = sourceVertex.x;
                const loopY = sourceVertex.y - radius - 15;
                const distance = Math.sqrt(Math.pow(loopX - x, 2) + Math.pow(loopY - y, 2));
                
                if (distance <= 20) {
                    return { type: 'edge', id: edge.id };
                }
            } else {
                // Arista normal: calcular distancia desde el punto a la línea
                const distance = this.pointToLineDistance(x, y, sourceVertex.x, sourceVertex.y, targetVertex.x, targetVertex.y);
                
                if (distance <= 5) {
                    return { type: 'edge', id: edge.id };
                }
            }
        }
        
        return null;
    }
    
    pointToLineDistance(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    selectElement(element) {
        this.selectedElement = element;
        this.render();
    }
    
    clearSelection() {
        this.selectedElement = null;
        this.render();
    }
    
    // Método para exportar como imagen (corregido)
    exportAsImage() {
        // Crear un canvas para convertir SVG a PNG
        const canvas = document.createElement('canvas');
        canvas.width = this.canvas.width.baseVal.value;
        canvas.height = this.canvas.height.baseVal.value;
        
        const ctx = canvas.getContext('2d');
        
        // Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Obtener el SVG como cadena de texto
        const svgData = new XMLSerializer().serializeToString(this.canvas);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Crear una imagen a partir del SVG
        const img = new Image();
        img.onload = () => {
            // Dibujar la imagen SVG en el canvas
            ctx.drawImage(img, 0, 0);
            
            // Obtener la imagen como PNG
            const imgData = canvas.toDataURL('image/png');
            
            // Crear un enlace de descarga
            const link = document.createElement('a');
            link.download = 'grafo.png';
            link.href = imgData;
            link.click();
            
            // Liberar recursos
            URL.revokeObjectURL(svgUrl);
        };
        
        img.onerror = (error) => {
            console.error('Error al cargar la imagen SVG:', error);
            alert('Error al exportar la imagen. Intente nuevamente.');
            URL.revokeObjectURL(svgUrl);
        };
        
        img.src = svgUrl;
    }
}