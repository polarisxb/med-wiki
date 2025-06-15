<template>
  <div class="location-category-page">
    <!-- 面包屑导航 -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <ol>
        <li><router-link to="/">首页</router-link></li>
        <li>按地点分类</li>
      </ol>
    </nav>

    <h1 class="page-title">按地点分类</h1>

    <div class="map-container">
      <!-- 学校地图图片 -->
      <div
          class="map-wrapper"
          ref="mapWrapper"
          @wheel="handleWheelZoom"
          @mousedown="handleMouseDown"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          :class="{ 'is-dragging': isDragging }"
      >
        <img
            src="/images/school-map.jpg"
            alt="学校地图"
            class="school-map"
            ref="mapImage"
            :style="mapTransformStyle"
            @load="handleImageLoad"
        >
        <!-- 地点标记将在这里添加 -->
        <div
            v-for="(location, index) in locationsWithCoords"
            :key="location.id || index"
            class="location-marker"
            :style="getMarkerStyle(location.coords)"
            @click.stop="handleMarkerClick(location)"
            @touchend.stop="handleMarkerClick(location)"
        >
          {{ index + 1 }} <!-- 显示标记编号 -->
        </div>
      </div>

      <!-- 地点标记和药材列表区域 -->
      <div class="location-info">
        <h2>地点药材列表</h2>
        <!-- 还原按钮 -->
        <button @click="resetMap" class="reset-button">还原地图</button>

        <!-- 这里将根据点击的地图地点显示药材列表 -->
        <div v-if="displayedHerbs.length > 0" class="herb-list">
          <router-link
              v-for="herb in displayedHerbs"
              :key="herb.id"
              :to="`/detail/${herb.id}`"
              class="herb-card"
          >
            <!-- 修改这里：从 images 数组中取第一个图片路径 -->
            <div class="herb-image-wrapper">
              <img
                  v-if="herb.images && herb.images.length > 0"
                  :src="herb.images[0]"
                  :alt="herb.name"
                  class="herb-thumbnail"
              />
              <div v-else class="herb-image-placeholder">
                {{ herb.name.substring(0, 2) }}
              </div>
            </div>

            <div class="herb-info">
              <div class="herb-name">
                {{ herb.name }}
              </div>
              <div class="herb-effects">
                <span v-for="effect in formatEffects(herb.effects)" :key="effect" class="effect-tag">
                  {{ effect }}
                </span>
              </div>
            </div>
          </router-link>
        </div>
        <div v-else class="empty-state">
          点击地图上的地点查看药材信息。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import categoriesData from '@/data/categories.json';
import herbsData from '@/data/herbs.json';

const displayedHerbs = ref([]); // New ref to store herb objects for display
const mapImage = ref(null);
const mapWrapper = ref(null);

// 触摸相关状态
const touchStartX = ref(0);
const touchStartY = ref(0);
const lastTouchDistance = ref(0);
const isTouching = ref(false);
const isMultiTouch = ref(false);

// Hardcoded coordinates based on your provided list
// Format: { x: originalPixelX, y: originalPixelY }
const hardcodedLocationCoords = [
  { x: 7163, y: 2490 }, // 1
  { x: 5037, y: 2572 }, // 2
  { x: 7033, y: 1863 }, // 3
  { x: 7396, y: 2255 }, // 4
  { x: 6201, y: 2388 }, // 5
  { x: 6203, y: 2393 }, // 6
  { x: 7426, y: 2706 }, // 7
  { x: 5231, y: 1317 }, // 8
  { x: 6041, y: 2599 }, // 9
  { x: 6765, y: 2567 }, // 10
  { x: 7644, y: 3273 }, // 11
  { x: 7202, y: 3046 }, // 12
  { x: 2733, y: 3744 }, // 13
  { x: 7403, y: 2415 }, // 14
  { x: 6151, y: 1507 }, // 15
];

// Combine location data from categories.json with hardcoded coordinates
const locationsWithCoords = ref([]);

