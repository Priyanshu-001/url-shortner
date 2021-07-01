require('dotenv').config()
pg=require('pg')
const { Pool, Client } = require('pg')
const connectionString =  process.env.DATABASE_URL
pg.defaults.ssl = true;
const pool = new Pool({
connectionString,
ssl:{
rejectUnauthorized: false,}
})


checkIfSiteExists = async (site)=> {
	return new Promise((resolve,reject)=>{
		pool.query('SELECT * from sites where link = $1',[site]).then(result =>{
			console.log(result.rows[0])
			if(result.rowCount>0)
			resolve(result.rows[0])
			else
			reject({'Not_Found':true})
		})
		.catch(err=>{
			pool.query('rollback')
			reject({'err':err})
		})

		
})
}

getTopSites = async()=>
{
	return new Promise((resolve, reject)=>{
		pool.query('SELECT Hits,link from sites ORDER BY Hits DESC LIMIT 5')
		.then(result=>{
			resolve(result.rows)
		})
		.catch(err=>reject(err))
	})
}

addSite = async (site)=>{
	return new Promise((resolve,reject)=>{
		checkIfSiteExists(site).then(id=>{
			console.log(id)
		pool.query('UPDATE sites SET Count = Count+1 WHERE id= $1',[id.id]).then(result =>{
			pool.query('COMMIT').then(r=>console.log(r)).catch(e=>console.err(e))
			resolve(id.id)
		})
		.catch(()=>reject(false))
	})
		.catch(code=>{
			if(code.Not_Found === true)
			{	
				pool.query('INSERT INTO sites(link,Count,hits) values($1,1,0)',[site]).then(result=>{
					
					pool.query('COMMIT').then(r=>{}).catch(e=>console.err(e))
				checkIfSiteExists(site).then(r=>resolve(r.id))

				})
				.catch(err=>{
					reject(err)
				})
			}
			else {
				reject(false)
			}
		})


	})

}
addLink = (link,site,code)=>{
	return new Promise((resolve,reject)=>{
		addSite(site).then(r_id=>{
		pool.query('SELECT code from dials where link = $1',[link])
		.then(result=>{
			if(result.rowCount>0){

		resolve({'preCode':result.rows[0].code})
	}
			
			else
			{
				let date = new Date();
    			date = date.toLocaleDateString() + " " + date.toLocaleTimeString();


			pool.query('INSERT INTO dials(link,siteid,code,createdate,hits) values($1,$2,$3,$4,0)',[link,r_id,code,date])
			.then(result=>{

				resolve(result)
			})
			.catch(err=>{
				console.log('addLink err', err)
				reject({'internal Err': err})
			})
			
		}})
		.catch(err=>{reject(err)})

		})
	})
}
afterJob = (id,siteId)=>{
		
		pool.query('UPDATE dials SET hits = hits + 1 WHERE dials.id = $1 ',[id])
		.then(result=>{
			
			
			// {
				pool.query('UPDATE sites SET hits = hits + 1 where id=$1',[siteId]).catch(err=>console.log(err))
			// }


		})
		.catch(err=>{
			console.log(err)
		})
	
}
findOriginalUrl  = code=>{
	return new Promise((resolve,reject)=>{
		pool.query('SELECT id, link, siteid from dials where code = $1',[code])
		.then(result=>{
			if(result.rowCount>0)
			{
			resolve({'id':result.rows[0].id, 'link':result.rows[0].link, 'siteId': result.rows[0].siteid})
			
			}
			else{
			
			pool.query('rollback')
			reject({'err':'Unkown problem'})
			}
		})

		.catch(err=>{reject(err)
			pool.query('rollback')
		})
	})
}
// exports.getAll = getAll
exports.afterJob = afterJob
exports.findOriginalUrl = findOriginalUrl
exports.addSite = addSite
exports.addLink = addLink
exports.checkIfSiteExists = checkIfSiteExists
exports.getTopSites = getTopSites
