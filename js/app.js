(function () {
	//Сортироваи списка по ФИО
	function listSort(a,b) {
		var sortOrder = ['surname', 'name', 'patronymic'];
		for (var i = 0; i < sortOrder.length; i++) {
			if ( a[sortOrder[i]] == b[sortOrder[i]] ) continue;
			if ( a[sortOrder[i]] == b[sortOrder[i]] && i == sortOrder.length - 1 ) return 0;
			if (a[sortOrder[i]] > b[sortOrder[i]]) {
				return 1;
			} 
			else {
				return -1;
			}
		}
	}

	
	
	var cardChange = 0,
		students = window.studentsListDef,
		lessons = window.lessonsListDef,
		cardFields = document.querySelectorAll('#surname, #name, #patronymic, #male, #female, #birth, #entered'),
		studentCard = document.getElementsByClassName('student-card')[0],
		studentCardWrap = studentCard.parentElement,
		studentsListBlock = document.getElementsByClassName('students-list'),
		studentFullName = document.querySelectorAll('.student-full-name>h2')[0],
		lessonList = studentCard.getElementsByClassName('lesson-list'),
		allLessons = lessonList[0].getElementsByTagName('input'),
		saveChanges = document.querySelector("input[value='Сохранить изменения']"),
		deleteStudentButton = studentCard.getElementsByClassName('delete')[0],
		addLesson = document.forms['add-lesson'][0];
		
	
	//УДАЛИТЬ УДАЛИТЬ ПОЗЖЕ - СОРТИРОВКАыыыыыыыы
	students.sort( function (a,b) { return listSort (a,b) } );
	
	//Создание ul со списком студентов для сайдбара
	function createList() {
		var ul = document.createElement('ul');
		for ( var i = 0; i < students.length; i++ ) {
			ul.innerHTML += "<li><a href=" + students[i].id + ">" + students[i].surname + " " + students[i].name + " " + students[i].patronymic + "</a></li>";
		}
		studentsListBlock[0].insertBefore(ul, studentsListBlock[0].children[0]);
	}
	createList();
	
	//Проверка на существование искомого объекта  
	function returnNotFound (object) {
		if (object == '404') {
			alert('Not found');
			return;
		}
		return 'found';
	}

	//Заполнение и вывод карточки студента - для новой или существующей записи
	function createStudentCard(studentObject, exist) {
		choosedStudent('', 1);
		handleVisibilityClasses('active','', studentCard, studentFullName );
		returnNotFound(studentObject);
		var studentInfo = studentObject || undefined;
		setTimeout( function () { 
			writeStandartData (studentInfo);
			writeLessonList(studentInfo, exist);
			writeLinearChart();
			if ( studentCard.getAttribute('data-id') != 'new') drawPieChart();
		}, 210);
		handleVisibilityClasses('hidden','', studentCard, studentFullName );
		setTimeout( function () { 
			handleVisibilityClasses('','active', studentCard, studentFullName );
		}, 290);
		setTimeout( function () {
			choosedStudent(studentObject, 2);
			cardChange = 0;
		}, 400);
	}

	// Скрыть/показать информацию о студенте, если она отображается
	function handleVisibilityClasses (toRemove, toAdd, elements) {
		for (var i = 2; i < arguments.length; i++) {
			if (arguments[0] && arguments[i].classList.contains(toRemove)) {
				arguments[i].classList.remove(toRemove);
			}
			if (arguments[1]) {
				arguments[i].classList.add(toAdd);
			}
		}	
	}

	//Заполнение списка предметов для новых и существующих
	function writeLessonList(studentObject, exist) {
		var elementToInsert = document.createElement('ul');
		for (var i = 0; i < lessons.length; i++) {
			var li = document.createElement('li');
			li.classList.add('lesson-name');
			li.innerHTML = "<input id='" + lessons[i].id + "' value='" + lessons[i].title + "' type='checkbox' " + ( (exist) ? ( seacrhVisited( lessons[i].id , studentObject.visitedLessons ) ) ? 'checked' : '' : '' ) + "><label for='" + lessons[i].id + "'>" + lessons[i].title + "</label>";
			li.children[0].addEventListener('change', function () { 
				// если произошли изменения в выборе предметов - data-chaged установить в true для предупреждения
				//о потере изменений при переходе по карточкам и несохранении результатов
				dataChangeCheck();
				writeLinearChart(); 
			});
			elementToInsert.appendChild(li);
		}
		lessonList[0].innerHTML = '';
		lessonList[0].appendChild(elementToInsert);

		//Отмена выделения label при щелчке
		Array.prototype.forEach.call(document.getElementsByTagName('label'), function (item) {
			item.onselectstart= function (e) {
				return false;
			}
		})
	
	}  


	// если произошли изменения в карточке - data-chaged установить в true для предупреждения
	//о потере изменений при переходе по карточкам
	for (var i = 0; i < cardFields.length; i++) {
		cardFields[i].addEventListener('input', function () {
			dataChangeCheck();
		})
	}
	
	function dataChangeCheck() {
		if (studentCard.getAttribute('data-changed') == 'false' || !studentCard.getAttribute('data-changed')) {
				studentCard.setAttribute('data-changed', 'true');
		}
	}

	//Поиск предмета среди посещенных студентом
	function seacrhVisited(lessonId, studentVisited) {
		for ( var i = 0; i < studentVisited.length; i++ ) {
			if ( lessonId == studentVisited[i] ) {
				return true;
			} 
		}
	}

	//Выделение\скрытие активной записи в списке студенов 
	function choosedStudent(studentObject, hiddenOrShow) {
		if (hiddenOrShow === 1) {
			studentCardWrap.classList.remove('fade-out');
			var choosed = studentsListBlock[0].getElementsByClassName('choosed')[0] || studentsListBlock[0].getElementsByClassName('choosed-after')[0];
			if (choosed) {
				choosed.classList.remove('choosed');
				choosed.classList.remove('choosed-after');
				
			}
		}
		if (hiddenOrShow === 2) {
			studentCardWrap.classList.add('fade-out');
			if (studentObject) {
				var studentId = studentObject.id,
					newChoose = studentsListBlock[0].querySelector("a[href='" + studentId + "']"),
					studentCardBottom = studentCard.getBoundingClientRect().bottom,
					choosenStudentBottom = newChoose.getBoundingClientRect().bottom + 9; 
				
				if (studentCardBottom > choosenStudentBottom) {
					newChoose.classList.add('choosed');
				}
				else {
					newChoose.classList.add('choosed-after');
				}
			}
		}
	}

	//Построение линейного графика
	function writeLinearChart() {
		var chartBlock = studentCard.getElementsByClassName('linear-chart')[0],
			lessonsCheckbox = document.querySelectorAll(".lesson-list input[type='checkbox']"),
			checkedCounter = 0,
			checkedElement = [],
			width;
		chartBlock.innerHTML = '';
		for ( var i = 0; i < lessonsCheckbox.length; i++ ) {
			if (lessonsCheckbox[i].checked) {
				checkedCounter++;
				checkedElement.push(lessonsCheckbox[i].value);
			}
		}
		for ( i = 0; i < checkedElement.length; i++ ) {
			width = (1 / checkedCounter ) * 100 + '%';
			chartBlock.innerHTML += "<li style='background-color: " + dataSearch(lessons, checkedElement[i], 'title').color + "; width: " + width + "; height: " + chartBlock.clientHeight + "px;' title='" + checkedElement[i] + "'></li>";
		}
	}
	
	
	//Добавить студента
	var addStudent = document.querySelector("input[value='Добавить студента']");
	addStudent.addEventListener('click', function () {
		if (cardChange) return;
		if (saveConfirm() == 'cancel') {
			return;
		}
		studentCard.setAttribute('data-id', 'new');
		clearCanvas(); 
		var hash = window.location.hash
		if (hash != '#/' && hash != '#/menu') {
			history.pushState({ id: '' }, "", '#/');
		}
		if (studentCard.querySelectorAll('.status-invalid,.status-valid').length) {
			Array.prototype.forEach.call(cardFields, function(elem) {
  				deleteCheckStatus(elem);
  			})
  		}
		createStudentCard('', false);
		
	})


	//Генерация случайного цвета
	function randomColor() {
		return "rgb(" + randomNumber(0,100,2) + "%, " + randomNumber(0,100,2) + "%, " + randomNumber(0,100,2) + "%)";
	}

	//Генерация случайных чисел в диапазоне от min до max
	function randomNumber(min, max, fixed) {
    	var rand = min - 0.5 + Math.random() * (max - min + 0.5);
    	rand = +rand.toFixed(fixed);
    	return rand;
  }

	//Заполнение полей блока "Стандартные личные данные"
	function writeStandartData (studentObject) {
		studentFullName.innerText = '';
		for (var i = 0; i < cardFields.length; i++) {
			if (cardFields[i].id == 'male' || cardFields[i].id == 'female') {
				cardFields[i].checked = (studentObject) ? ( cardFields[i].id == studentObject.gender ) : false;
				continue;
			}
			cardFields[i].value = (studentObject) ? studentObject[cardFields[i].id] : '';
			if (i < 3) { 
				studentFullName.innerText += (studentObject) ? (' ' + studentObject[cardFields[i].id]) : '';
			}
		}
		if (studentObject) studentCard.setAttribute('data-id', studentObject.id);
	}

	//Сбор информации блока полей "Стандартные личные данные" карточки студента
	function getStudentCardData(newOrChanged) {
		var resultObj = {};
		for ( var i = 0; i < cardFields.length; i++ ) {
			if (cardFields[i].id == 'male' || cardFields[i].id == 'female') {
				if (resultObj.gender) continue;
				resultObj.gender = (cardFields[i].checked) ? cardFields[i].id : '';
				continue;
			}
			resultObj[cardFields[i].id] = cardFields[i].value;
		}
		if (newOrChanged != 'new') {
			resultObj.id = studentCard.getAttribute('data-id');
		} 
		else {
			var max = generateId(students);
			resultObj.id = 'student_' + ( max + 1 );
		}
		resultObj.visitedLessons = [];
		for ( i = 0; i < allLessons.length; i++ ) {
			if (allLessons[i].checked) {
				resultObj.visitedLessons.push( allLessons[i].id );
			}
		}
		return resultObj;
	}

	//Создание ID новой записи студента/предмета
	function generateId(array) {
		var max = 0;
		for ( i = 0; i < array.length; i++ ) {
			if (max < +array[i].id.replace(/\D/g,"")) {
				max = +array[i].id.replace(/\D/g,"");
			}
		}
		return max;
	}

	//Добавление объекта студента в общий массив объектов студентов, обновление списка студентов; 
	function saveStudentCardData(newOrChanged) {
		var objectForPush = getStudentCardData(newOrChanged);
		if (newOrChanged == 'new') {
			students.push(objectForPush);
		}
		else {
			for ( var i = 0; i < students.length; i++ ) {
				if (students[i].id == objectForPush.id) {
					students[i] = objectForPush;
					break;
				}
			}
		}
		students.sort( function (a,b) { return listSort (a,b) } );
		localStorage['studentsListDef'] = JSON.stringify(students);
		createList();
		studentCard.setAttribute('data-changed', 'false');
		if (newOrChanged == 'new') {
			cardChange = 0;
			window.location.hash = '#/' + objectForPush.id;
		} 
		else {
			createStudentCard(objectForPush, true);
		}
	}
	
	//Сохранение изменений в карточке студента
	saveChanges.addEventListener('click', function() {
		if (cardChange) return;
		var data = studentCard.getAttribute('data-id');
		if (data == 'null') return;

		//вызов события input на полях карточки студента для запуска валидации текстовых полей и дат
		var eventInput = document.createEvent("Event");
		eventInput.initEvent("input", true, true);
		Array.prototype.forEach.call(cardFields, function(elem) {
			elem.dispatchEvent(eventInput);
  		})
		//Валидация радио
  		var checkFlag = 0;
		for (var i = 3; i <= 4; i++) {
			if (cardFields[i].checked) {
				checkFlag = 1;
				break;
			}
		}
		if (!checkFlag) {
			deleteCheckStatus(cardFields[3]);
			cardFields[3].parentElement.parentElement.appendChild(createStatusElement('invalid', 'empty'));
		} 
		else {
			deleteCheckStatus(cardFields[3]);
		}

  		if (studentCard.querySelectorAll('.status-invalid').length) {
  			return;
  		}

  		//Дополнительная проверка на корректность дат
  		function extraDateCheck(value) {
  			var value = value.split('.').reverse().join('-'),
  				date = new Date(value);
  			return date.valueOf();  
  		}
  		if (extraDateCheck(cardFields[5].value) >= extraDateCheck(cardFields[6].value)) {
  			alert('Дата рождения должна быть ранее даты поступления!');
  			return;
  		}

  		Array.prototype.forEach.call(cardFields, function(elem) {
			deleteCheckStatus(elem);
  		})
		
		studentsListBlock[0].innerHTML = '';
		cardChange = 1;
		saveStudentCardData(data);
	})


	//Изменение URL при клике по ссылке-ФИО студента и переход к соответствующей карточке
	//с предупреждением о потере несохраненных данных
	studentsListBlock[0].addEventListener('click', function (event) {
		event.preventDefault();
		if (cardChange) return;
		if (event.target.tagName == 'A') {
			var href = event.target.getAttribute('href');
			if (window.location.hash == '#/' + href) return;
		}
		if (saveConfirm() == 'cancel') {
			return;
		}
		if (event.target.tagName != 'A') {
			hiddenIfEmptyHash(true);
			return;
		}
    	history.pushState({ id: href }, "", '#/' + href);
		cardChange = 1;
		if (studentCard.querySelectorAll('.status-invalid,.status-valid').length) {
			Array.prototype.forEach.call(cardFields, function(elem) {
				deleteCheckStatus(elem);
  			})
		}
		createStudentCard( dataSearch( students, href, 'id' ), true);
	})

	//скрыть карточку если хэш пустой
	function hiddenIfEmptyHash (pushState) {
		handleVisibilityClasses('active','hidden', studentCard, studentFullName );
		if (pushState) {
			var hash = window.location.hash;
			if (hash != '#/menu' && hash != '#/') {
				history.pushState({}, "", '#/menu');
			}
		}
		choosedStudent('', 1);
		studentCard.setAttribute('data-id','null');
	}

	//проверка на наличие измененных несохраненных данных 
	function saveConfirm() {
		if (studentCard.getAttribute('data-changed') == 'true') {
			var userResponse = confirm('Все несохраненные данные будут потеряны. Продолжить?');
			if (!userResponse) return 'cancel'; 
			else {
				studentCard.setAttribute('data-changed', 'false');
			}
		}
	}
	
	//Изменение содержания при переходе вперед/назад, изменении #id в адресной строке вручную 
	window.onhashchange = function() {
		var newLesson = document.getElementsByClassName('new-lesson-substrate')[0];
		removeElement (newLesson);
		hashChange();
	}

	//удаление элемента из DOM - (окно добавления нового предмета, аватар активной записи в списке 
	//студентов
	function removeElement (element) {
		if (element) {
			element.parentElement.removeChild(element);
		}
	}	

	//Изменение содержания при переходе по ссылке на карточку (если присутствует #id)
	window.onload = function () {
		hashChange();
	}
	//Изменение содержания при наличии #id
	function hashChange() {
		studentCard.setAttribute('data-changed', 'false');
		//удаление статус-полей
		if (studentCard.querySelectorAll('.status-invalid,.status-valid').length) {
			Array.prototype.forEach.call(cardFields, function(elem) {
				deleteCheckStatus(elem);
  			})
		}
		var hash = window.location.hash;
		if (/#\/student_[0-9]*$/.test(hash)) {
			var idFromHash = hash.substring(2),
				studentInfo = dataSearch( students, idFromHash, 'id' );
			handleVisibilityClasses('active', '', studentCard, studentFullName );
			if (returnNotFound(studentInfo) != 'found') return;
			handleVisibilityClasses('hidden','active', studentCard, studentFullName );
			choosedStudent('', 1);
			writeStandartData (studentInfo);
			writeLessonList(studentInfo, true);
			writeLinearChart();
			if ( studentCard.getAttribute('data-id') != 'new') drawPieChart();
			choosedStudent(studentInfo, 2);
			
		}
		else {
			hiddenIfEmptyHash();
			choosedStudent('', 1);
			return;
		}
	}
	
	addLesson.addEventListener('click', function() {
		newLessonWindow();
	})

	//вызов окна для добавления нового предмета
	function newLessonWindow() {
		//формирование окна
		var body = document.body,
			div = document.createElement('div'),
			colorDiv = document.createElement('div'),
			usedColorsDiv = document.createElement('div'),
			saveForm = document.createElement('form');
		div.classList.add('new-lesson-substrate');
		div.style.height = body.clientHeight + 'px';
		div.innerHTML = "<div class='new-lesson'><div class='clicked-block'><h3>Добавить предмет</h3></div><form name='new-lesson-name'><label for='lesson-title'>Название предмета:</label><input type='text' id='lesson-title'></form></div>";
		colorDiv.innerHTML = "<input type='button' value='Цветовая маркировка'><div class='lesson-color' style='background-color:" + randomColor() + "'></div>";
		colorDiv.classList.add('color-choose');
		
		//положение окна добавления предмета при вызове
		function newLessonDivPosition(element) {
			var elementMetrics = element.getBoundingClientRect(),
				centerY = (elementMetrics.bottom - elementMetrics.top) / 2,
				centerX = (elementMetrics.right - elementMetrics.left) / 2,
				coorY = (window.innerHeight/2 - centerY) + window.pageYOffset + 'px',
				coorX = (window.innerWidth/2 - centerY) + window.pageXOffset + 'px';
			element.style.top = coorY;
			element.style.left = coorX;
			element.style.opacity = 1;
		}


		//Изменение цвета по клику
		colorDiv.children[0].addEventListener('click', function () {
			colorDiv.children[1].setAttribute('style', 'background-color:' + randomColor());
		})

		usedColorsDiv.innerHTML = "<span>* Цвета, используемые существующими предметами:</span>";
		usedColorsDiv.classList.add('color-used');
		for (var i = 0; i < lessons.length; i++) {
			usedColorsDiv.innerHTML+="<div class='real-lessons-color' style='background-color:" + lessons[i].color + "'></div>";
		} 
		saveForm.innerHTML="<input type='button' value='Сохранить'><input type='button' value='Отмена'>";
		saveForm.setAttribute('name','submit-save-new-lesson');
		//удаление результатов предыдуей валидации
		var titleLesson = div.children[0].children[1].children[1];
		titleLesson.onfocus = function () {
			titleLesson.classList.remove('invalid');
		}
		//сбор информации о новом предмете с формы
		function getLessonCardData(title) {
			var colorInfoPos = colorDiv.children[1].getAttribute('style'),
				objectForPush = {
				id: 'lesson_' + (generateId(lessons) + 1),
				title: title,
				color: colorInfoPos.substr(colorInfoPos.search('rgb'))
			};
			return objectForPush;
		}

		//Сохранение нового предмета или отмена и скрытие окна 
		saveForm.addEventListener('click', function(event) {
			if (event.target.value =='Сохранить') {
				if (!titleLesson.value) {
					titleLesson.classList.add('invalid');
					return;
				} 
				var objectForPush = getLessonCardData(titleLesson.value);
				lessons.push(objectForPush);
				localStorage['lessonsListDef'] = JSON.stringify(lessons);
				removeElement(div);
				var studentId = studentCard.getAttribute('data-id');
				if (studentId == 'new') {
					writeLessonList();
				}
				if (/student\_[0-9]*$/.test(studentId)) {
					writeLessonList(dataSearch(students, studentId, 'id'), true);
				}
			}
  			if (event.target.value =='Отмена') {
  				removeElement(div);
  			}
		})
		//подготовка к dragNdrop, добавление элементов в DOM
		var movedBlock = div.children[0];
		var elementsToAdd = [colorDiv, usedColorsDiv, saveForm];
		for (i = 0; i < elementsToAdd.length; i++) {
			movedBlock.appendChild(elementsToAdd[i]);
		}
		var clickedBlock = movedBlock.children[0];

		//функция перемещения окна
		function move(mouseEvent, direction, size, elem, coor, scrollWidth) {
			var newCoor = mouseEvent['page' + direction] - elem + 'px',
				newOtherSide = mouseEvent['page' + direction] + (movedBlock['offset' + size] - elem),
				firstBorder = window['page' + direction + 'Offset'];
			if (parseInt(newCoor) <= firstBorder) {
				movedBlock.style[coor] = firstBorder + 1 + 'px'; 
			}
			else if (newOtherSide >= (window['inner' + size] + firstBorder - scrollWidth)) {
				movedBlock.style[coor] = ((window['inner' + size] + firstBorder) - 1) - movedBlock['offset' + size] - scrollWidth + 'px';
			}
			else { 
				movedBlock.style[coor] = newCoor; 
			}
		}
		//drag'n'drop
		clickedBlock.onmousedown = function(event) {
			var elemX = event.offsetX,
				elemY = (event.target.tagName == 'H3') ? event.offsetY + parseInt(getComputedStyle(event.target.parentElement).paddingTop) : event.offsetY;
			event.preventDefault();
			clickedBlock.ondragstart = function() {
  				return false;
			};
			document.onmousemove = function(event) {
				move(event, 'X', 'Width', elemX, 'left', 16 );
				move(event, 'Y', 'Height', elemY, 'top', 0);
			}
			window.onmouseup = function() {
				document.onmousemove = function () { return false };
			}
		}

		body.appendChild(div);
		newLessonDivPosition(div.children[0]);
	}


	//Удаление записи студента
	function deleteStudent(studentForDelete) {
		var elementIndex = dataSearch(students, studentForDelete,'id', true );
		students.splice( elementIndex, 1 );
		localStorage['studentsListDef'] = JSON.stringify(students);
		studentCard.setAttribute('data-changed', 'false');

	}

	//Удаление записи при нажатии на кнопку "Удалить", обновление списка

	deleteStudentButton.addEventListener('click', function() {
		var studentForDelete = studentCard.getAttribute('data-id');
		if (!(/student_[0-9]*$/.test(studentForDelete))) return;
		var userResponse = confirm('Запись студента будет удалена. Продолжить?');
		if (!userResponse) {
			return;
		}
		else {
			deleteStudent(studentForDelete);
			studentsListBlock[0].innerHTML = '';	
			createList();
			hiddenIfEmptyHash(true);
		}
	})


	//Поиск объекта в массиве. Возврат найденного объекта/ключа в массиве/не найдено
	function dataSearch(array, itemId, key, indexOrObj) {
		for ( var i = 0; i < array.length; i++ ) {
			if (array[i][key] == itemId) return (indexOrObj) ? i : array[i];
		}
		return '404';
	}

	var canvas = document.querySelector("canvas");
	//Очистка холста
	function clearCanvas() {
		var	cx = canvas.getContext("2d");
		cx.clearRect(0, 0, canvas.width, canvas.height); 
	}

	//Рисование круговой диаграммы
	function drawPieChart() {
	  	var	cx = canvas.getContext("2d"),
	    	rndData = [ randomNumber(1, 3, 0), randomNumber(1, 3, 0), randomNumber(1, 3, 0) ],
	    	total = rndData.reduce(function(sum, element) {
	    		return sum + element;	
	    	}, 0);
	    cx.clearRect(0, 0, canvas.width, canvas.height); // Очиста всего холста 
	    // Start at the top
	    var currentAngle = -0.5 * Math.PI;
	    rndData.forEach(function(element) {
	    	var sliceAngle = (element / total) * 2 * Math.PI;
	    	cx.beginPath();
	    // center=100,100, radius=100
	    // from current angle, clockwise by slice's angle
	    	cx.arc(150, 150, 120, currentAngle, currentAngle + sliceAngle);
	    	currentAngle += sliceAngle;
	    	cx.lineTo(150, 150);
	   		cx.fillStyle = randomColor();
	    	cx.fill();
	    })
	    cx.beginPath();
	    cx.arc(150, 150, 95, currentAngle, currentAngle + 2 * Math.PI);
	    cx.fillStyle = "white";
	    cx.fill();
	    //gradient
	    var fillColorRadial = cx.createRadialGradient(150, 150, 85, 154, 155, 115);
     	fillColorRadial.addColorStop(0.3, "transparent");
     	fillColorRadial.addColorStop(0.9, "black");
     	cx.fillStyle = fillColorRadial;
     	cx.fill();
     	cx.font = "16px Arial";
  		cx.fillStyle = "black";
  		cx.fillText("0", 145, 20);
  		cx.fillText("25", 280, 152);
  		cx.textBaseline = "top";
  		cx.textAlign = "center";
  		cx.fillText("50", 153, 280);
  		cx.textAlign = "end";
  		cx.textBaseline = "middle";
  		cx.fillText("75", 20, 150);
  		cx.textAlign = "center";
  		cx.textBaseline = "bottom";
  		cx.font = "600 14px Arial";
  		cx.fillText("Всего пропущено", 150, 115);
  		cx.font = "600 31px Arial";
  		cx.fillText( Math.round(rndData[1] / total * 100) + Math.round(rndData[0] / total * 100), 150, 155);
  		cx.font = "600 12px Arial";
  		cx.fillText("Из них по", 150, 175);
  		cx.fillText("уважительной причине", 150, 190);
		cx.font = "600 22px Arial";
		cx.fillText( Math.round(rndData[0] / total * 100) , 150, 220);
  		cx.textAlign = "start";
  		cx.textBaseline = "alphabetic";

	}

	//валдиация полей 
	function textValid(obj, regExp, regExpTest, cymbolQuan) {
		var value = obj.value,
			caretPos = obj.selectionStart,
			regExpForTest = regExpTest || regExp,
			newValue = value.replace(regExp, '');
		if (newValue.length > cymbolQuan) {
			arrayNewValue = newValue.split('');
			arrayNewValue.length = cymbolQuan;
			newValue = arrayNewValue.join('');
		}
		obj.value = newValue;
		if (regExpForTest.test(value.substr(caretPos-2, 2))) {
			obj.selectionStart = caretPos-1;
			obj.selectionEnd = caretPos-1;
		}	
		else {
			obj.selectionStart = caretPos;
			obj.selectionEnd = caretPos;
		}
	}


	//Валидация ФИО
	for (var i = 0; i < 3; i++) {
		cardFields[i].addEventListener('input', function (e) {
			e.preventDefault();
			textValid(this, /[^A-zА-яЁё\-]|\]|\[|\`|\\|\_/g, '', 30);
			checkValue(this, 'text');	
		});
	}
	//Валидация дат
	for (var i = 5; i <= 6; i++) {
		cardFields[i].addEventListener('input', function (e) {
			e.preventDefault();
			textValid(this, /[^0-9\.]|\]|\[|\`|\\|\.(?=\.)|^\.|\_/g, /[^0-9.]|\]|\[|\`|\\|\.\.|\_/g, 10);
			checkValue(this, 'date');
		});
	}

	//Валидация радио 
    for (var i = 3; i <= 4; i++) {
		cardFields[i].addEventListener('change', function (e) {
			e.preventDefault();
			dataChangeCheck();
			var statusElement = cardFields[3].parentElement.parentElement.querySelector('.status-invalid');
			if (statusElement) {
				deleteCheckStatus(cardFields[3]);
			}
		});
	}


	//Создание ячейки с результатами проверки поля на валидность
	function createStatusElement(status, reason) {
		var td = document.createElement('td');
		td.setAttribute('data-cell','status');
		td.innerHTML = "<span></span>";
		var span = td.children[0];
		if (status == 'valid') {
			span.classList.add('status-valid');
			span.innerText = "Введено верно!";
			return td;
		}
		if (status == 'invalid') {
			span.classList.add('status-invalid');
			switch (reason) {
				case 'empty': 
					span.innerText = "Поле обязательно к заполнению";
					return td;
				case 'invalidFormat':
					span.innerText = "Неверный формат";
					return td;
				case 'invalidDate':
					span.innerText = "Некорректная дата";
					return td;
			}
		}
	} 

	//Проверка поля на валидность, создание статус-ячеек
	function checkValue(element, type) {
		var currentRow = element.parentElement.parentElement;
		deleteCheckStatus(element, currentRow);
		if (!element.value) {
			currentRow.appendChild(createStatusElement('invalid', 'empty'));
			element.classList.add('invalid');
			return;
		}
		switch (type) {
			case 'text':
				currentRow.appendChild(createStatusElement('valid', ''));
				element.classList.add('valid');
				break;
			case 'date':
				if (/^\d\d\.\d\d\.\d\d\d\d$/.test(element.value)) {
					var date = element.value.split('.').reverse('').join('-'),
						checkDate = new Date(date);
					if (checkDate != 'Invalid Date') {
						currentRow.appendChild(createStatusElement('valid', ''));
						element.classList.add('valid');
					}
					else {
						currentRow.appendChild(createStatusElement('invalid', 'invalidDate'));
						element.classList.add('invalid');
					}
				}
				else {
					currentRow.appendChild(createStatusElement('invalid', 'invalidFormat'));
					element.classList.add('invalid');
				}
				break;
		}
	}

	//удаление результатов предыдущих проверок
	function deleteCheckStatus(element, currentRow) {
		var currentRow = currentRow || element.parentElement.parentElement,
			currentStatus = currentRow.querySelector("*[data-cell='status']");
		if (currentStatus) {
			removeElement(currentStatus);
			element.classList.remove('valid');
			element.classList.remove('invalid');
		}
	}

	//



})()
  