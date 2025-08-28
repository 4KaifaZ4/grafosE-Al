export class FileManager {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
    }
    
    saveGraph() {
        const graphData = {
            vertices: this.graph.vertices,
            edges: this.graph.edges,
            directed: this.graph.directed,
            weighted: this.graph.weighted,
            nextVertexId: this.graph.nextVertexId,
            nextEdgeId: this.graph.nextEdgeId
        };
        
        const dataStr = JSON.stringify(graphData);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'grafo.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    loadGraph() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const graphData = JSON.parse(event.target.result);
                    
                    this.graph.vertices = graphData.vertices || [];
                    this.graph.edges = graphData.edges || [];
                    this.graph.directed = graphData.directed || false;
                    this.graph.weighted = graphData.weighted || false;
                    this.graph.nextVertexId = graphData.nextVertexId || 1;
                    this.graph.nextEdgeId = graphData.nextEdgeId || 1;
                    
                    this.renderer.render();
                    
                    // Actualizar UI
                    document.getElementById('directedToggle').textContent = 
                        this.graph.directed ? 'Dirigido' : 'No Dirigido';
                    document.getElementById('weightedToggle').textContent = 
                        this.graph.weighted ? 'Ponderado' : 'No Ponderado';
                    
                    // Actualizar métricas y matrices
                    const event = new CustomEvent('graphLoaded');
                    document.dispatchEvent(event);
                    
                } catch (error) {
                    alert('Error al cargar el archivo: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    exportAsImage() {
        const svg = document.getElementById('graphCanvas');
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = svg.width.baseVal.value;
            canvas.height = svg.height.baseVal.value;
            
            const context = canvas.getContext('2d');
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
            
            const imgUrl = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.download = 'grafo.png';
            link.href = imgUrl;
            link.click();
            
            URL.revokeObjectURL(svgUrl);
        };
        
        image.src = svgUrl;
    }
}