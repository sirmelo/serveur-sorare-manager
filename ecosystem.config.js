module.exports = {
  apps : [{
    script : "dist/app.js"
  }],
  deploy: {
    production:{
      user:'root',
      host:'https://home-connect.net/',
      ref:'origin/main',
      repo:'https://github.com/sirmelo/serveur-sorare-manager/',
      path:'/root/serveur-sorare-manager',
        'pre-deploy-local':'',
        'post-deploy':'npm install && pm2 reload ecosystem.config.js --env production',
        'pre-setup':''
    }
  }
}
