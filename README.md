# Keksik VK Callback API

Готовый Node.js класс для работы с Keksik VK Callback API.
Данный класс создает http-сервер, который принимает callback-уведомления (по умолчанию порт 3000).

Документация API - https://keksik.io/api#callback

### Пример использования класса

```js
const KeksikVKCallbackApi = require("keksik-vk-callback-api");

const keksik = new KeksikVKCallbackApi(
	"тут_подставить_секретный_ключ", // Секретный ключ можно получить в панели управления приложенияем, во вкладке "API", в разделе "Настройка Callback сервера".
	"тут_подставить_код" // Код можно получить в панели управления приложенияем, во вкладке "API", в разделе "Настройка Callback сервера". Пример строки, где смотреть код - "{"status": "ok", "code": "c96530"}".
	// 3000 // Третьий параметр (не обязательный) - порт на котором запускается callback-сервер.
);

keksik.newDonate((donate, group) => {
	console.log("New donate", donate, group);
});
keksik.paymentStatus((payment, group) => {
	console.log("Payment status updated", donate, group);
});

keksik.listen();
```
