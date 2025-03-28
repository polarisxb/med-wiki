<template>
<div class="camera-search">
<!-- 图片上传入口 -->
<div class="upload-box">
    <input
    ref="fileInput"
    type="file"
    accept="image/*"
    capture="environment"
    hidden
    @change="handleImageUpload"
    >
    <button @click="triggerCamera">
    <i class="fas fa-camera"></i>
    拍照识别
    </button>
</div>

<!-- 预览区域 -->
<div v-if="previewSrc" class="preview-area">
    <img :src="previewSrc" class="preview-image">
    <button @click="analyzeImage" class="analyze-btn">开始识别</button>
</div>

<!-- 加载状态 -->
<div v-if="isLoading" class="loading-overlay">
    <div class="loader"></div>
    <p>识别中...</p>
</div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import herbs from '@/data/herbs.json'
import { XF_CONFIG, generateHeaders } from '@/utils/api'


const router = useRouter()
const fileInput = ref(null)
const previewSrc = ref(null)
const isLoading = ref(false)
const triggerCamera = () => {
  fileInput.value.click()
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewSrc.value = e.target.result
    }
    reader.readAsDataURL(file)
  } catch (error) {
    alert('图片读取失败，请重试')
  }
}
const analyzeImage = async () => {
  if (!previewSrc.value) {
    alert('请先拍摄或选择图片')
    return
  }

  isLoading.value = true
  
  try {
    // 转换DataURL为Blob
    const blob = dataURLtoBlob(previewSrc.value)
    
    const formData = new FormData()
    formData.append('image', blob, 'plant.jpg')

    // 调用API
    const response = await fetch(XF_CONFIG.PLANT_API, {
      method: 'POST',
      headers: generateHeaders(),
      body: formData
    })

    const data = await response.json()
    handleApiResponse(data)
    
  } catch (error) {
    alert(`识别失败: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  const u8arr = new Uint8Array(bstr.length)
  
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  
  return new Blob([u8arr], { type: mime })
}

const handleApiResponse = (data) => {
  if (data.code === '000000') {
    const plantName = data.data.result[0].name
    const matchedHerb = herbs.find(h => 
      h.name === plantName || 
      h.scientificName.toLowerCase() === plantName.toLowerCase()
    )
    
    if (matchedHerb) {
      router.push(`/herb/${matchedHerb.id}`)
    } else {
      alert('未找到匹配的药材信息')
    }
  } else {
    alert(`识别错误: ${data.desc}`)
  }
}
</script>

<style scoped>
.camera-search {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.upload-box {
  text-align: center;
  margin: 30px 0;
}

button {
  padding: 12px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
}

.preview-area {
  margin-top: 20px;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  height: 300px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.analyze-btn {
  margin-top: 15px;
  background: #2196F3;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .camera-search {
    padding: 10px;
  }
  
  button {
    width: 100%;
    padding: 15px;
  }
  
  .preview-image {
    height: 200px;
  }
}
</style>