/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 */

//#region Global Variables

/* constants */
const R = window.devicePixelRatio;
const SCREEN_W = 800;
const SCREEN_H = 800;
const CARD_IMG_W = 70; // width of card in img
const CARD_IMG_H = 113; // height of card in img
const cardScale = 0.9; // the rate of (size of card show on canvas / size of card in img)
const CARD_W = CARD_IMG_W * cardScale;
const CARD_H = CARD_IMG_H * cardScale;
const CARD_NUM = 48; // num of total cards
const YAKU_NUM = 12;
const HAND_NUM = 8; // num of cards be distributed to a player when game starts
const FIELD_SPACE = 16; // max num of cards can be place on the field
const PLR = 0; // player
const CPU = 1; // computer
// cardID = 0 ~ 47
const CARD_BACK_ID = 48; // 牌背
// 牌的種類（カス・短冊・タネ・五光）
const card_type = [0,0,1,3, 0,0,1,2, 0,0,1,3, 0,0,1,2, 0,0,1,2, 0,0,1,2, 0,0,1,2, 0,0,2,3, 0,0,1,2, 0,0,1,2, 0,1,2,3, 0,0,0,3];
// 役(yaku)
const yaku_score = [   6  ,  1   , 1   ,  1  ,   5  ,  5  ,   5   ,  5   ,   7   ,   8  ,  10 ,  4  ];
const yaku_name  = ["親権","カス","短冊","タネ","青短","赤短","猪鹿蝶","三光","雨四光","四光","五光","月札"];
const tuki_name  = ["松","梅","桜","藤","菖蒲","牡丹","萩","芒","菊","紅葉","雨","桐"];
const cardPlace = {
    deck: 0,
    field: 1,
    player_hand: 2,
    cpu_hand: 3,
    player_collect: 4,
    cpu_collect: 5,
    moving: 6
};
/* Animation Settings */
const normalMoveTime = 400; // ms
const fastMoveTime = 200; // ms

/* canvas & sources & control */
let scaleRate = 1; // the scale rate of canvas
let canvas;
let context;
let cards = new Image();
cards.src = "pattern.gif";
let mouse = { x: 0, y: 0 }; // the mouse coordinates
let clickCard;

/* game variables */
let card; // the card objs
let deck; // the deck obj(array)
let player; // the player objs ()
let field; // the field obj
let game; // the game data obj
let MAXMONTH = 3; // 預設三月玩法

/* animation */
let MOVE_TIME = normalMoveTime; // 牌移動的時間
let startTime = null;
let time_func = new Function();
time_func = null;
let next_func = new Function();
next_func = null;
let movingCard;

//#endregion

//#region Main
window.onload = function()
{
    /* get canvas */
    canvas = document.getElementById('canvas');
    canvas.width = SCREEN_W * R;
    canvas.height = SCREEN_H * R;
    canvas.style.width = SCREEN_W * scaleRate + 'px';
    canvas.style.height = SCREEN_H * scaleRate + 'px';
    context = canvas.getContext('2d');
    // control settings
    canvas.onmousedown = click_func;

    init_game();

    animate(startTime);

    start_game();
    //debug();
}
//#endregion

//#region Control Functions

function click_func(event) {
    /* must be left click */
    if (event.button != 0) return;
    updateMouseXY(event);
    clickCard = cursorCardID();
    console.log(clickCard);
}

// get mouse coorfinates
function updateMouseXY(event) {
	var rect = event.target.getBoundingClientRect();
	if (scaleRate > 0) {
		mouse.x = (event.clientX - rect.left) / scaleRate;
		mouse.y = (event.clientY - rect.top ) / scaleRate;
	}
    // console.log(mouse);
}

// 回傳滑鼠點到的牌的ID，若無則回傳-1
function cursorCardID() {
    for (const c of card) {
        if (c.place == cardPlace.deck ||
            c.place == cardPlace.cpu_hand ||
            c.place == cardPlace.moving)
            continue;
        if (mouse.x >= c.px && mouse.x <= c.px + CARD_W &&
            mouse.y >= c.py && mouse.y <= c.py + CARD_H)
            return c.ID;
    }
    return -1;
}

