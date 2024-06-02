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
