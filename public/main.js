//const { test } = require("../orthog");

  $(document).ready(function(){
    var months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
    var monshot = ['Янв','Фев','Март','Апр','Май','Июнь','Июль','Авг','Сент','Окт','Нояб','Дек']
    $('.datepicker').datepicker({"format" : "dd mm","i18n" : {"months":months,"monthsShort":monshot}});
    $('.materialboxed').materialbox();
    $( "#mpopup" ).hide();
    $( "#sendnews" ).submit(function( event ) {
      event.preventDefault();
      this.submit();
    });
    $('#commentbox').change(function(){
      console.log($(this).is(':checked'));
      if ($(this).is(':checked')){
        $('#combox').show(100);
      } else {
        $('#combox').hide(100);
      }
    });    
    $('#commentbo').change(function(){
      console.log($(this).is(':checked'));
      if ($(this).is(':checked')){
        $('#combox').hide(100);
      } 
    });   
    
    $("#editnews").submit(function( event ) {
      event.preventDefault();
      $("#all_pic_name").val(`${$("#all_pic_name").val()},${getimg()}`);
     // alert($("#all_pic_name").val())
      getfordel()
      this.submit();
    });

    function getfordel() {
      var fordela = []  
      $( ".delbtnc" ).each(function() {
        if ($( this ).parent().parent().prop('disabled')) {
          fordela.push($( this ).attr('id'));
          console.log($( this ).attr('id') );
        } else {
          console.log('no');
        }
      });  
      fordela = fordela.toString() 
      $("#fordel").val(fordela)  ;
      
    }
    
    $( "#sign" ).click(function() {
      if ($( "#sign" ).attr('name')=='login') {
        event.preventDefault();
        $( "#mpopup" ).show();
      }
       else logout()
    })
    $( "#close" ).click(function() {
      event.preventDefault();
      $( "#mpopup" ).hide();
    })
    $( ".delbtnc" ).click(function() {
      event.preventDefault();
    })
    

    $( ".delbtnc" ).on( "mousedown", function() {
      event.preventDefault();

      //console.log($( this ).attr('id') );
      var stylesgray = {
        "-webkit-filter" : "grayscale(1);",
        "filter": "gray",
        "filter": "grayscale(1)"         
      }; 
      var stylesnogray = {
        "-webkit-filter" : "grayscale(0);",
        "filter": "gray",
        "filter": "grayscale(0)"         
      }; 
      let divbl = $( this ).parent().parent();
      if (!divbl.prop('disabled')) {
        divbl.prop('disabled', true);
        divbl.css( stylesgray );
        $( this ).text('Восстановить фото');
        //console.log($( this ).attr('id'));
        
      }else{
        divbl.css( stylesnogray );
        divbl.prop('disabled', false);
        $( this ).text('Удалить фото');
        
      }

      console.log(divbl.prop('disabled'));
  })

    $( "#new_head" ).val()
    $( "#mp_date" ).val()
    $( "#new_auth" ).val()
    $( "#main_pic_name" ).val()
    $( "#all_pic_name" ).val()
   
    //M.toast({html: 'I am a toast!', classes: '#ef5350 red lighten-1 rounded'});
    
    $( "#btnorto" ).click(function() {
      event.preventDefault();
      if ($( "#new_text" ).val()!=''){
        let tosend = $( "#new_text" ).val();
        $.get( "/check", { text: tosend} )
        .done(function( data ) {
          console.log( "Data Loaded: " + data.result.length );
          if (data.result.length==0){
            $( "#create" ).prop('disabled', false);
            M.toast({html: 'Проверка текста - Пройдена успешно!', classes: '#26a69a teal lighten-1 rounded'});
          } else {
            M.toast({html: 'Исправьте ошибки в тексте!', classes: '#ef5350 red lighten-1 rounded'});
            $( "#create" ).prop('disabled', true);
          }
        });
        console.log( "Handler for .click() called." );
      } else {
        $( "#new_text" ).addClass( "invalid" );
        M.toast({html: 'Пожалуйста, заполните содержание', classes: '#ef5350 red lighten-1 rounded'});
      }    
    });
    
    function head_is_valid(){
      let flag = false;
      headtext = $( "#new_head" ).val().toLowerCase();
      var keywords = ['санкт-петербур', 'пансион', 'воспитан'];
      keywords.forEach(element => {
         if (wordInString(headtext, element)) {
          flag = true;
         } else flag = false;
      });
      console.log(flag);
      return flag; 
    }
    function wordInString(string, keywords) {
      return string.split(/\b/).filter(function(w) {
          return w.indexOf(keywords) !== -1;
      }).length > 0;
  }
 
    $( "#new_text" ).keydown(function() {
      $( "#new_text" ).removeClass( "invalid" );
     // console.log('ok');
    });
 
    $( "#new_head" ).keydown(function() {
      $( "#new_head" ).removeClass( "validate" );
       if (!head_is_valid()){
        $( "#new_head" ).removeClass( "valid" );
        $( "#new_head" ).addClass( "invalid" );
       }else{
        $( "#new_head" ).removeClass( "invalid" );
        $( "#new_head" ).addClass( "valid" );
       }
      
     // console.log('ok');
    });
    

   // $.post( "test.php", { name: "John", time: "2pm" } );

    $( "#btnl" ).click(function() {
      //M.toast({html: 'Пожалуйста, заполните содержание', classes: '#ef5350 red lighten-1 rounded'});
      event.preventDefault();
      if ($( "#pass" ).val()!=''){
        $( "#btnl" ).submit();
        let tosend = $( "#pass" ).val();
        $.get( "/auth", {pass: tosend} )
        .done(function( data ) {
          console.log( "Data Loaded: " + data );
            if (data=='ok'){
            M.toast({html: 'Авторизация - успешно!', classes: '#26a69a teal lighten-1 rounded'});
            reload(true);
          } else {
            M.toast({html: 'Неверный пароль! Повторите попытку!', classes: '#ef5350 red lighten-1 rounded'});
            $( "#pass" ).val('');
          }
        });
        //console.log( "Handler for .click() called." );
      } else {
        M.toast({html: 'Пожалуйста, введите пароль!', classes: '#ef5350 red lighten-1 rounded'});
      }    
    });
    
   
    function curimgn(name) {
      let ans = name.split('/');
      if (ans) return ans[ans.length-1]
      else return false;
    }
    function getimg() {
      let arr = [];
      for (let i = 0; i < $( "img" ).length; i++) {
        arr.push(curimgn($( "img" ).eq( i ).attr( "src" )));
      }
      arr = arr.toString() 
      console.log(arr);
      return arr
    }
    
    function logout(){
      M.toast({html: 'Выход из аккаунта', classes: '#ef5350 red lighten-1 rounded'});
      $.get( "/logout");
      reload(true);
    }

    function reload(p){
      if (p) setTimeout(reload, 1000);
      else location.reload();
    }
    
  });
