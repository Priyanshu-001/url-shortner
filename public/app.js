
 view =   new Vue({
      el: '#app',
      data:{
      	url: '',
      	shorten_url: '',
      	ready: false,
      	siteReady: false,
      	formatOk: false,
        topSites: []


      },
     mounted: function () {
  this.$nextTick(function () {
    this.createList()
  })
},
      methods:{
        createList: async function(){
          fetch('/topSites/json').then(response=>{
          
          response.json().then(result=>{
            this.topSites =  result.topSites
            this.siteReady = true
          })            
          })

        },
      	submit: async function(){
      		ready=false
      		shorten_url = await fetch('/api/shorten',
      			{headers: {
	    		 
	      		'Content-Type': 'application/json'
	    		},
    method:'POST',body:JSON.stringify({'url':this.url})
      		}).catch(err=>{
      				
      		})
      		shorten_url = await shorten_url.json()
      		if(shorten_url.error)
      		{
      						this.formatOk =false
      		}
      		else{
      			this.shorten_url = shorten_url.code
      		this.ready = true

      	}

      	
      }
  },
      vuetify: new Vuetify({
  theme: { dark: false }})
    })