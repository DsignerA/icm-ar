<template>
    <a-scene>
      <a-assets>
        <a-asset-item v-for="marker in markers" :key="marker.id" :id="marker.id" :src="marker.src"></a-asset-item>
      </a-assets>
  
      <a-marker v-for="marker in markers" :key="marker.id" :preset="marker.type">
        <a-entity :gltf-model="`#${marker.id}`"></a-entity>
      </a-marker>
  
      <a-entity camera></a-entity>
    </a-scene>
  </template>
  
  <script>
  import { db } from '../firebase';
  
  export default {
    data() {
      return {
        markers: []
      };
    },
    methods: {
      async fetchMarkers() {
        const markersSnapshot = await db.collection('markers').get();
        this.markers = markersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    },
    created() {
      this.fetchMarkers();
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  