//#endregion

//#region Graph Functions

function animate(time) {
    if (!startTime) // it's the first frame
        startTime = time || performance.now();

    // 清除整個canvas畫面
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (time_func != null)
        time_func(time);
    
    // 重畫整個畫面
    draw_canvas();

    requestAnimationFrame(animate);
}

/* draw canvas */
function draw_canvas() {

    // draw the information of this game

    // 文
	context.fillStyle = 'rgb(255,255,255)';
	context.textAlign = "center";
	context.font = "22px sans-serif";
	context.fillText(player[PLR].money + "文", 45 * R, (SCREEN_H - 30) * R);

    // draw the deck at center
    draw_card(CARD_BACK_ID, SCREEN_W / 2 - CARD_W / 2, SCREEN_H / 2 - CARD_H / 2);

    // draw the field cards
    field.update_card_info();
    for (const c of field.card)
        if (c >= 0)
            card[c].draw();

    // draw the hand cards of cpu
    player[CPU].update_card_info();
    for (const c of player[CPU].hand)
        card[c].draw();

    // draw the hand cards of player
    player[PLR].update_card_info();
    for (const c of player[PLR].hand)
        card[c].draw();

    // draw the collect cards of player

    // draw the collect cards of cpu

    // draw moving cards
    for (const c of movingCard)
        if (card[c].px * card[c].py != 0)
            card[c].draw();
}

/* draw card */
/**
 * @param {number} cardID 要畫哪張牌 (0 ~ 48) (48是牌背)
 * @param {number} px card的左上角x座標
 * @param {number} py card的左上角y座標
 * @param {boolean} [noticed=false] 是否有醒目提示(預設無)
 * @param {number} [scaleX=1] 牌的橫向縮放比例(預設1)
 */
function draw_card(cardID, px, py, noticed = false, scaleX = 1) {
    let sx = (cardID % 10) * 72;
    let sy = Math.floor(cardID / 10) * 114;
    context.drawImage(cards, sx, sy, CARD_IMG_W, CARD_IMG_H, (px + + (1 - scaleX) * CARD_W / 2) * R, py * R, CARD_W * scaleX * R, CARD_H * R);
    if (noticed) {
        context.strokeStyle = "yellow";
        context.lineWidth = 2;
        context.strokeRect(px * R, py * R, CARD_W * R, CARD_H * R);
    }
}

// 從array中刪除特定元素
function Remove(arr, val) {
    for (let i = 0; i < arr.length; i++)
        if (arr[i] == val)
            arr.splice(i, 1);
}

/* easing functions for animation */
/* ref: https://stackoverflow.com/questions/8316882/what-is-an-easing-function */
// t: current time,
// b: beginning value,
// c: change in value,
// d: duration
function linear(time, begin, change, duration) {
    return change * (time / duration) + begin;
}
function easeInOutQuad(t, b, c, d) {
    if ((t /= d / 2) < 1)
        return c / 2 * t * t + b;
    else
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
}
function easeInQuad(t, b, c, d) {
    return c * (t /= d) * t + b;
}
function easeOutQuad (t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
}

// 一張牌在一幀內的移動
// 回傳結束了沒
function step_move(cardID, sX, sY, dX, dY, flip) {
    return function(time) {
        const deltaTime = (time - startTime) / MOVE_TIME;
        if (deltaTime >= 1) {
            card[cardID].px = dX;
            card[cardID].py = dY;
            card[cardID].scaleX = 1;
            startTime = null;
            time_func = next_func;
            return true;
        } else {
            // moving animation
            card[cardID].px = easeInOutQuad(time-startTime, sX, (dX-sX)*deltaTime, MOVE_TIME);// sX + (dX - sX) * deltaTime;
            card[cardID].py = easeInOutQuad(time-startTime, sY, (dY-sY)*deltaTime, MOVE_TIME);// sY + (dY - sY) * deltaTime;
            // flip
            if (flip == true) {
                card[cardID].scaleX = Math.abs(0.5 - deltaTime) + 0.5;
                if (deltaTime >= 0.5)
                    card[cardID].back = false;
            }
        }
        return false;
    }
}

