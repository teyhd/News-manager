process.on('uncaughtException', (err) => {
  console.log('Глобальный косяк приложения!!! ', err.stack);
}); //Если все пошло по пизде, спасет ситуацию
const news_path = 'F:/news/public/news';
const express = require('express');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const session = require('express-session');
var cookieParser = require('cookie-parser');
var unixTime = require('unix-time');
const path = require('path');
const fs = require('fs-extra');

//const dbworker = new db.dbworker();

const test = require('./test.js');

const dox = require('./dox.js');
const doxworker = new dox.doxwork();

const db = require('./db.js');
const dbworker = new db.dbworker();

const ortog = require('./orthog.js');

const newsclv = require('./newsm.js');
//const woe = new newsclv.newscl();

const PORT = process.env.PORT || 3000;
const app = express();

const hbs = exphbs.create({
defaultLayout: 'main',
extname: 'hbs',
helpers: {
  if_eq: function (a, b, opts) {
      if (a == b){ // Or === depending on your needs
         // console.log(opts);
          return opts.fn(this);
       } else
          return opts.inverse(this);
  }
}
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views','views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(fileUpload());
app.use(session({resave:false,saveUninitialized:false, secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.get('/',(req,res)=>{
  let news_resul
  console.log('IP АДРЕС:'+getcurip(req.socket.remoteAddress));
  let auth = isAuth(req);
//console.log('Cookies: ', req.cookies)
//console.log('Signed Cookies: ', req.signedCookies)
try {
   news_resul = dbworker.getallnews();
  news_resul.forEach(element => {
    if (element.comment == null || element.comment =='' || element.comment == 'undefined') {//
      element.comment = 'Замечаний нет';
    }
    element.status = getstatus(element.status)
  let datecreate = new Date(element.date*1000);
  let datemp = new Date(element.mpdate*1000);
  element.date = `${curdate(datecreate.getDate())}.${curdate(datecreate.getMonth()+1)} ${curdate(datecreate.getHours())}:${curdate(datecreate.getMinutes())}:${curdate(datecreate.getSeconds())}`;
  element.mpdate = `${curdate(datemp.getDate())}.${curdate(datemp.getMonth()+1)}`
  });  
} catch (error) {
  console.log('Ошибка в 63 строке:'+error);
}
  res.render('index',{
    title: 'Создание новости',
    auth: auth,
    content: news_resul     
  });

})
app.get('/new',(req,res)=>{
let auth = isAuth(req);
  res.render('new',{
    title: 'Создание новости',
    auth: auth      
  });
})
app.get('/check',(req,res)=>{
 ortog.test(res,req.query.text)
//console.log(result);
/*if (typeof result != "undefined"){
  res.send({"result":req.query.text});
} else res.send({"result":"ok"});*/
})
app.get('/edit',(req,res)=>{
 console.log('ID редактируемой страницы:  '+req.query.idn);
 let auth = isAuth(req);
 var results = dbworker.getnews(req.query.idn);
 if (results==undefined) {
  res.render('404',{
    title: 'Новости с таким ID нет',
    auth: auth,
  });
  return 0;
}else {
  results.path = results.path.substring(15)
  results.path = results.path.slice(0, -1)
  let resuls = dbworker.getpic(req.query.idn)
    //console.log(resuls);
    //results.pictures = 'JSON.parse(results.pictures)'
    results.pictures = resuls
    for (let j = 0; j < results.pictures.length; j++) {
      results.pictures[j] = `${results.path}/${results.pictures[j].pict}` ;
   }
   let datecreate = new Date(results.date*1000);
   let datemp = new Date(results.mpdate*1000);
   results.date = `${curdate(datecreate.getDate())}.${curdate(datecreate.getMonth()+1)} ${curdate(datecreate.getHours())}:${curdate(datecreate.getMinutes())}:${curdate(datecreate.getSeconds())}`;
   results.mpdate = `${curdate(datemp.getDate())}.${curdate(datemp.getMonth()+1)}`
 
   res.render('edit',{
     title: 'Редактирование новости',
     auth: auth,
     content: results,
     path : results.path     
   });
  console.log('The solution is: ', results.status);
 }
})
app.get('/auth', function(req, res) {
  console.log('На сервер пришел пароль: '+req.query.pass);
  if (req.query.pass){
    if (req.query.pass == '159'){
      req.session.auth = true;
      res.send('ok');
      return true;
    }
  }
  req.session.auth = false;
  res.send('nok');
})
app.get('/logout', function(req, res) {
console.log("Пользователь вышел");
req.session.auth = false;
res.send('ok');
})
app.post('/upload', async function(req, res) {
  let addnews = new newsclv.newscl();
  let news_npath = addnews.getdir(req.body.new_date,req.body.new_head);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Произошла ошибка! Обратитесь к разработчику!');
  }
  let pictures_name =[];
  let main_pic = req.files.mainpic
  pictures_name.push(path.join("Заставка "+main_pic.name))
  main_pic.mv(path.join(news_npath,"Заставка "+main_pic.name), function(err) {
    if (err)
      return res.status(500).send(err); 
  });
  let photos = req.files.newsimg;
  try {
      if (typeof photos.length != "undefined"){
        photos.forEach(element => {
          //console.log(element);
          pictures_name.push(path.join(element.name))
          element.mv(path.join(news_npath,element.name), function(err) {
            if (err)
              return res.status(500).send(err); 
          });
        });
      } else{
          photos.mv(path.join(news_npath,photos.name), function(err) {
            pictures_name.push(path.join(photos.name))
            if (err)
              return res.status(500).send(err);            
          });
      } 
  } catch (error) {
    console.log('Закрыть дыру с отправкой любыйх файлов');
  }
  await addnews.add(req.body.new_head, req.body.new_text,req.body.new_auth,0, req.body.new_date,pictures_name);
 
  res.redirect('/');
  //console.log(main_pic.mimetype); //Переадресация на главную
  //res.render('index',{title: 'Главная'});
});
app.post('/edit', function(req, res) {
  let Edited = new newsclv.newscl(req.query.idn);
 // console.log(Edited);
  let news_npath = Edited.news_path_n;
  console.log('Путь к новости из БД:'+ news_npath);
  console.log(req.body); // ID database update
  let pictures_name =[];
  console.log('фОТО К УДАЛЕНИЮ: '+req.body.picfordel);
  if (req.body.picfordel!=undefined){Edited.delpicture(req.body.picfordel)}
  try {
    let main_pic = req.files.mainpic;
    pictures_name.push(path.join("Заставка "+main_pic.name))
    main_pic.mv(path.join(news_npath,"Заставка "+main_pic.name), function(err) {
    if (err)
      return console.log('Ошибка загрузки заставки! Вероятно, было пусто!' +err); 
     });     
  } catch (error) {
    console.log('Ошибка загрузки заставки! Ее не прикрепили!' +error); 
  }
  try {
    let photos = req.files.newsimg;
      if (typeof photos.length != "undefined"){
        photos.forEach(element => {
          element.mv(path.join(news_npath,element.name), function(err) {
            if (err)
              return res.status(500).send(err); 
          });
        });
      } else{
          photos.mv(path.join(news_npath,photos.name), function(err) {
            pictures_name.push(path.join(photos.name))
            if (err)
              return res.status(500).send(err);            
          });
      } 
  } catch (error) {
    console.log('Закрыть дыру с отправкой любыйх файлов');
  }
  dbworker.updatecomm(req.query.idn,req.body.new_comm);

  dbworker.updatestat(req.query.idn,getnumstat(req.body.statusch));
  
  Edited.head = req.body.new_head
  Edited.cont = req.body.new_text
  Edited.autor = req.body.new_auth
  Edited.mpunixtime = Edited.getmpunixtime(req.body.new_date)
  Edited.mpdate = req.body.new_date
  Edited.pictures = pictures_name
  console.log('Имя новых фоток? :'+pictures_name);
  Edited.status = 0
  Edited.save(1)
 // dbworker.addnews(req.body.new_head, req.body.new_text,req.body.new_auth,0,mpunixtime,unixTime(new Date()),pictures_name,JSON.stringify(news_npath));
 // console.log(main_pic.mimetype); 
  //res.render('index',{title: 'Главная'});
 // console.log(Edited);
 //this.renamefolder()
  res.redirect('/');
})

app.get('*', function(req, res){
  res.render('404', { 
    url: req.url,
    title: '404 Not Found',   
  });
});


function isAuth(req){
if (req.session.auth){
  return req.session.auth;
} else 
  return false; // ПЕРЕПИШИ
}
function curdate(minute){
  minute = (minute < 10) ? '0' + minute : minute;
  return minute;
}

function getnumstat(par) {
  console.log(typeof par);
  if (par!=undefined) {
    if (par=='true') {
      return 2
    } else return 1
  }
  return 0
}
function getstatus(num) {
  let ans = [
    'Ожидает утверждения',
    'Требует исправления!',
    'Утверждено! Ожидает отправку',
    'Отправлено',
    'На сайте',
    'На сайте! ОШИБКА в содержании!!!'
  ]
  return ans[num]
}
async function start(){
    try {
        app.listen(PORT,()=> {
          console.log('Сервер менеджера новостей - запущен')
        })
    } catch (e) {
        console.log(e);
    }
}
function getcurip(str) {
  let arr = str.split(':');
  arr = arr[arr.length-1];
  return arr;
}
start();

