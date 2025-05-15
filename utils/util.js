export const base64 = (url, type)=> {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: url, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => {
        resolve('data:image/' + type.toLocaleLowerCase() + ';base64,' + res.data)
        // resolve(res.data)
      },
      fail: res => reject(res.errMsg)
    })
  })
}
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
const isImageVideoUrl = (url)=> {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv'];
  const ext = url.split('.').pop().toLowerCase();
  if (imageExtensions.includes(ext)) {
      return 'image';
  } else if (videoExtensions.includes(ext)) {
      return 'video';
  }
  return 'other';
}
module.exports = {
  formatTime,
  isImageVideoUrl
}