// 一幀的發牌動畫
function deal_step(cards, i) {
    if (i < HAND_NUM)
        return function(time) {
            const px = SCREEN_W / 2 + CARD_IMG_W * (i - HAND_NUM / 2) + (CARD_IMG_W - CARD_W) / 2;
            const cx = SCREEN_W / 2 + CARD_IMG_W * (HAND_NUM / 2 - i - 1) + (CARD_IMG_W - CARD_W) / 2;
            const dy = (CARD_IMG_H - CARD_H) / 2;
            // to cpu hand
            step_move(cards[CPU + 1][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, cx, dy, false)(time);
            // to player hand
            step_move(cards[PLR + 1][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, px, SCREEN_H - CARD_IMG_H + dy, true)(time);
            // 發下2張牌
            next_func = deal_step(cards, i + 1);
        }


    return function(time) {
        for (let i = 0; i < HAND_NUM; i++) {
            let fx;
            let I = i + (FIELD_SPACE - HAND_NUM) / 2;
            if (i < HAND_NUM / 2)
                fx = (SCREEN_W-CARD_W-CARD_IMG_W/2)/2 - CARD_IMG_W * Math.floor((FIELD_SPACE/2-I+1)/2) + (CARD_IMG_W-CARD_W)/2;
            else
                fx = (SCREEN_W+CARD_W+CARD_IMG_W/2)/2 + CARD_IMG_W * Math.floor((I-FIELD_SPACE/2)/2) + (CARD_IMG_W-CARD_W)/2;
            const fy = SCREEN_H / 2 - CARD_IMG_H + CARD_IMG_H * (i % 2) + (CARD_IMG_H - CARD_H) / 2;
            // to field
            step_move(cards[0][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, fx, fy, true)(time);
        }
        next_func = after_deal(cards);
    }
}

//#endregion

//#region Game Functions

function debug() {
    console.log('deck:', deck);
    console.log('player:', player[PLR]);
    console.log('cpu:', player[CPU]);
    console.log('field:', field);
    console.log('game:', game);
    console.log('cards:', card);
    console.log('moving:', movingCard);
}

function init_game() {
    // init all cards
    card = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        card[i] = new Card(i);

    // init deck & shuffle
    deck = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        deck[i] = i;
    shuffle(deck);

    /* init player & cpu */
    player = new Array(2);
    player[PLR] = new Player(PLR); // player
    player[CPU] = new Player(CPU); // cpu
    
    // init field
    field = new Field();

    // init moving cards array
    movingCard = new Array();

    // init game data
    game = new Game();
}

/* shuffle deck */
function shuffle(deck) {
    let shuffle_end = false;
    while (!shuffle_end) {
        console.log("shuffle");
        // shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[r]] = [deck[r], deck[i]];
        }
        // 檢查場上(deck[0...7])會不會出現3張以上同月分的牌(會不會有牌永遠留在場上無法被吃掉)
        let month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let flag = true;
        for (let i = CARD_NUM - 1; i >= CARD_NUM - HAND_NUM; i--) {
            month[Math.floor(deck[i] / 4)]++;
            if (month[deck[i]] >= 3)
                flag = false;
        }
        shuffle_end = flag;
    }
}

function start_game() {
    // 決定親權 (0:player, 1:cpu)
    const first = Math.floor(Math.random() * 2);
    console.log("親權：" + first);
    // 發牌
    deal_cards(first);

    // 遊戲正式開始
    while (game.month <= MAXMONTH) {
        game.month++;
        // 當前月份開始
        game.end = true;
        while (!game.end) {
            // start round
            (game.round % 2 == first) ? player_play() : cpu_play();
            game.round++; // 下一回合
        }
    }
}

/* 發牌 */
function deal_cards() {
    // distribute cards
    let new_card = [[], [], []]; // 0:field, 1:player, 2:cpu
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < HAND_NUM; i++) {
            new_card[j].push(deck.pop());
            movingCard.push(new_card[j][i]);
            card[new_card[j][i]].place = cardPlace.moving;
        }
    }

    // animation
    time_func = deal_step(new_card, 0);

    // wait for Animation end
    // setTimeout(after_deal, MOVE_TIME * 10);
}

