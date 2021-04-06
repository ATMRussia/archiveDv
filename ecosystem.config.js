module.exports = {
  apps : [{
    name:'archiveDv',
    script: 'app.mjs',
    //watch: '.',
    //instances: 1,
    exec_mode: "cluster",
    watch: true,
    increment_var : 'PORT',
    env: {
      "PORT": 6000
    }
  }]
}
