var express=require('express');
var path=require('path');
var logger=require('morgan');
var bodyParser=require('body-parser');
var neo4j=require('neo4j-driver').v1;

var app=express();
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));

var driver= neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','12345'));
var session=driver.session();


app.get('/login/admin',function(req,res){
    
    res.render('adminLog');
  });

app.get('/login',function(req,res){
    
  res.render('login');
});

app.get('/register',function(req,res){
    
   res.render('index');
});

//go back to admin home
app.get('/admin/back',function(req,res){
    
    res.render('adminHome');
 });


app.post('/register/add',function(req,res){
var name=req.body.name;
var email=req.body.email;
var password=req.body.password;
//console.log(name);
session
.run('MATCH(p:Register) MERGE (n:Register {name: {nameParam}, email:{emailParam}, password:{passwordParam}}) RETURN p',{nameParam:name, emailParam:email, passwordParam:password})
.then(function(result){
    var check;
    
   // res.render('login');
   result.records.forEach(function(record){
    var db=record._fields[0].properties;
    
    if(db.name==name){
        check=1;
    }

  
})
if(check==1)
{
    console.log('Already registered');
    res.render('login',{error:"Already registered"});
  
}
else{
    console.log('Successfully Registered');
    res.render('login',{error:"Successfully registered"});
}

   session.close();
})
.catch(function(err){
    console.log(err);
});


});

//Login
app.post('/login/add',function(req,res){
       var email=req.body.email;
    var password=req.body.password;
    //console.log(name);
    session
    .run('MATCH (user:Register{email:{emailParam}}) RETURN user',{emailParam:email})
    .then(function(results){
       
        
            //var dbUser = _.get(results.records[0].get('user'), 'properties');
            results.records.forEach(function(record){
                var db=record._fields[0].properties;
                if(db.password==password){
                    console.log('correct');
                    res.render('home',{
                        users:record._fields[0].properties.name
                    });
                }
               
                else
                console.log('incorrect');
            })
           
    })
      
    .catch(function(err){
        console.log(err);
    });
    //res.redirect('/');
    });

//admin Login
app.post('/admin',function(req,res){
    var username=req.body.username;
 var password=req.body.password;
 //console.log(name);
 session
 .run('MATCH (admin:Login{username:{userParam}}) RETURN admin',{userParam:username})
 .then(function(results){
    
     
         //var dbUser = _.get(results.records[0].get('user'), 'properties');
         results.records.forEach(function(record){
             var db=record._fields[0].properties;
             if(db.password==password){
                 console.log('correct');
                 res.render('adminHome');
             }
            
             else
             console.log('incorrect');
         })
        
 })
   
 .catch(function(err){
     console.log(err);
 });
 //res.redirect('/');
 });


 //userview
 app.post('/admin/view',function(req,res){
    
 session
 .run('MATCH (user:Register) RETURN user')
 .then(function(results){
    var userArr=[];
     
         //var dbUser = _.get(results.records[0].get('user'), 'properties');
         results.records.forEach(function(record){
             userArr.push({
                 id:record._fields[0].identity.low,
                 name:record._fields[0].properties.name,
                 email:record._fields[0].properties.email,
                 password:record._fields[0].properties.password
             });
            });
             //console.log(record._fields[0].properties);
           res.render('viewUsers',{userlog:userArr});
           
         })
        

   
 .catch(function(err){
     console.log(err);
 });
 //res.redirect('/');
 });


 //view relation
 app.post('/admin/relation',function(req,res){
    
    session
    .run('MATCH (user:Register) RETURN user')
    .then(function(results){
       var userRel=[];
        
            //var dbUser = _.get(results.records[0].get('user'), 'properties');
            results.records.forEach(function(record){
                userRel.push({
                    id:record._fields[0].identity.low,
                    name:record._fields[0].properties.name,
                    email:record._fields[0].properties.email,
                    password:record._fields[0].properties.password
                });
               });
                //console.log(record._fields[0].properties);
              res.render('addRelation',{userlog:userRel});
              
            })
           
   
      
    .catch(function(err){
        console.log(err);
    });
    //res.redirect('/');
    });
   
//add relation
app.post('/addrel',function(req,res){
    var name=req.body.name;
 var relation=req.body.relation;
 //console.log(name);
 session
 .run('MATCH (a:Register{name:{nameParam}}),(b:Login) MERGE (a)-[r:'+relation+']-(b) RETURN a,b',{nameParam:name})
 .then(function(results){

     res.redirect('/');
        
 })
   
 .catch(function(err){
     console.log(err);
 });
 //res.redirect('/');
 });


app.listen(3000);
console.log('server is running at port 3000');

module.exports=app;