module.exports = {
  apps : [{
    name   : "serveursorarewatch",
    script : "dist/app.js"
  }],
  deploy: {
    production:{
      user:'nodejs',
      host:'46.101.104.186',
      ref:'SSH',
      repo:'SSH',
      path:'/root',
        'pre-deploy-local':'',
        'post-deploy':'',
        'pre-setup':'test'
    }
  }
}