// Map interaction refs
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

// Store initial state for reset functionality
const initialScaleValue = ref(1); // Initial scale for "contain" mode
const initialTranslateX = ref(0);
const initialTranslateY = ref(0);

// Store natural image dimensions (non-reactive)
let imgNaturalWidth = 0;
let imgNaturalHeight = 0;

// Helper to clamp a value within a range
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// Handle image load to set initial scale and position for "contain" view
const handleImageLoad = () => {
  const wrapper = mapWrapper.value;
  const img = mapImage.value;

  if (wrapper && img) {
    // 获取包装器的实际尺寸（现在是基于padding-bottom的比例设置）
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperWidth = wrapperRect.width;
    const wrapperHeight = wrapperRect.height;
    
    imgNaturalWidth = img.naturalWidth; // 存储图片的原始尺寸
    imgNaturalHeight = img.naturalHeight;

    // 计算缩放比例，使整个图片都能在包装器中显示
    const scaleX = wrapperWidth / imgNaturalWidth;
    const scaleY = wrapperHeight / imgNaturalHeight;
    const calculatedInitialScale = Math.min(scaleX, scaleY); // 使用Math.min来实现"contain"效果

    // 设置当前和初始缩放比例
    scale.value = calculatedInitialScale;
    initialScaleValue.value = calculatedInitialScale;

    // 计算缩放后的图片尺寸
    const scaledWidth = imgNaturalWidth * calculatedInitialScale;
    const scaledHeight = imgNaturalHeight * calculatedInitialScale;

    // 将图片居中放置
    const calculatedTranslateX = (wrapperWidth - scaledWidth) / 2;
    const calculatedTranslateY = (wrapperHeight - scaledHeight) / 2;

    // 设置当前和初始平移值
    translateX.value = calculatedTranslateX;
    translateY.value = calculatedTranslateY;
    initialTranslateX.value = calculatedTranslateX;
    initialTranslateY.value = calculatedTranslateY;

    // Apply initial transform immediately
    updateMapTransformStyle();

    // Populate locationsWithCoords based on categoriesData and hardcoded coordinates
    // Assuming hardcodedLocationCoords and categoriesData.location.children are in the same order
    const categoryLocations = categoriesData.location && categoriesData.location.children
        ? categoriesData.location.children : [];

    locationsWithCoords.value = categoryLocations.map((categoryLocation, index) => {
      const coord = hardcodedLocationCoords[index]; // Get corresponding coordinate by index

      return {
        id: categoryLocation.id,
        name: categoryLocation.name,
        coords: coord, // Assign the hardcoded coordinate
        herbs: categoryLocation.herbs || [], // Use 'herbs' as per categories.json
        markerIndex: index + 1 // Add an index for displaying on the marker
      };
    }).filter(location => location.coords); // Filter out any locations without coordinates (shouldn't happen if arrays match)
  }
};

// Load location data on mount and add window event listeners
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
});

// Remove event listeners on unmount
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});

// 处理鼠标滚轮缩放
const handleWheelZoom = (event) => {
  event.preventDefault();
  const delta = event.deltaY * -0.0005; // 调整灵敏度
  let newScale = scale.value * (1 + delta);

  // 限制缩放级别 - 最小缩放是初始的"contain"缩放，最大是初始的10倍
  newScale = clamp(newScale, initialScaleValue.value, initialScaleValue.value * 10);

  // 以鼠标光标为中心进行缩放
  const wrapperRect = mapWrapper.value.getBoundingClientRect();
  const mouseX = event.clientX - wrapperRect.left;
  const mouseY = event.clientY - wrapperRect.top;

  const ratio = newScale / scale.value;

  // 根据缩放过程中的鼠标位置调整平移
  // 这个公式适用于transformOrigin: '0 0'
  translateX.value = mouseX - (mouseX - translateX.value) * ratio;
  translateY.value = mouseY - (mouseY - translateY.value) * ratio;

  scale.value = newScale;
  
  // 缩放后，重新限制平移以防止移出边界
  clampTranslation();
};

