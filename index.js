const express= require('express')
const bodyParser = require('body-parser')
app = express()
require('dotenv').config()
var dns = require('dns');
var db = require('./db.js')
app.use(bodyParser.json())

app.use('/public', express.static(__dirname + '/public'));
app.get('/',(req,res)=>{

res.sendFile(__dirname + '/views/index.html')
})

checkSite = async (req,res,next)=>{
	 var uri = req.body.url.split('/')[2]
if(req.body.url.split('://')[0]!=='http' && req.body.url.split('://')[0] !=='https')
   {
     return  res.json({'error': 'invalid url'})
   }
   req.uri = uri
  next()


}
getTopSites = async (req,res,next)=>{
  try{
  req.topSites = await db.getTopSites()
  }
  catch(err)
  {console.log(err)
    req.topSites = {'Not Found': true}
  }
  finally{
    next()
  }
}
app.get('/topsites/json',getTopSites ,(req,res)=>{

res.json({topSites:req.topSites})

})
Redirection = (req,res,next)=>{
  db.findOriginalUrl(req.params.code)
  .then(url=>{
    req.orignalUrl = url
    db.afterJob(url.id,url.siteId)
    next()
     
  })
  .catch(err=>{
    
    console.log(err)
    next()
  })

}
app.get('/:code',Redirection,(req,res)=>{
  if(req.orignalUrl)
  {
    // console.log(req.orignalUrl)
    res.redirect(req.orignalUrl.link)
  }
  else
  {
  res.send('Code expired or invalid')
  }
})
app.post('/api/shorten',checkSite, async (req,res)=>{
	// console.log(req.body.url)
	var  n =Math.floor(Math.random()*100000)

	code = n.toString().padStart(5,0)
	try{
    posCode = await db.addLink(req.body.url,req.uri,code)
    // console.log(posCode)
 if(posCode.preCode !=undefined)
   res.json({code: posCode.preCode})
 else
 {
  res.json({code: code})
 }

  }
  catch(e){
  res.json({err: e})
  }
	

})
app.listen(process.env.port || 80,()=>{
	console.log('online')
})