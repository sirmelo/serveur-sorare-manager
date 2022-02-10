module.exports = {
  apps : [{
    name   : "serveursorarewatch",
    script : "dist/app.js"
  }],
  deploy: {
    production:{
      user:'nodejs',
      host:'46.101.104.186',
      ref:'main',
      repo:'https://github.com/sirmelo/serveur-sorare-manager',
      path:'root/server',
        'pre-deploy-local':'',
        'post-deploy':'npm install && pm2 reload ecosystem.config.js --env production',
        'pre-setup':''
    }
  }
}