// Handle mouse down for panning
const handleMouseDown = (event) => {
  const wrapper = mapWrapper.value;
  const img = mapImage.value;
  if (!wrapper || !img) return; // Safety check

  // Prevent default behavior (like image dragging or text selection) if clicking on the map area
  if (wrapper.contains(event.target) || event.target === img) {
    event.preventDefault();
  }

  // Only allow dragging if the current scale is greater than the initial "contain" scale
  // (i.e., if the image is zoomed in beyond its initial full-view state)
  const isZoomedIn = scale.value > initialScaleValue.value + 0.001; // Add buffer for float comparison

  if (isZoomedIn && (wrapper.contains(event.target) || event.target === img)) {
    isDragging.value = true;
    startX.value = event.clientX - translateX.value;
    startY.value = event.clientY - translateY.value;
    wrapper.classList.add('is-dragging');
  }
};

// Handle mouse move for panning - on window
const handleMouseMove = (event) => {
  if (!isDragging.value) return;

  let newTranslateX = event.clientX - startX.value;
  let newTranslateY = event.clientY - startY.value;

  // Apply translation limits
  translateX.value = clampTranslationX(newTranslateX);
  translateY.value = clampTranslationY(newTranslateY);
};

// Handle mouse up to stop panning - on window
const handleMouseUp = () => {
  isDragging.value = false;
  if (mapWrapper.value) {
    mapWrapper.value.classList.remove('is-dragging');
  }
};

// Function to clamp translation values
const clampTranslation = () => {
  translateX.value = clampTranslationX(translateX.value);
  translateY.value = clampTranslationY(translateY.value);
};

const clampTranslationX = (x) => {
  const wrapper = mapWrapper.value;
  if (!wrapper || !mapImage.value) return x;

  // 获取包装器的实际尺寸
  const wrapperRect = wrapper.getBoundingClientRect();
  const wrapperWidth = wrapperRect.width;
  const scaledWidth = imgNaturalWidth * scale.value;

  // 如果图片小于包装器（当前缩放比例是初始的"contain"比例），则居中显示
  if (Math.abs(scale.value - initialScaleValue.value) < 0.001) {
    return (wrapperWidth - scaledWidth) / 2;
  } else {
    // 图片大于包装器，允许在边界内平移
    const minX = wrapperWidth - scaledWidth; // 最大负平移
    const maxX = 0; // 最大正平移（图片左边缘与包装器左边缘对齐）
    return clamp(x, minX, maxX);
  }
};

const clampTranslationY = (y) => {
  const wrapper = mapWrapper.value;
  if (!wrapper || !mapImage.value) return y;

  // 获取包装器的实际尺寸
  const wrapperRect = wrapper.getBoundingClientRect();
  const wrapperHeight = wrapperRect.height;
  const scaledHeight = imgNaturalHeight * scale.value;

  // 如果图片小于包装器（当前缩放比例是初始的"contain"比例），则居中显示
  if (Math.abs(scale.value - initialScaleValue.value) < 0.001) {
    return (wrapperHeight - scaledHeight) / 2;
  } else {
    // 图片大于包装器，允许在边界内平移
    const minY = wrapperHeight - scaledHeight; // 最大负平移
    const maxY = 0; // 最大正平移（图片顶部边缘与包装器顶部边缘对齐）
    return clamp(y, minY, maxY);
  }
};

// 重置地图到初始的"contain"状态
const resetMap = () => {
  // 清空显示的药材列表
  displayedHerbs.value = [];
  
  // 重置缩放和平移值
  scale.value = initialScaleValue.value;
  translateX.value = initialTranslateX.value;
  translateY.value = initialTranslateY.value;
  
  // 确保拖拽状态被重置
  isDragging.value = false;
  if (mapWrapper.value) {
    mapWrapper.value.classList.remove('is-dragging');
  }
};

