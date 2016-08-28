// Установка массива объектов с информацией о студентах в window.studentsList из .json 
// или local storage
(function () {
	
setData( [ 'studentsListDef', 'default_list.json' ], [ 'lessonsListDef', 'default_lessons.json' ] );

//Отправка запроса к json файлу если в localStorage не сохранен массив
function setData (arrayArgs1, arrayArgs2) {
  for ( var i = 0; i < arguments.length; i++) {
    if ( !localStorage[ arguments[i][0] ] ) {
      ajaxSend( arguments[i][1], false, arguments[i][0] );
    }
    else {
      window[ arguments[i][0] ] = JSON.parse(localStorage[ arguments[i][0] ]);
    }
  }
}

 //Кроссбраузерная функция создания xmlHttpRequest
 function getXhrObject() {
        if(typeof XMLHttpRequest === 'undefined'){
          XMLHttpRequest = function() {
            try { return new ActiveXObject( 'Msxml2.XMLHTTP' ); }
              catch(e) { return new ActiveXObject('Microsoft.XMLHTTP') }
          };
        }
      return new XMLHttpRequest();
    }

  //Функция отправка ajax и обработка ответа
  function ajaxSend(filename, async, responseObjectName) {
    var xhr = getXhrObject();
    xhr.open('GET', '/Kontur.task/json/' + filename, async);
   //Обработчик ответа от сервера
    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      if (this.status != 200) {
        alert( 'Ошибка: ' + ( this.status ? this.statusText : 'запрос не выполнен') );
        return;
      }
      var response = JSON.parse(this.responseText);
      localStorage[responseObjectName] = this.responseText;
      window[responseObjectName] = response;
      }
      xhr.send();
  }
})()