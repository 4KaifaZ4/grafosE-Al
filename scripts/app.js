import { Graph } from './graph-model.js';
import { GraphRenderer } from './render-engine.js';
import { UIController } from './ui-controller.js';

class GraphEditor {
    constructor() {
        this.graph = new Graph();
        this.renderer = new GraphRenderer('graphCanvas', this.graph);
        this.uiController = new UIController(this.graph, this.renderer);
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.renderer.render();
        this.uiController.updateMetrics();
        this.uiController.updateAdjacencyMatrix();
    }
    
    setupEventListeners() {
        document.getElementById('addVertexBtn').addEventListener('click', () => {
            this.uiController.setMode('addVertex');
        });
        
        document.getElementById('addEdgeBtn').addEventListener('click', () => {
            this.uiController.setMode('addEdge');
        });
        
        document.getElementById('selectBtn').addEventListener('click', () => {
            this.uiController.setMode('select');
        });
        
        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.uiController.setMode('delete');
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres limpiar todo el grafo? Se perderán todos los datos.')) {
                if (this.graph.clear()) {
                    this.renderer.render();
                    this.uiController.updateMetrics();
                    this.uiController.updateAdjacencyMatrix();
                } else {
                    alert('No se pudo limpiar el grafo.');
                }
            }
        });
        
        document.getElementById('directedToggle').addEventListener('click', () => {
            const newDirected = !this.graph.directed;
            if (this.graph.setGraphDirection(newDirected)) {
                this.uiController.updateDirectedToggle();
                this.uiController.updateMetrics();
                this.uiController.updateAdjacencyMatrix();
                this.renderer.render(); // Re-renderizar para mostrar flechas
            } else {
                alert('No se pudo cambiar la dirección del grafo. Verifique que no haya conflictos con las aristas existentes.');
            }
        });
        
        document.getElementById('weightedToggle').addEventListener('click', () => {
            this.graph.weighted = !this.graph.weighted;
            this.uiController.updateWeightedToggle();
            this.renderer.render();
            this.uiController.updateMetrics();
            this.uiController.updateAdjacencyMatrix();
        });
        
        document.getElementById('graphCanvas').addEventListener('click', (e) => {
            this.uiController.handleCanvasClick(e);
        });
        
        // Event listener para el modal de peso
        document.getElementById('saveWeightBtn').addEventListener('click', () => {
            this.uiController.saveEdgeWeight();
        });
        
        // Event listener para cerrar el modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const weightModal = bootstrap.Modal.getInstance(document.getElementById('weightModal'));
                if (weightModal) {
                    weightModal.hide();
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GraphEditor();
});