// Apply transform style to the map image
const mapTransformStyle = ref({});

// Watch for changes in scale, translateX, translateY and update transform style
watch([scale, translateX, translateY], () => {
  updateMapTransformStyle();
});

const updateMapTransformStyle = () => {
  mapTransformStyle.value = {
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
    transformOrigin: '0 0'
  };
};

// Function to get the style for a marker
const getMarkerStyle = (coords) => {
  if (!coords || !mapImage.value || !mapWrapper.value || imgNaturalWidth === 0 || imgNaturalHeight === 0) {
    return { display: 'none' }; // Hide marker if data is not ready
  }

  // 计算相对于原始图片左上角的位置
  const originalX = coords.x;
  const originalY = coords.y;

  // 计算缩放和平移后的位置
  // 这是相对于map-wrapper左上角的位置
  const transformedX = originalX * scale.value + translateX.value;
  const transformedY = originalY * scale.value + translateY.value;

  return {
    position: 'absolute',
    left: `${transformedX}px`,
    top: `${transformedY}px`,
    transform: 'translate(-50%, -50%)', // 使标记中心对准坐标点
    zIndex: 10, // 确保标记在图片上方
  };
};

// Handle marker click
const handleMarkerClick = (location) => {
  console.log('Marker clicked, location:', location);
  console.log('Herb IDs for this location:', location.herbs);

  // Find the actual herb objects based on the IDs
  displayedHerbs.value = (location.herbs || [])
      .map(herbId => {
        const foundHerb = herbsData.find(herb => herb.id === herbId);
        // console.log(`Attempting to find herb with ID "${herbId}":`, foundHerb); // Keep for debugging if needed
        return foundHerb;
      })
      .filter(herb => herb !== undefined);

  console.log('Herbs found for display:', displayedHerbs.value);
};

// Watch for changes in scale, translateX, translateY to ensure marker positions update
// No specific action needed here, just triggering reactivity for getMarkerStyle
watch([scale, translateX, translateY], () => {
  // This empty watch helps ensure the markers re-render their styles when transform changes
});

// Function to format effects for display
const formatEffects = (effects) => {
  if (!effects) return [];
  if (Array.isArray(effects)) return effects;
  if (typeof effects === 'object') {
    // Flatten object values into a single array of strings
    return Object.values(effects).reduce((acc, val) => {
      if (Array.isArray(val)) return acc.concat(val);
      if (typeof val === 'string') return acc.concat(val);
      return acc;
    }, []);
  }
  return [];
};

// 处理触摸开始事件
const handleTouchStart = (event) => {
  event.preventDefault(); // 防止页面滚动和缩放
  
  // 记录触摸开始的目标元素，用于检测是否点击了标记
  const touchTarget = event.target;
  const isMarkerClick = touchTarget.closest('.location-marker');
  
  // 如果点击的是标记，不进行地图拖动操作
  if (isMarkerClick) {
    return;
  }
  
  if (event.touches.length === 1) {
    // 单指触摸 - 准备平移
    isTouching.value = true;
    isMultiTouch.value = false;
    const touch = event.touches[0];
    touchStartX.value = touch.clientX - translateX.value;
    touchStartY.value = touch.clientY - translateY.value;
  } 
  else if (event.touches.length === 2) {
    // 双指触摸 - 准备缩放
    isTouching.value = true;
    isMultiTouch.value = true;
    
    // 计算两指之间的初始距离
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    lastTouchDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }
};

