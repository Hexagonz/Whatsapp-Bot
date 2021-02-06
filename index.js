const {
    WAConnection,
    MessageType,
    Presence,
    Mimetype,
    GroupSettingChange,
    MessageOptions,
    WALocationMessage,
    WA_MESSAGE_STUB_TYPES,
    ReconnectMode,
    ProxyAgent,
    waChatKey,
    mentionedJid
} = require("@adiwajshing/baileys");

const fs = require('fs');
const request = require('request');
const Requests = require('node-fetch');
const moment = require('moment-timezone')
const {
    exec
} = require("child_process")

const { sendImageUrl, sendVideoUrl, sendContact, sendMessage, sendAudioUrl, sendVoiceUrl, sendStickerUrl, sendStickerPath, sendMention } = require('./mat/functol');
const blocked = JSON.parse(fs.readFileSync('./mat/block.json'))
const FormData =require('form-data');

const APIKUY = "Chat me https://wa.me/6281396061030"

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

async function ClientWA() {
    const wa = new WAConnection()
    wa.on('qr', qr => {
        console.log('PLEASE SCAN the QR CODE')
    });
    wa.on('credentials-updated', () => {
        const authInfo = wa.base64EncodedAuthInfo()
        fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, '\t'))
    })
    fs.existsSync('./session.json') && wa.loadAuthInfo('./session.json')
    await wa.connect()
    console.log('Name : ' + wa.user.name + ' (' + wa.user.jid + ')')
    var os = new os_func();
    os.execCommand("rm -f ./media/*.mp3");
    os.execCommand("rm -f ./media/*.mp4");
    os.execCommand("rm -f ./media/*.jpeg");
    os.execCommand("rm -f ./media/*.png");
    os.execCommand("rm -f ./media/*.webp");
    os.execCommand("sync; echo 3 > /proc/sys/vm/drop_caches");

    wa.on('CB:Blocklist', json => {
        console.log(json)
        //if (blocked.length > 2) return
        for (let i of json[1].blocklist) {
            //console.log(i)
            xyz = i.replace('c.us','s.whatsapp.net')
            blocked.push(xyz)
            fs.writeFileSync('./mat/block.json', JSON.stringify(blocked))
        }
        console.log(blocked)
    })

    wa.on('blocklist-update', json => {
        console.log(json)
    })

    wa.on('chat-update', async(chat) => {
        if (!chat.hasNewMessage) return
        m = JSON.parse(JSON.stringify(chat)).messages[0] // pull the new message from the update
        const messageContent = m.message
        if (!messageContent) return
        let to = m.key.remoteJid
        let id = m.key.remoteJid
        let sender = m.participant
        let isGroup = m.key.remoteJid.endsWith('@g.us')
        let setkey = ""
        let type = Object.keys(m.message)[0]
        const sakura = JSON.stringify(messageContent)
        const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
        const Qimage = type === 'extendedTextMessage' && sakura.includes('imageMessage')
        let txt = (type === 'conversation' && m.message.conversation.startsWith(setkey)) ? m.message.conversation : (type == 'zzzimageMessage') && m.message.imageMessage.caption.startsWith(setkey) ? m.message.imageMessage.caption : (type == 'zzzvideoMessage') && m.message.videoMessage.caption.startsWith(setkey) ? m.message.videoMessage.caption : (type == 'extendedTextMessage') && m.message.extendedTextMessage.text.startsWith(setkey) ? m.message.extendedTextMessage.text : ''
        const args = txt.trim().split(/ +/).slice(1)
        

// READ KONTOL
// Jika anda ingin mengubah ke self-bot caranya. Ubah (chat) ke (m.key.fromMe)
        if (chat) {
               msg = JSON.parse(JSON.stringify(chat)).messages[0]
               if (msg.key.fromMe){
                   return
               }else{
                   if (!isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mPERSONAL\x1b[1;37m]', time, 'chat', msg.message.conversation, 'from', msg.key.remoteJid)
                   if (!isGroup == false) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;34mGROUP\x1b[1;37m]', time, 'chat', msg.message.conversation, 'from', msg.key.remoteJid)
               }
               //console.log(msg)

            // INI BUAT MSG QUOTED NYA MEK....
            if (type == 'extendedTextMessage'){
                const context = m.message.extendedTextMessage.contextInfo
                if (context){
                    const quoted = context.quotedMessage
                    m.message = quoted
                    if (txt == "img2url"){
                        if (quoted.imageMessage){
                            const file = await wa.downloadAndSaveMediaMessage(m, './media/' + m.key.id)
                            const stream = fs.createReadStream(file)
                            const form = new FormData();
                            form.append('img', stream);
                            const res = await Requests('http://hujanapi.xyz/api/image2url?apikey='+APIKUY, { method: 'POST', body: form })
                            const ret =  await res.json()
                            sendMessage(wa,to, ret.result.url)
                        }
                    }
                    else if (txt == "to sscode"){
                        if (quoted.conversation){
                            xtext = quoted.conversation
                            const code = await Requests('http://hujanapi.xyz/api/sscode?query='+xtext+'&apikey='+APIKUY)
                            const mat = await code.json()
                            sendImageUrl(wa,to,mat.kontol)
                        }
                        
                    }
                    else if (txt == "totext"){
                        if (quoted.audioMessage){
                                const file = await wa.downloadAndSaveMediaMessage(m, './media/' + m.key.id)
                                const stream = fs.createReadStream(file);
                                const form = new FormData();
                                form.append('audio', stream);
                                const res = await Requests('http://hujanapi.xyz/api/stt?apikey='+APIKUY, { method: 'POST', body: form })
                                const ret =  await res.json()
                                sendMessage(wa, to, ret.result)
                            }
                        }
                    }
            }// BATAS UNTUK QUOTED MEK
            if (txt == "hi") {
                if (m.key.fromMe) { // Untuk Self-Bot
                    sendMessage(wa, to, "Hi sayang!!!")
                } else  {
                    sendMessage(wa, to, "Hi ")
                }
            } else if (txt == "me") {
                sendMention(wa, to, "Hey @Mat" + wa.user.jid, [wa.user.jid])
                sendContact(wa, to, "Your Contact", wa.user.jid)
            } else if (txt == "tagall") {
                var vz = await wa.groupMetadata(to)
                var memB = vz.participants
                let mids = []
                let fox = "*Tag All Groups*\n"
                let no = 0
                for (let vh of memB) {
                    no += 1
                    fox += "\n" + no + ". @" + vh.jid
                    mids.push(vh.jid)
                }
                fox += "\n\nTotal: "+mids.length
                sendMention(wa, to, fox, mids)
            } else if (txt == "groupadmin") {
                var group = await wa.groupMetadata(to)
                var participants = group.participants
                let admin = []
                let xyz = "*Admin Groups*\n"
                let no = 0
                for (let members of participants) {
                    if (members.isAdmin) {
                        no += 1
                        xyz += "\n" + no + ". @" + members.jid
                        admin.push(members.jid)
                    }
                }
                xyz += "\n\nTotal: "+admin.length
                sendMention(wa, to, xyz, admin)
            } else if (txt == "ownergroup") {
                var group = await wa.groupMetadata(to)
                var participants = group.participants
                let ownerg = []
                let xyz = "*Owner Groups*\n"
                for (let members of participants) {
                    if (members.isSuperAdmin) {
                        xyz += "\n@" + members.jid
                        ownerg.push(members.jid)
                    }
                }
                sendMention(wa, to, xyz, ownerg)
            } else if (txt.startsWith("ceklistrik")) {
                const xtext = txt.replace('ceklistrik' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/listrik?nop="+xtext+ "&apikey="+APIKUY)
                const mat = await response.json()
                if (mat.status == '422') {
                    const crot = mat.meesage
                    sendMessage(wa,to,"[ ERROR ]\n\n"+crot)
                } else if (mat.status == '200'){
                    let crot = "*Tagihan PLN*\n"
                    crot += "\nName: "+mat.result.name
                    crot += "\nID Customer: "+mat.result.no_pel
                    crot += "\nPeriode: "+mat.result.periode
                    crot += "\nFee Admin: "+mat.result.fee_admin
                    crot += "\nAmount: "+mat.result.amount
                    sendMessage(wa,to,crot)
                }
            } else if (txt.startsWith("cektelkom")) {
                const xtext = txt.replace('cektelkom' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/telkom?nop="+xtext+ "&apikey="+APIKUY)
                const mat = await response.json()
                if (mat.status == '400') {
                    const crot = mat.meesage
                    sendMessage(wa,to,"[ ERROR ]\n\n"+crot)
                } else if (mat.result.error == false){
                    let crot = "*Tagihan PLN*\n"
                    crot += "\nCustomer Name: "+mat.result.customer_name
                    crot += "\nID Customer: "+mat.result.customer_number
                    crot += "\nFee Admin: "+mat.result.fee_admin
                    crot += "\nTagihan: "+mat.result.tagihan
                    crot += "\nTotal: "+mat.result.total
                    sendMessage(wa,to,crot)
                } else if (mat.result.error == "Maaf, sedang error..."){
                    sendMessage(wa,to, "[ ERROR ]\n Nomor ID Salah")
                }
            } else if (txt.startsWith("sscode")) {
                const xtext = txt.replace('sscode' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/sscode?query="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                sendImageUrl(wa,to,mat.kontol)
            } else if (txt.startsWith("nickff")) {
                if (args.length < 1) return sendMessage(wa, to, "Ex: *nickff [id ff]*\nContoh : *nickff 866740835*")
                const xtext = txt.replace('nickff' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/nickff?id="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                sendMessage(wa, to, mat.result)
            } else if (txt.startsWith("nickcodm")) {
                if (args.length < 1) return sendMessage(wa, to, "Ex: *nickcodm [id codm]*\nContoh : *nickcodm 7852089867668209248*")
                const xtext = txt.replace('nickff' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/nickcodm?id="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                sendMessage(wa, to, mat.result)
            } else if (txt.startsWith("nickml")) {
                if (args.length < 1) return sendMessage(wa, to, "Ex: *nickml [id ml]|[serverid]*\nContoh : *nickml 1161941|2002*")
                const xtext = txt.replace('nickml' + " ", "")
                const xyz = xtext.split(" ")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/nickml?id="+pemisah[0]+"&serverid="+pemisah[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                sendMessage(wa, to, mat.result)
            } else if (txt.startsWith("stickerline")) {
                const xtext = txt.replace('stickerline' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/stickerline?url="+xtext+"&apikey="+APIKUY)
                const data = await response.json()
                const cok = data.result
                for (var iu = 0; iu < data.length; iu++) {
                    if (data[iu].animation == true) {
                        sendStickerUrl(wa, to, data[iu].url)
                    } else {
                        sendStickerUrl(wa, to, data[iu].url)
                    }
                }
            } else if (txt.startsWith("shopee")) {
                const xtext = txt.replace('shopee' + " ", "")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/shopee?query="+xtext+"&count=10&apikey="+APIKUY)
                const datas = await response.json()
                const img = 'https://igo.space/wp-content/uploads/2020/09/logo.png'
                const asu = datas.result.items
                if (pemisah.length == 1)  {
                    let num = 0
                    let fox = "*_Shopee Search_*\n\n"
                    for (var a = 0; a < asu.length; a++) {
                        num += 1
                        fox += "```"+asu[a].name+"```\n"+asu[a].link_produk+"```("+num+")```\n"
                    }
                    fox += "\n\n*Hey* @Mat *For detail*:\n```shopee "+xtext+"|number```"
                    sendImageUrl(wa, to, img, fox)
                }
                if (pemisah.length == 2) {
                    const num = pemisah[1]
                    const value = Number(pemisah[1])
                    let fox = "*_Detail Product Shopee*_\n"
                    fox += "\nTitle : " + asu[value].name
                    fox += "\nShop Loc : " + asu[value].shop_loc
                    fox += "\nLink Product : " + asu[value].link_produk
                    fox += "\nPrice : " + asu[value].price
                    fox += "\nPrice Min and Max : " +asu[value].price_min+" "+asu[value].price_max
                    fox += "\nDesc : " + asu[value].desc
                    fox += "\n\n\nSource : " + datas.result.source
                    sendImageUrl(wa, to, asu[value].image_cover, fox)
                }
            } else if (txt.startsWith("xvideos")) {
                const xtext = txt.replace("xvideos ", "")
                pemisah = xtext.split("|")
                const search = pemisah[0]
                const response = await Requests("http://hujanapi.xyz/api/xvideos?query="+search+"&count=10&apikey="+APIKUY)
                const datas = await response.json()
                const img = 'https://seeklogo.com/images/X/xvideos-logo-77E7B4F168-seeklogo.com.png'
                const asu = datas.result

                if (pemisah.length == 1)  {
                    let num = 0
                    let fox = "*_Xvideos Search_*\n\n"
                    for (var a = 0; a < asu.length; a++) {
                        num += 1
                        fox += "```"+asu[a].title+"```\n"+asu[a].url+"```("+num+")```\n"
                    }
                    fox += "\n\n*Hey* @Mat *For detail*:\n```xvideos "+xtext+"|number```"
                    sendImageUrl(wa, to, img, fox)
                }
                if (pemisah.length == 2) {
                    const num = pemisah[1]
                    const value = Number(pemisah[1])
                    let fox = "*_Detail Video*_\n"
                    fox += "\nTitle : " + asu[value].title
                    fox += "\nDuration : " + asu[value].duration
                    fox += "\nChannel : " + asu[value].channel
                    fox += "\nLink : " + asu[value].url
                    fox += "\n\n\nSource : xvideos.com"
                    sendImageUrl(wa, to, asu[value].image, fox)
                    await sendMessage(wa, to, "If you want download video, type *dlxvideos linknya*")
                }
            } else if (txt.startsWith("xnxx")) {
                const xtext = txt.replace('xnxx' + " ", "")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/xnxx?query="+xtext+"&count=10&apikey="+APIKUY)
                const datas = await response.json()
                const img = 'https://yt3.ggpht.com/ytc/AAUvwngpbURJyno0rvS4aza889YDF7-oXbRyopWO0bZO=s900-c-k-c0x00ffffff-no-rj'
                const asu = datas.result
                if (pemisah.length == 1)  {
                    let num = 0
                    let fox = "*_Xnxx Search_*\n\n"
                    for (var a = 0; a < asu.length; a++) {
                        num += 1
                        fox += "```"+asu[a].title+"```\n"+asu[a].url+"```("+num+")```\n"
                    }
                    fox += "\n\n*Hey* @Mat *For detail*:\n```xnxx "+xtext+"|number```"
                    sendImageUrl(wa, to, img, fox)
                }
                if (pemisah.length == 2) {
                    const num = pemisah[1]
                    const value = Number(pemisah[1])
                    let fox = "*_Detail Video*_\n"
                    fox += "\nTitle : " + asu[value].title
                    fox += "\nDuration : " + asu[value].duration
                    fox += "\nChannel : " + asu[value].channel
                    fox += "\nLink : " + asu[value].url
                    fox += "\n\n\nSource : xnxx.com"
                    sendImageUrl(wa, to, asu[value].image, fox)
                    sendMessage(wa, to, "If you want download video, type *dlxnxx linknya*")
                }
            } else if (txt.startsWith("getbio")) {
                mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
                const pdata = await wa.getStatus(mentioned)
                if (pdata.status == 401) { // Untuk Self-Bot
                    sendMessage(wa, to, "Status Profile Not Found")
                } else  {
                    sendMessage(wa, to, pdata.status)
                }
            } else if (txt.startsWith("getpict")) {
                mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
                try {
                    const pdata = await wa.getProfilePicture(mentioned)
                    sendImageUrl(wa, to, pdata)
                } catch {
                    const res = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
                    sendImageUrl(wa, to, res)
                }
            } else if (txt == "herolistml") {
                const response = await Requests("http://hujanapi.xyz/api/listheroml?apikey=" + APIKUY)
                const data = await response.json()
                const asu = data.result
                let fox = "*List Hero*\n"
                let no = 0
                for (var a = 0; a < asu.length; a++) {
                    no += 1
                    fox += "\n" + no + ". " + asu[a].name
                }
                sendMessage(wa, to, fox)
            } else if (txt.startsWith("heroml")) {
                const xtext = txt.replace('heroml' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/heroml?hero="+xtext+"&apikey="+APIKUY)
                const datas = await response.json()
                const asu = datas.results
                let fox = "*Detail Hero*\n"
                fox += "\n*Title :* " + asu.name
                fox += "\n*Quotes :* " + asu.quotes
                fox += "\n*Role :* " + asu.role
                fox += "\n*Line Recommendation :* " + asu.line_recommendation
                fox += "\n*Price :* "
                fox += "\n    *BP:* "+asu.price.battlepoint
                fox += "\n    *DM:* "+asu.price.diamond
                fox += "\n    *Ticket:* "+asu.price.ticket
                fox += "\n\n*Attributes :*"
                fox += "\n    *Ability Critical Rate :* "+asu.attributes.ability_crit_rate
                fox += "\n    *Attack Speed :* "+asu.attributes.attack_speed
                fox += "\n    *Basic Attck CritRate :* "+asu.attributes.basic_atk_crit_rate
                fox += "\n    *HP :* "+asu.attributes.hp
                fox += "\n    *Hp Regen :* "+asu.attributes.hp_regen
                fox += "\n    *Magic Power :* "+asu.attributes.magic_power
                fox += "\n    *Mana :* "+asu.attributes.mana
                fox += "\n    *Mana Regen :* "+asu.attributes.mana_regen
                fox += "\n    *Movement Speed :* "+asu.attributes.movement_speed
                fox += "\n    *Pyhsical Attack :* "+asu.attributes.physical_attack
                fox += "\n    *Pyhsical Defense :* "+asu.attributes.physical_defense
                sendImageUrl(wa, to, asu.img, fox)
            } else if (txt == "charsgenshin") {
                const response = await Requests("http://hujanapi.xyz/api/gichars?apikey=" + APIKUY)
                const data = await response.json()
                const liyue = data.result.liyue
                const mondstadt = data.result.mondstadt
                let fex = "\n\n*List Character Mondstadt*\n"
                let num = 0
                let fox = "*List Character Liyue*\n"
                let no = 0
                for (var a = 0; a < liyue.length; a++) {
                    no += 1
                    fox += "\n" + no + ". " + liyue[a]
                }
                for (var a = 0; a < mondstadt.length; a++) {
                    num += 1
                    fex += "\n" + num + ". " + mondstadt[a]
                }
                const mat = fox+" "+fex
                sendMessage(wa, to, mat)
            } else if (txt.startsWith("chargi")) {
                const xtext = txt.replace('chargi' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/gichar?query="+xtext+"&apikey="+APIKUY)
                const datas = await response.json()
                const asu = datas.result
                let fox = "*Detail Character*\n"
                fox += "\n*Title :* " + asu.title
                fox += "\n*Info :* " + asu.intro
                sendImageUrl(wa, to, asu.cover1, fox)
                await sendVoiceUrl(wa, to, asu.cv[0].audio[2])
            } else if (txt == "removechat") {
                let xyz = await wa.chats.all()
                wa.setMaxListeners(20)
                for (let DOR of xyz) {
                    wa.deleteChat(DOR.jid)
                }
                sendMessage(wa, to, "Success..")
            } else if (txt == "sticker") {
                if (Qimage) {
                    const HUU = Qimage ? JSON.parse(JSON.stringify(m).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : m
                    const media = await wa.downloadAndSaveMediaMessage(HUU, './media/' + m.key.id)
                    sendStickerPath(wa, to, media)
                }
            } else if (txt.startsWith("clear")) {
                var os = new os_func();
                os.execCommand("rm -f ./media/*.mp3");
                os.execCommand("rm -f ./media/*.mp4");
                os.execCommand("rm -f ./media/*.jpeg");
                os.execCommand("rm -f ./mp4/*.mp4");
                os.execCommand("sync; echo 3 > /proc/sys/vm/drop_caches");
                sendMessage(wa, to, "Success..")
            } else if (txt.startsWith('tiktok')) {
                const xtext = txt.replace('tiktok' + " ", "")
                const cuj = xtext.split(" ")
                let pesan = `𝗧𝗜𝗞𝗧𝗢𝗞 𝗠𝗘𝗡𝗨\n\n𝗖𝗼𝗺𝗺𝗮𝗻𝗱:\n  1. ${setkey}tiktok profile {username}\n  3. ${setkey}tiktok hastag {query}\n  3. ${setkey}tiktok download {link post}`
                if (xtext == "") {
                    sendMessage(wa, to, pesan)
                } else {
                    if (cuj[0] == "profile") {
                        try {
                            sendMessage(wa, to, 'please wait..')
                            const response = await Requests('http://hujanapi.xyz/api/tiktok?username=' + cuj[1] + '&apikey=' + APIKUY)
                            const pp = await response.json()
                            const cok = pp.result
                            let dat = "*TIKTOK PROFILE*\n"
                            dat += "\n*_Username_*: " + cok.username
                            dat += "\n*_Title_*: " + cok.nickname
                            dat += "\n*_Verified_*: " + cok.verifed
                            dat += "\n*_Follow_*: " + cok.following
                            dat += "\n*_Follower_*: " + cok.followers
                            dat += "\n*_Like_*: " + cok.like_count
                            dat += "\n*_Post_*: " + cok.video_post
                            dat += "\n*_Bio_*: " + cok.bio
                            dat += "\n*_Url_account_*: " + cok.url
                            await sendImageUrl(wa, to, cok.picture, dat)
                        } catch (err) {
                            console.log('Error, ' + err)
                        }
                    } else if (cuj[0] == "hastag") {
                        try {
                            sendMessage(wa, to, 'please wait..')
                            const response = await Requests('http://hujanapi.xyz/api/tiktokhastag?tag=' + cuj[1] + '&apikey=' + APIKUY)
                            const pp = await response.json()
                            const cok = pp.result
                            let dat = "*TIKTOK HASTAG*\n"
                            let no = 0
                            for (var prop in cok) {
                                no += 1
                                dat += "\n" + no + "."
                                dat += "\n*_Name_*: " + cok[prop].name
                                dat += "\n*_Nick_*: " + cok[prop].nickName
                                dat += "\n*_Image_*: " + cok[prop].imgurl
                                dat += "\n*_Url_*: " + cok[prop].videourl + "\n"
                            }
                            await sendImageUrl(wa, to, cok[0].urlImage, dat)
                        } catch (err) {
                            console.log('Error, ' + err)
                        }
                    } else if (cuj[0] == "download") {
                        try {
                            sendMessage(wa, to, 'please wait..')
                            const response = await Requests('http://hujanapi.xyz/tiktokdl?link=' + cuj[1] + '&apikey=' + APIKUY)
                            const pp = await response.json()
                            const mek = pp.result
                            await sendVideoUrl(wa, to, mek.video, "")
                        } catch (err) {
                            console.log('Error, ' + err)
                        }
                    } else {
                        sendMessage(wa, to, pesan)
                    }
                }
            } else if (txt.startsWith("fbdl")) {
                const xtext = txt.replace('fbdl' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/fbdl?url=" + xtext + "&apikey=" + APIKUY)
                const data = await response.json()
                const fox = data.result
                let veza = "*_FACEBOOK DOWNLOAD_*"
                sendVideoUrl(wa, to, fox.Videourl, veza)
            } else if (txt.startsWith("play")) {
                const xtext = txt.replace('play' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/ytmp3?query="+xtext+"&apikey="+APIKUY)
                const datas = await response.json()
                let fox = "*Play Music*\n"
                fox += "\n*Title :* " + datas.result.title
                fox += "\n*Duration :* " + datas.result.duration
                fox += "\n*Size :* " + datas.result.size
                sendImageUrl(wa, to, datas.result.image, fox)
                sendVoiceUrl(wa, to, datas.result.mp3)
            } else if (txt.startsWith('playstore')) {
                const xtext = txt.replace('playstore' + " ", "")
                const response = await Requests('http://hujanapi.xyz/api/playstore?query='+xtext+'&apikey='+APIKUY)
                const ppek = await response.json()
                const mek = ppek.result
                let no = 0
                let xyz = "*Playstore*\n"
                for (var cg of mek) {
                    no += 1
                    xyz += "\n\n" + no + ". Title : " + cg.title
                    xyz += "\nTitle : " + cg.title
                    xyz += "\nUrl : "+ cg.url
                    xyz += "\nDeveloper : " + cg.developer
                    xyz += "\nDescription : " + cg.description
                }
                await sendMessage(wa, to, xyz)
            } else if (txt.startsWith("cocofundl")) {
                const xtext = txt.replace('cocofundl' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/cocofun?url="+xtext+"&apikey=" + APIKUY)
                const data = await response.json()
                const cok = data.result
                sendVideoUrl(wa, to, cok.url, "*COCOFUN DOWNLOAD*")
            } else if (txt.startsWith("dlxnxx")) {
                const xtext = txt.replace('dlxnxx' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/xnxxdl?url="+xtext+"&apikey="+APIKUY)
                const datas = await response.json()
                sendVideoUrl(wa, to, datas.vid, datas.title)
            } else if (txt.startsWith("dlxvideos")) {
                const xtext = txt.replace('dlxvideos' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/xvideosdl?url="+xtext+"&apikey="+APIKUY)
                const datas = await response.json()
                sendVideoUrl(wa, to, datas.vid, datas.title)
            } else if (txt.startsWith("lirik")) {
                const xtext = txt.replace('lirik' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/lirik?query="+xtext+"&apikey="+APIKUY)
                const data = await response.json()
                sendMessage(wa, to, data.result.lyric)
            } else if (txt.startsWith("chord")) {
                const xtext = txt.replace('chord' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/chord?query="+xtext+"&apikey="+APIKUY)
                const data = await response.json()
                sendMessage(wa, to, data.result)
            } else if (txt.startsWith("wikipedia")) {
                const xtext = txt.replace('wikipedia' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/wikipedia?query=" + xtext + "&apikey="+APIKUY)
                const datas = await response.json()
                const asu = datas.result
                const pp = datas.result.img
                let fox = "*_WIKIPEDIA_*\n"
                fox += "\n*Title :* " + asu.title
                fox += "\n*Result :*\n" + asu.info
                for (var a = 0; a < pp.length; a++) {}
                sendImageUrl(wa, to, pp[0], fox)
            } else if (txt.startsWith("gsmarena")) {
                const xtext = txt.replace('gsmarena' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/gsmarena?query=" + xtext + "&apikey=" + APIKUY)
                const datas = await response.json()
                let fox = "*Result GSMarena*\n"
                fox += "\n*Title :*\n" + datas.result.title
                fox += "\n\n*Spesifikasi :*\n" + datas.result.spec
                sendImageUrl(wa, to, datas.result.img, fox)
            } else if (txt.startsWith("artinama")) {
                const xtext = txt.replace('artinama' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/artinama?query="+xtext+"&apikey="+APIKUY)
                const datas = await response.json()
                const asu = datas.result
                sendMessage(wa, to, asu.result)
            } else if (txt.startsWith("artimimpi")) {
                const xtext = txt.replace('artimimpi' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/artimimpi?query="+xtext+"&apikey="+APIKUY)
                const datas = await response.json()
                const asu = datas.result
                sendMessage(wa, to, asu.result)
            } else if (txt.startsWith("jodoh")) {
                const xtext = txt.replace('jodoh' + " ", "")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/ramalanjodoh?name1="+pemisah[0]+"&name2="+pemisah[1]+"&apikey="+APIKUY)
                const datas = await response.json()
                const asu = datas.result
                let fox = '*Ramalan Jodoh*\n\n'
                fox += `*${asu.nama1}* dan *${asu.nama2}*\n`
                fox += '*Sisi Positif*: '+asu.positif
                fox += '\n*Sisi Negatif*: '+asu.negatif
                fox += '\n\n '+asu.desk
                sendImageUrl(wa, to, asu.img, fox)
            } else if (txt.startsWith("ceritasex")) {
                const xtext = txt.replace('ceritasex' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/cersex?apikey=" + APIKUY)
                const datas = await response.json()
                const asu = datas.result
                var img = asu.img
                let fox = `*${asu.title}*`
                fox += "\n\n" + asu.result
                sendImageUrl(wa, to, asu.img[0], fox)
            } else if (txt == "randompantun") {
                const response = await Requests("http://hujanapi.xyz/api/pantun?apikey=" + APIKUY)
                const data = await response.json()
                const crot = data.result
                sendMessage(wa, to, crot.result)
            } else if (txt == "quoteid") {
                const response = await Requests("http://hujanapi.xyz/api/quotesid?apikey=" + APIKUY)
                const data = await response.json()
                sendMessage(wa, to, data.result.quotes)
            } else if (txt == "quotes") {
                const response = await Requests("http://hujanapi.xyz/api/quotesen?apikey=" + APIKUY)
                const data = await response.json()
                sendMessage(wa, to, data.result.quotes)
            } else if (txt == "quotesanime") {
                const response = await Requests("http://hujanapi.xyz/api/quoteanime?apikey=" + APIKUY)
                const data = await response.json()
                const res = data.result.quote+"\n\nAnime:"+data.result.anime+"\nCharacter"+data.result.character
                sendMessage(wa, to, res)
            } else if (txt == "randomcat") {
                const response = await Requests("http://hujanapi.xyz/api/randomcat?apikey=" + APIKUY)
                const data = await response.json()
                sendImageUrl(wa, to, data.result.url, "*_Random Cat_*")
            } else if (txt == "randomloli") {
                const response = await Requests("http://hujanapi.xyz/api/randomloli?apikey=" + APIKUY)
                const data = await response.json()
                sendImageUrl(wa, to, data.result.result, "*RANDOM LOLI*")
            } else if (txt == "randomblowjob") {
                const response = await Requests("http://hujanapi.xyz/api/randomblowjob?apikey=" + APIKUY)
                const data = await response.json()
                sendImageUrl(wa, to, data.url, "*Your Requests*")
            } else if (txt == "randomhentai") {
                const response = await Requests("http://hujanapi.xyz/api/randomhentai?apikey=" + APIKUY)
                const data = await response.json()
                sendImageUrl(wa, to, data.url, "*Your Requests*")
            } else if (txt == "randomkiss") {
                const response = await Requests("http://hujanapi.xyz/api/randomkiss?apikey=" + APIKUY)
                const data = await response.json()
                sendVideoUrl(wa, to, data.url, "*Your Requests*")
            } else if (txt == "randomhug") {
                const response = await Requests("http://hujanapi.xyz/api/randomhug?apikey=" + APIKUY)
                const data = await response.json()
                sendVideoUrl(wa, to, data.url, "*Your Requests*")
            } else if (txt == "randomcry") {
                const response = await Requests("http://hujanapi.xyz/api/randomcry?apikey=" + APIKUY)
                const data = await response.json()
                sendVideoUrl(wa, to, data.url, "*Your Requests*")
            } else if (txt == "randomanime") {
                const response = await Requests("http://hujanapi.xyz/api/randomanime?apikey=" + APIKUY)
                const data = await response.json()
                sendImageUrl(wa, to, data.url, "*Your Requests*")
            } else if (txt == "randomwaifu") {
                const response = await Requests("http://hujanapi.xyz/api/randomwaifu?apikey=" + APIKUY)
                const data = await response.json()
                let fox = "*Nama :* " + data.result.name
                fox += "*\nDeskripsi :* " + data.result.description
                sendImageUrl(wa, to, data.result.image, fox)
            } else if (txt.startsWith("urlshortener1")) {
                const xtext = txt.replace('urlshortener1' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/shorturl?url="+xtext+"&apikey="+APIKUY)
                const anu = await response.json()
                sendMessage(wa, to, anu.result.Short)
            } else if (txt.startsWith("urlshortener2")) {
                const xtext = txt.replace('urlshortener2' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/cuttly?url="+xtext+"&apikey="+APIKUY)
                const anu = await response.json()
                sendMessage(wa, to, anu.result.Short)
            } else if (txt.startsWith("ssweb")) {
                const xtext = txt.replace('ssweb' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/ssweb?url="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                sendImageUrl(wa, to, response, "*Your Requests*")
            } else if (txt.startsWith("fflogo ")) {
                const xtext = txt.replace('fflogo' + " ", "")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/fftext?text="+pemisah[0]+"&hero="+pemisah[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                sendImageUrl(wa, to, mat.result, "*Your Requests*")
            } else if (txt.startsWith("mllogo")) {
                const xtext = txt.replace('mllogo' + " ", "")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/mltext?text="+pemisah[0]+"&hero="+pemisah[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                sendImageUrl(wa, to, mat.result, "*Your Requests*")
            } else if (txt.startsWith("thunder")) {
                const xtext = txt.replace('thunder' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/thunder?text="+xtext+ "&apikey="+APIKUY)
                const mat = await response.json()
                sendImageUrl(wa, to, mat.result, "*Your Requests*")
            } else if (txt.startsWith("googletext")) {
                const xtext = txt.replace('googletext' + " ", "")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/googletext?text1=" + pemisah[0] + "&text2=" + pemisah[1] + "&text3=" + pemisah[2]+ "&apikey=" + APIKUY)
                const mat = await response.json()
                sendImageUrl(wa, to, response.result, "*Your Requests*")
            } else if (txt.startsWith("glitchtext")) {
                const xtext = txt.replace('glitchtext' + " ", "")
                pemisah = xtext.split("|")
                const response = await Requests("http://hujanapi.xyz/api/glitch_text?text1=" + pemisah[0] + "&text2=" + pemisah[1] + "&apikey=" + APIKUY)
                const mat = await response.json()
                sendImageUrl(wa, to, mat.result, "*Your Requests*")
            } else if (txt.startsWith("mediafiredl")) {
                const xtext = txt.replace('mediafiredl' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/mediafire?url="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                console.log(mat)
                let fox = '*Mediafire Download*\n\n'
                fox += '*Title:* '+mat.result.title
                fox += '\n*Size:* '+mat.result.size
                fox += '\n*Type:* '+mat.result.type
                fox += '\n*Link Download:* '+mat.result.url
                sendMessage(wa, to, fox)
            } else if (txt.startsWith("zippydl")) {
                const xtext = txt.replace('zippydl' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/zippydl?url="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                let fox = '*Zippyshare Download*\n\n'
                fox += '\n*Size:* '+mat.size
                fox += '\n*Link Download:* '+mat.link
                sendMessage(wa, to, fox)
            } else if (txt.startsWith("solidfilesdl")) {
                const xtext = txt.replace('solidfilesdl' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/solidfiles?url="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                let fox = '*Solidfiles Download*\n\n'
                fox += '*Title:* '+mat.result.title
                fox += '\n*Size:* '+mat.result.size
                fox += '\n*Link Download:* '+mat.result.url
                sendMessage(wa, to, fox)
            } else if (txt == "herolistml") {
                const response = await Requests("http://hujanapi.xyz/api/listheroml?apikey=" + APIKUY)
                const data = await response.json()
                const asu = data.result
                let fox = "*List Hero*\n"
                let no = 0
                for (var a = 0; a < asu.length; a++) {
                    no += 1
                    fox += "\n" + no + ". " + asu[a].name
                }
                sendMessage(wa, to, fox)
            } else if (txt.startsWith("fancytext")) {
                const xtext = txt.replace('fancytext' + " ", "")
                const response = await Requests("http://hujanapi.xyz/api/fancy?query="+xtext+"&apikey="+APIKUY)
                const mat = await response.json()
                const asu = mat.result.data
                let fox = '*Fancytext*\n\n'
                let no = 0
                for (var a = 0; a < asu.length; a++) {
                    no += 1
                    fox += "\n" + no + ". " + asu[a]
                }
                sendMessage(wa, to, fox)
            } else if (txt.startsWith("help")) {
                const xtext = "http://hujanapi.xyz"
                sendMessage(wa, to, xtext)
            }
        }

    })

    wa.on('message-update', async(json) => {
        console.log(json)
    })

    wa.on('group-participants-update', async (chat) => {
        try {
            const mdata = await wa.groupMetadata(chat.jid)
            console.log(mdata)
            console.log(chat)
        } catch (e) {
            console.log('Error : '+ e)
        }
    })

    wa.on('CB:action,,battery', json => {
        const batteryLevelStr = json[2][0][1].value
        const batterylevel = parseInt(batteryLevelStr)
        console.log('battery level: ' + batterylevel)
    })
    wa.on('close', ({
        reason,
        isReconnecting
    }) => (
        console.log('oh no got disconected: ' + reason + ', Reconnecting: ' + isReconnecting)
    ))
}

ClientWA().catch((err) => console.log(`encountered error: ${err}`))
