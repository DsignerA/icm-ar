<template>
  <div style="margin: 0px; overflow: hidden;">
    <a-scene
      loading-screen="dotsColor: white; backgroundColor: black"
      gltf-model="dracoDecoderPath: https://rvanfts.com/draco-master/javascript/;"
      id="scene"
      cursor="fuse: false; rayOrigin: mouse;"
      embedded
      arjs="debugUIEnabled: false;"
      vr-mode-ui="enabled: false"
      artoolkit="sourceType: webcam; detectionMode: mono; maxDetectionRate: 30; canvasWidth: 240; canvasHeight: 180"
      ar-template
      renderer="logarithmicDepthBuffer: false;"
      gesture-detector
    >
      <!-- Use the preloaded assets -->
      <a-marker preset="hiro" id="marker1">
        <a-entity
          raycaster="objects: .clickable"
          position="0 0 0"
          id="myapt1"
          scale="1 1 1"
          rotation="-50 0 0"
          gltf-model="#apt1"
          class="clickable"
          visible="true"
          gesture-handler
        ></a-entity>
      </a-marker>

      <a-marker type="pattern" url="https://rvanfts.com/ar/1patterns/main-ar.patt" id="marker2">
        <a-entity
          raycaster="objects: .clickable"
          position="0 0 0"
          id="myapt2"
          scale=".01 .01 .01"
          rotation="-50 0 0"
          gltf-model="#apt2"
          class="clickable"
          visible="true"
          gesture-handler
        ></a-entity>
      </a-marker>

      <a-entity camera></a-entity>
    </a-scene>
  </div>
</template>

<script>
export default {
  mounted() {
    // Add any initialization logic here
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
