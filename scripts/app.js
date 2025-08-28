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
            if (confirm('¿Estás seguro de que quieres limpiar todo el grafo?')) {
                this.graph.clear();
                this.renderer.render();
                this.uiController.updateMetrics();
                this.uiController.updateAdjacencyMatrix();
            }
        });
        
        document.getElementById('directedToggle').addEventListener('click', () => {
            this.graph.directed = !this.graph.directed;
            this.uiController.updateDirectedToggle();
            this.uiController.updateMetrics();
            this.uiController.updateAdjacencyMatrix();
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GraphEditor();
});