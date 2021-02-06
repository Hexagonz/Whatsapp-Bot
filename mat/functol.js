const {
	MessageType,
	Mimetype
} = require("@adiwajshing/baileys");
const fs = require('fs');
const request = require('request');
const Requests = require('node-fetch');
const {
	exec
} = require("child_process")

exports.sendContact = (client, toId, teks, teks2) => {
	const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + teks + '\n' + 'ORG:Kontak\n' + 'TEL;type=CELL;type=VOICE;waid=' + teks2.split("@s.whatsapp.net")[0] + ':+' + teks2.split("@s.whatsapp.net")[0] + '\n' + 'END:VCARD'
	client.sendMessage(toId, {
		displayname: teks,
		vcard: vcard
	}, MessageType.contact)
}


exports.sendMessage = (client, to, text) => {
	client.sendMessage(to, text, MessageType.text)
}

exports.sendImageUrl = (client, to, url, quote) => {
	var names = Date.now() / 10000;
	var download = function (uri, filename, callback) {
		request.head(uri, function (err, res, body) {
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};
	download(url, './media/' + names + '.jpeg', async function () {
		console.log('done');
		let media = fs.readFileSync('./media/' + names + '.jpeg')
		await client.sendMessage(to, media, MessageType.image, {
			caption: quote
		})
	});
}

exports.sendVideoUrl = (client, to, url, quote) => {
	var names = Date.now() / 10000;
	var download = function (uri, filename, callback) {
		request.head(uri, function (err, res, body) {
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};
	download(url, './media/' + names + '.mp4', async function () {
		console.log('done');
		let media = fs.readFileSync('./media/' + names + '.mp4')
		await client.sendMessage(to, media, MessageType.video, {
			caption: quote
		})
	});
}

exports.sendAudioUrl = (client, to, url, quote) => {
	var names = Date.now() / 10000;
	var download = function (uri, filename, callback) {
		request.head(uri, function (err, res, body) {
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};
	download(url, './media/' + names + '.mp3', async function () {
		console.log('done');
		let media = fs.readFileSync('./media/' + names + '.mp3')
		await client.sendMessage(to, media, MessageType.audio, {
			mimetype: Mimetype.mp4Audio
		})
	});
}

exports.sendVoiceUrl = (client, to, url, quote) => {
	var names = Date.now() / 10000;
	var download = function (uri, filename, callback) {
		request.head(uri, function (err, res, body) {
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};
	download(url, './media/' + names + '.mp3', async function () {
		console.log('done');
		let media = fs.readFileSync('./media/' + names + '.mp3')
		await client.sendMessage(to, media, MessageType.audio, {
			mimetype: Mimetype.mp4Audio, ptt: true
		})
	});
}

exports.sendStickerUrl = (client, to, url) => {
	var names = Date.now() / 10000;
	var download = function (uri, filename, callback) {
		request.head(uri, function (err, res, body) {
			request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
		});
	};
	download(url, './media/' + names + '.png', async function () {
		console.log('done');
		let filess = './media/' + names + '.png'
		let asw = './media/' + names + '.webp'
		exec(`ffmpeg -i ${filess} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${asw}`, (err) => {
			let media = fs.readFileSync(asw)
			client.sendMessage(to, media, MessageType.sticker)
		});
	});
}

exports.sendStickerPath = (client, to, path) => {
	var names = Date.now() / 10000;
	let filess = path
	let asw = './media/' + names + '.webp'
	exec(`ffmpeg -i ${filess} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${asw}`, (err) => {
		let media = fs.readFileSync(asw)
		client.sendMessage(to, media, MessageType.sticker)
	});
}

exports.sendMention = (client, to, home, mids) => {
	var text = home.split("Mat").join("").split("@s.whatsapp.net").join("")
	client.sendMessage(to, text, MessageType.text, {
		contextInfo: {
			"mentionedJid": mids
		}
	})
}

function os_func() {
	this.execCommand = function (cmd) {
		return new Promise((resolve, reject) => {
			exec(cmd, (error, stdout, stderr) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(stdout)
			});
		})
	}
}