// 处理触摸移动事件
const handleTouchMove = (event) => {
  event.preventDefault(); // 防止页面滚动和缩放
  
  // 如果点击的是标记，不进行地图拖动操作
  if (event.target.closest('.location-marker')) {
    return;
  }
  
  if (!isTouching.value) return;
  
  if (event.touches.length === 1 && !isMultiTouch.value) {
    // 单指移动 - 处理平移
    const touch = event.touches[0];
    let newTranslateX = touch.clientX - touchStartX.value;
    let newTranslateY = touch.clientY - touchStartY.value;
    
    // 应用平移限制
    translateX.value = clampTranslationX(newTranslateX);
    translateY.value = clampTranslationY(newTranslateY);
  } 
  else if (event.touches.length === 2) {
    // 双指移动 - 处理缩放
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    // 计算当前两指之间的距离
    const currentTouchDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
    
    // 计算缩放比例变化
    const touchRatio = currentTouchDistance / lastTouchDistance.value;
    if (touchRatio !== 0 && !isNaN(touchRatio)) {
      let newScale = scale.value * touchRatio;
      
      // 限制缩放级别
      newScale = clamp(newScale, initialScaleValue.value, initialScaleValue.value * 10);
      
      // 计算缩放中心点（两指中心）
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      // 获取地图容器的位置
      const wrapperRect = mapWrapper.value.getBoundingClientRect();
      const mapCenterX = centerX - wrapperRect.left;
      const mapCenterY = centerY - wrapperRect.top;
      
      // 根据缩放中心调整平移
      const ratio = newScale / scale.value;
      translateX.value = mapCenterX - (mapCenterX - translateX.value) * ratio;
      translateY.value = mapCenterY - (mapCenterY - translateY.value) * ratio;
      
      // 更新缩放值
      scale.value = newScale;
      
      // 更新上次触摸距离
      lastTouchDistance.value = currentTouchDistance;
      
      // 重新限制平移
      clampTranslation();
    }
  }
};

// 处理触摸结束事件
const handleTouchEnd = (event) => {
  event.preventDefault(); // 防止页面滚动和缩放
  
  // 检查是否点击了标记
  const touchTarget = event.target;
  const markerElement = touchTarget.closest('.location-marker');
  
  if (markerElement) {
    // 找到对应的location数据
    const index = parseInt(markerElement.textContent.trim()) - 1;
    if (index >= 0 && index < locationsWithCoords.value.length) {
      // 触发标记点击事件
      handleMarkerClick(locationsWithCoords.value[index]);
    }
  }
  
  isTouching.value = false;
  isMultiTouch.value = false;
};

</script>

