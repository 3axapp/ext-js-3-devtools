# Ext JS 3 DevTools
![main.png](docs/main.png)
Firefox: https://addons.mozilla.org/en-US/firefox/addon/ext-js-3-devtools/  

## Может

### 1 Отображать дерево

### 2 Отображать свойства выбранного компонента

### 3 Поиск компонента
- поиск по классу: `DateField`
- поиск по имени: `name=lastChange`
- поиск по id: `#ext-comp-1004`

_поддерживаются регулярки_

### 4 Устанавливает переменную с выбранным компонентом
![4.gif](docs/4.gif)
### 5 Выбрать компонент на странице
![5.gif](docs/5.gif)
### 6 Показать компонент на странице
![6.gif](docs/6.gif)
### 7 Открыть документацию по компоненту
![7.png](docs/7.png)
### 8 Инспектировать html-элемент компонента
![8.png](docs/8.gif)
### 9 Инспектировать функции компонента
![9.png](docs/9.gif)

## Не может
варить кофе

## Установка
### 1. Установить через средства браузера
https://addons.mozilla.org/en-US/firefox/addon/ext-js-3-devtools/

### 2. Собранное расширение
Со страницы [релизов](https://github.com/3axapp/ext-js-3-devtools/releases) скачать файл `xpi` из `Assets`
![releases.png](docs/releases.png)

### 3. Собрать и установить как временное расширение
Сборка
```shell
git clone git@github.com:3axapp/ext-js-3-devtools.git
cd ext-js-3-devtools
npm install
make
```
В FF перейти в `about:debugging#/runtime/this-firefox` и загрузить временное расширение из папки `dist`.  

_Подробнее:_ https://firefox-source-docs.mozilla.org/devtools-user/about_colon_debugging/index.html#this-firefox
