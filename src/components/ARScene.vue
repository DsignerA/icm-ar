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
      <a-assets>
        <a-asset-item id="apt1" src="https://rvanfts.com/ar/1-branded-chips/scene.gltf" @loaded="onAssetLoaded('apt1')" @error="onAssetError('apt1')"></a-asset-item>
        <a-asset-item id="apt2" src="https://rvanfts.com/ar/ps5/scene.gltf" @loaded="onAssetLoaded('apt2')" @error="onAssetError('apt2')"></a-asset-item>
      </a-assets>

      <a-marker preset="hiro" id="marker1" @markerFound="onMarkerFound('marker1')" @markerLost="onMarkerLost('marker1')">
        <a-entity
          raycaster="objects: .clickable"
          position="0 0 0"
          id="myapt1"
          scale="1 1 1"
          rotation="-50 0 0"
          gltf-model="#apt1"
          class="clickable"
          visible="true"
          @model-loaded="onModelLoaded('myapt1')"
          @model-error="onModelError('myapt1')"
          gesture-handler
        ></a-entity>
      </a-marker>

      <a-marker type="pattern" url="https://rvanfts.com/ar/1patterns/main-ar.patt" id="marker2" @markerFound="onMarkerFound('marker2')" @markerLost="onMarkerLost('marker2')">
        <a-entity
          raycaster="objects: .clickable"
          position="0 0 0"
          id="myapt2"
          scale=".01 .01 .01"
          rotation="-50 0 0"
          gltf-model="#apt2"
          class="clickable"
          visible="true"
          @model-loaded="onModelLoaded('myapt2')"
          @model-error="onModelError('myapt2')"
          gesture-handler
        ></a-entity>
      </a-marker>

      <a-entity camera></a-entity>
    </a-scene>
  </div>
</template>

<script>
export default {
  methods: {
    onAssetLoaded(assetId) {
      console.log(`Asset ${assetId} loaded successfully.`);
    },
    onAssetError(assetId) {
      console.error(`Failed to load asset ${assetId}.`);
    },
    onMarkerFound(markerId) {
      console.log(`Marker ${markerId} found.`);
    },
    onMarkerLost(markerId) {
      console.log(`Marker ${markerId} lost.`);
    },
    onModelLoaded(entityId) {
      console.log(`Model ${entityId} loaded successfully.`);
    },
    onModelError(entityId) {
      console.error(`Failed to load model ${entityId}.`);
    }
  },
  mounted() {
    console.log('ARScene component mounted.');
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