<style scoped>
.location-category-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  min-height: 70vh;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.breadcrumb ol {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.breadcrumb li {
  display: inline;
  font-size: 14px;
  color: #555;
}

.breadcrumb li + li:before {
  content: ">>";
  padding: 0 8px;
  color: #4CAF50;
}

.breadcrumb a {
  color: #4CAF50;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #388e3c;
  text-decoration: underline;
}

.page-title {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(76, 175, 80, 0.3);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

.map-container {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.map-wrapper {
  flex: 2; /* Takes up 2/3 of the space */
  position: relative;
  overflow: hidden; /* Hide parts of the image outside the wrapper */
  cursor: grab; /* Indicate draggable */
  width: 100%; /* Take full width of its flex container */
  max-width: 800px; /* Limit max width */
  height: 0; /* 高度设为0，使用padding-bottom来控制宽高比 */
  padding-bottom: 59.7%; /* 保持地图原始宽高比：5079/8504 ≈ 0.597 (59.7%) */
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  background-color: #ffffff; /* White background for the wrapper */
  flex-shrink: 0; /* Prevent shrinking below content size */
  border: 5px solid #fff;
}

.map-wrapper.is-dragging {
  cursor: grabbing;
}

.school-map {
  display: block;
  max-width: none;
  height: auto;
  position: absolute; /* 使图片绝对定位 */
  /* transform-origin is set via style binding now */
}

.location-info {
  flex: 1; /* Takes up 1/3 of the space */
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 12px;
  min-width: 250px;
  max-width: 350px;
  max-height: 600px; /* Match map-wrapper height */
  overflow-y: auto;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.location-info h2 {
  color: #4CAF50;
  font-size: 18px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
}

.reset-button {
  display: block;
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reset-button:hover {
  background-color: #388e3c;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.reset-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.herb-list {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Increased gap between herb cards */
}

.herb-card {
  background: #ffffff; /* White background for card */
  border: 1px solid #e0e0e0; /* Light grey border */
  border-radius: 12px; /* Rounded corners */
  padding: 15px; /* Increased padding */
  text-decoration: none; /* Remove underline */
  color: #333; /* Default text color */
  transition: all 0.2s ease-in-out; /* Smooth transition */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); /* Slight shadow */
  cursor: pointer; /* Indicate clickable */

  display: flex; /* Use flexbox for layout */
  align-items: center; /* Center items vertically */
  gap: 15px; /* Gap between image/placeholder and text */
}

.herb-card:hover {
  background: #f9f9f9; /* Slightly darker background on hover */
  border-color: #4CAF50; /* Green border on hover */
  transform: translateY(-3px); /* Lift effect */
  box-shadow: 0 8px 15px rgba(76, 175, 80, 0.15); /* More prominent shadow on hover */
}

/* 新增的图片容器样式 */
.herb-image-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden; /* 确保图片不会溢出容器 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0; /* 默认背景色，如果图片加载失败或没有图片 */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.herb-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填充容器并裁剪 */
  display: block;
}

/* 修改 herb-image-placeholder 样式，使其只在没有图片时生效 */
.herb-image-placeholder {
  /* 移除背景色和文字颜色，因为这些现在由 .herb-image-wrapper 提供 */
  /* background-color: #e0e0e0; */ /* 移动到 .herb-image-wrapper */
  /* color: #fff; */ /* 移动到 .herb-image-wrapper */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #fff; /* 确保文字颜色仍在 */
}


.herb-info {
  flex-grow: 1; /* Allow info to take available space */
}

.herb-name {
  font-size: 16px; /* Herb name font size */
  font-weight: bold;
  color: #2c3e50; /* Dark blue-grey */
  margin-bottom: 5px; /* Space below name */
}

.herb-effects {
  display: flex;
  flex-wrap: wrap; /* Allow tags to wrap */
  gap: 5px; /* Gap between effect tags */
}

.effect-tag {
  background-color: #e8f5e9; /* Light green background */
  color: #388e3c; /* Dark green text */
  padding: 4px 10px; /* Padding */
  border-radius: 20px; /* Pill shape */
  font-size: 12px; /* Smaller font size */
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-state {
  color: #666;
  text-align: center;
  padding: 30px;
  border: 1px dashed rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  background-color: rgba(252, 252, 252, 0.8);
  font-size: 15px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.03);
}

.location-marker {
  position: absolute;
  width: 24px; /* Marker size */
  height: 24px; /* Marker size */
  background-color: rgba(76, 175, 80, 0.8); /* Example: semi-transparent green circle */
  border-radius: 50%; /* Make it a circle */
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px; /* Adjust font size */
  font-weight: bold;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* Add shadow for better visibility */
}

.location-marker:hover {
  background-color: rgba(76, 175, 80, 1); /* Full opacity on hover */
  transform: scale(1.2) translateY(-2px); /* Slightly larger on hover */
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.4);
}

@media (max-width: 768px) {
  .map-container {
    flex-direction: column;
    gap: 20px;
  }

  .map-wrapper, .location-info {
    flex: none;
    width: 100%;
    max-width: 100%;
  }
  
  .map-wrapper {
    padding-bottom: 75%; /* 在移动端调整宽高比，使地图更容易查看 */
    touch-action: none; /* 防止浏览器默认的触摸行为 */
  }
  
  .location-info {
    max-height: 400px;
    overflow-y: auto;
  }

  .location-category-page {
    padding: 15px;
    margin: 10px;
  }

  .page-title {
    font-size: 24px;
  }
  
  .location-marker {
    width: 30px; /* 在移动端增大标记尺寸，便于点击 */
    height: 30px;
    font-size: 14px;
  }
}
</style>