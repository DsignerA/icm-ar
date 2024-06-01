<template>
    <div>
      <h2>Admin Page</h2>
      <form @submit.prevent="addMarker">
        <input v-model="newMarker.name" placeholder="Marker Name" required />
        <input v-model="newMarker.type" placeholder="Marker Type" required />
        <input v-model="newMarker.src" placeholder="Marker Source URL" required />
        <button type="submit">Add Marker</button>
      </form>
      <ul>
        <li v-for="marker in markers" :key="marker.id">
          {{ marker.name }} - {{ marker.type }}
          <button @click="deleteMarker(marker.id)">Delete</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { db } from '../firebase';
  
  export default {
    data() {
      return {
        newMarker: {
          name: '',
          type: '',
          src: ''
        },
        markers: []
      };
    },
    methods: {
      async addMarker() {
        await db.collection('markers').add(this.newMarker);
        this.newMarker = { name: '', type: '', src: '' };
        this.fetchMarkers();
      },
      async fetchMarkers() {
        const markersSnapshot = await db.collection('markers').get();
        this.markers = markersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      async deleteMarker(id) {
        await db.collection('markers').doc(id).delete();
        this.fetchMarkers();
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
  