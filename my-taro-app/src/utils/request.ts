import Taro from '@tarojs/taro'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export const request = async ({
  url,
  method = 'GET',
  data,
  header = {}
}: RequestOptions) => {
  try {
    const response = await Taro.request({
      url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      }
    })
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data
    }
    
    throw new Error(`请求失败: ${response.statusCode}`)
  } catch (error) {
    Taro.showToast({
      title: error.message || '网络错误',
      icon: 'none',
      duration: 2000
    })
    throw error
  }
} 