function after_deal(new_card) {
    return function (time) {
        time_func = null;
        next_func = null;

        while (movingCard.length > 0)
            movingCard.pop();

        // put to players' hand & field
        for (let i = 0; i < HAND_NUM; i++)
            field.card[i+(FIELD_SPACE-HAND_NUM)/2] = new_card[0][i];
        for (let i = 0; i < HAND_NUM; i++)
            player[PLR].hand.push(new_card[PLR + 1][i]);
        for (let i = 0; i < HAND_NUM; i++)
            player[CPU].hand.push(new_card[CPU + 1][i]);

        // update card info
        for (let i = 0; i < player[PLR].hand.length; i++) {
            card[player[PLR].hand[i]].place = cardPlace.player_hand;
            card[player[PLR].hand[i]].back = false;
        }
        for (let i = 0; i < field.card.length; i++) {
            if (field.card[i] < 0) continue;
            card[field.card[i]].place = cardPlace.field;
            card[field.card[i]].back = false;
        }
        for (let i = 0; i < player[CPU].hand.length; i++) {
            card[player[CPU].hand[i]].place = cardPlace.cpu_hand;
            card[player[CPU].hand[i]].back = true;
        }
    }
}


/* 玩家出牌 */
function player_play() {
    
}

/* AI出牌 */
function cpu_play() {
    
}

//#endregion

//#region Classes

class Card {
    constructor(ID) {
        this.ID = ID;
        this.px = 0;
        this.py = 0;
        this.scaleX = 1;
        this.back = true;
        this.noticed = false;
        this.selected = false;
        this.place = cardPlace.deck;
    }

    draw() {
        draw_card((this.back ? CARD_BACK_ID : this.ID), this.px, this.py, (this.back ? false : this.noticed), this.scaleX);
    }
}

class Player {
    constructor(ID) {
        this.ID = ID;
		this.hand = new Array(); // 手牌
        this.noticed = new Array();
        this.money = 0; // 文
        this.score = 0; // 當回合分數
        this.collect = [[], [], [], []]; // 玩家獲得的牌
        this.old_yaku = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	}

    update_noticed() {
        for (let i = 0; i < this.hand.length; i++)
            for (const c of field.card) {
                if (c < 0) continue;
                if (Math.floor(c / 4) == Math.floor(this.hand[i] / 4)) {
                    this.noticed[i] = true;
                    card[this.hand[i]].noticed = true;
                    break;
                }
                this.noticed[i] = false;
                card[this.hand[i]].noticed = false;
            }
    }

    update_card_info() {
        this.update_noticed();
        for (let i = 0; i < this.hand.length; i++) {
            // update hand card px, py
            card[this.hand[i]].px = SCREEN_W / 2 + CARD_IMG_W * (i - this.hand.length / 2) + (CARD_IMG_W - CARD_W) / 2;
            if (this.ID == PLR)
                card[this.hand[i]].py = SCREEN_H - CARD_IMG_H + (CARD_IMG_H - CARD_H) / 2;
            else // ID == CPU
                card[this.hand[i]].py = (CARD_IMG_H - CARD_H) / 2;
            // update hand card showing or not
            card[this.hand[i]].back = (this.ID == CPU);
        }
        // update collected card px, py
        
    }

    /* 結算役 */
    // 回傳是否有新的役
    check_yaku() {
        const light   = this.collect[3].length;
        const seed    = this.collect[2].length;
        const tanzaku = this.collect[1].length;
        const dreg    = this.collect[0].length;

        // see : yaku_name
        let now_yaku = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        let rain = 0; // 雨
        let inoshikacho = 0; // 猪鹿蝶
        let akatan = 0; // 赤短
        let aotan = 0; // 青短
        let month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 月札

        for (const arr of this.collect) {
            for (const c of arr) {
                if (c == 43) rain++;
                if (c == 23 || c == 27 || c == 39) inoshikacho++;
                if (c ==  2 || c ==  6 || c == 10) akatan++;
                if (c == 22 || c == 34 || c == 38) aotan++;
                month[Math.floor(c / 4)]++;
            }
        }

        if (dreg               >= 10) now_yaku[ 1] += dreg    - 9; // カス
        if (tanzaku            >= 5 ) now_yaku[ 2] += tanzaku - 4; // 短冊
        if (seed               >= 5 ) now_yaku[ 3] += seed    - 4; // タネ
        if (aotan              == 3 ) now_yaku[ 4] += 1; // 青短
        if (akatan             == 3 ) now_yaku[ 5] += 1; // 赤短
        if (inoshikacho        == 3 ) now_yaku[ 6] += 1; // 猪鹿蝶
        if (light == 3 && rain == 0 ) now_yaku[ 7] += 1; // 三光
        if (light == 4 && rain == 1 ) now_yaku[ 8] += 1; // 雨四光
        if (light == 4 && rain == 0 ) now_yaku[ 9] += 1; // 四光
        if (light              == 5 ) now_yaku[10] += 1; // 五光
        for (let i = 0; i < month.length; i++)
            if (month[i] == 4)
                now_yaku[11]++; // 月札

        this.score = 0;
        let get_new_yaku = false;
        for (let i = 0; i < YAKU_NUM; i++) {
            // check is there new yaku
            if (now_yaku[i] > this.old_yaku[i])
                get_new_yaku = true;
            // copy now yaku to old yaku
            this.old_yaku[i] = now_yaku[i];
            // calculate new score
            this.score += yaku_score[i] * now_yaku[i];
        }

        return get_new_yaku;

        /*
        if (get_new_yaku) {
            // decide koikoi or end
            // if koikoi koikoi();
            // else end = true;
        } else {
            // next round
        }
        */
    }
}

class Field {
    constructor() {
        this.card = new Array(FIELD_SPACE);
        this.noticed = new Array(FIELD_SPACE);
        for (let i = 0; i < FIELD_SPACE; i++) {
            this.card[i] = -1;
            this.noticed[i] = false;
        }
    }

    update_noticed() {
        for (let i = 0; i < FIELD_SPACE; i++) {
            if (this.card[i] < 0) continue;
            for (const c of player[PLR].hand) {
                if (Math.floor(c / 4) == Math.floor(this.card[i] / 4)){
                    this.noticed[i] = true;
                    card[this.card[i]].noticed = true;
                    break;
                }
                this.noticed[i] = false;
                card[this.card[i]].noticed = false;
            }
        }
    }

    update_card_info() {
        this.update_noticed();
        // update px,py
        for (let i = 0; i < FIELD_SPACE / 2; i++) {
            if (this.card[i] < 0) continue;
            card[this.card[i]].px = (SCREEN_W-CARD_W-CARD_IMG_W/2)/2 - CARD_IMG_W * Math.floor((FIELD_SPACE/2-i+1)/2) + (CARD_IMG_W-CARD_W)/2;
            card[this.card[i]].py = SCREEN_H / 2 - CARD_IMG_H + CARD_IMG_H * (i % 2) + (CARD_IMG_H - CARD_H) / 2;
        }
        for (let i = FIELD_SPACE / 2; i < FIELD_SPACE; i++) {
            if (this.card[i] < 0) continue;
            card[this.card[i]].px = (SCREEN_W+CARD_W+CARD_IMG_W/2)/2 + CARD_IMG_W * Math.floor((i-FIELD_SPACE/2)/2) + (CARD_IMG_W-CARD_W)/2;
            card[this.card[i]].py = SCREEN_H / 2 - CARD_IMG_H + CARD_IMG_H * (i % 2) + (CARD_IMG_H - CARD_H) / 2;
        }
    }
}

class Game {
    constructor() {
        this.month = 0; // 月份
        this.round = 0; // 當前月份現在是第幾回合(start from 0)
        this.end = true; // 當前月份是否結束
        this.koi = [false, false]; // whether player/cpu is doing koi koi
    }
}

//#endregion