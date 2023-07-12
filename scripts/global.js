/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 * @language 繁體中文, 日本語
 * @repo https://github.com/C-W-Z/hanafuda.git
 * @copyright © 2023 C-W-Z
 */

/* constants */
const SCREEN_W = 1200;
const SCREEN_H = 675;
const CARD_IMG_W = 976; // width of card in imgs
const CARD_IMG_H = 1600; // height of card in imgs
const CARD_W = 75; // the size of cards display in game
const CARD_H = CARD_W * 1600/976;
const CARD_GAP = 5; // space between two cards in game
const CARD_LARGE_W = 150; // the size of cards special displayed
const CARD_LARGE_H = CARD_LARGE_W * 1600/976;
const CARD_NUM = 48; // num of total cards
const HAND_NUM = 8; // num of cards be distributed to a player when game starts
const FIELD_SPACE = 12; // max num of cards can be place on the field
const PLR = 0; // player ID
const CPU = 1; // computer ID
// cardID = 0 ~ 47
const CARD_BACK_ID = 48; // 牌背
const DECK_P = {x: SCREEN_W / 2 - CARD_W / 2, y: SCREEN_H / 2 - CARD_H / 2};
// 牌的種類（カス・短冊・タネ・五光）
const card_type = [3,1,0,0, 2,1,0,0, 3,1,0,0, 2,1,0,0, 2,1,0,0, 2,1,0,0, 2,1,0,0, 3,2,0,0, 2,1,0,0, 2,1,0,0, 3,2,1,0, 3,0,0,0];
// 役(yaku)
// const yaku_score = [6, 10, 8, 7, 5, 5, 5, 5, 3, 3, 5, 5, 7, 6, 10, 5, 5, 5., 4, 1, 1, 1];
const yaku_name  = ["親権","五光","四光","雨四光","三光","松桐坊主","表菅原","飲み","花見で一杯","月見で一杯","猪鹿蝶","ごとり","七短","六短","赤短・青短","赤短","青短","草","月札","カス","短冊","タネ"];
const YAKU_NUM = yaku_name.length;
const tuki_name  = ["松","梅","桜","藤","菖蒲","牡丹","萩","芒","菊","紅葉","雨","桐"];
// 數字
const NUMBER = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
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
const FONT_SIZE = 24;
const normalMoveTime = 400; // ms
const fastMoveTime = 250; // ms
const noticeColor = 'gold';
const fieldNoticeColor = 'darkred';
const gameState = {
    /* home page */
    title: 0,
    choose_difficulty: 1,
    settings: 2,
    statistic: 3,
    achievement: 4,
    /* in game */
    ingame: 100, // > game.state > gameState.ingame means in game
    decide_first: 101,
    deal: 102,
    player_select_hand: 103,
    player_select_field: 104,
    player_play_card: 105,
    player_choose_card: 106, // when draw a card with two cards on field can be paired
    player_end_round: 107,
    player_decide_koi: 108,
    cpu_play: 109,
    show_yaku_animation: 110,
    koikoi_animation: 111,
    month_end: 112,
    game_result: 113
};

/* local storage */
let data; // player data storage

/* canvas & sources & control */
let R = window.devicePixelRatio;
let scaleRate = 1; // the scale rate of canvas
let canvas;
let context;
let mouse = { x: 0, y: 0 }; // the mouse coordinates
let cardImg = new Array(CARD_NUM+1);
for (let i = 0; i < CARD_NUM+1; i++)
    cardImg[i] = new Image();

/* game variables */
let card; // the card objs
let deck; // the deck obj(array)
let player; // the player objs ()
let field; // the field obj
let game; // the game data obj

/* guess smaller card in two cards */
let guess_card  = new Array(2);
let guessing = false;
let guess_text;
let guess_result;
const twinkleTime = 3; // twinkling time of smaller card
const GUESS_WAIT = 1500; // ms
let after_guess = new Function();
after_guess = null;

/* animation */
let MOVE_TIME = normalMoveTime; // 牌移動的時間
let FLIP_TIME = normalMoveTime * 2;
let startTime = null;
let time_func = new Function();
time_func = null;
let next_func = new Function();
next_func = null;
let movingCard;

/* UI */
/* home page */
let title_button = new Array(4);
const title_button_text = ['開始', '統計', '成就', '設定'];
let devSource;
let back_button;
let setting_panel;
let settings_button = new Array(4);
const settings_button_text = ["画面調整","資料継承","資料下載","資料削除"];
let statistic_page = 0;
let statistic_panel;
let statistic_button = new Array(2);
// 月
let month_panel;
// 文
let score_panel = new Array(2);
// when ask player for koikoi
let koi_panel;
let end_button;
let koi_button;
let banner;
// when game end -> show yaku and score
let yaku_panel;
let next_month_button;
let to_result_button;
let result_panel;
let home_button;

/* draw card */
/**
 * @param {number} cardID 要畫哪張牌 (0 ~ 48) (48是牌背)
 * @param {number} px card的左上角x座標
 * @param {number} py card的左上角y座標
 * @param {boolean} [noticed=false] 是否有醒目提示(預設無)
 * @param {number} [scaleX=1] 牌的橫向縮放比例(預設1)
 */
function draw_card(cardID, px, py, noticed = false, scaleX = 1) {
    context.drawImage(cardImg[cardID], (px + (1 - scaleX) * CARD_W / 2) * R, py * R, CARD_W * scaleX * R, CARD_H * R);
    if (noticed) {
        context.strokeStyle = noticeColor;
        context.lineWidth = 2 * R;
        context.strokeRect(px * R, py * R, CARD_W * R, CARD_H * R);
    }
}
// draw card outline on field
function draw_noticed(px, py) {
    context.strokeStyle = fieldNoticeColor;
    context.lineWidth = 2 * R;
    context.setLineDash([5]);
    context.strokeRect(px * R, py * R, CARD_W * R, CARD_H * R);
    context.setLineDash([]);
}

/**
 * @abstract easing functions for animation
 * @reference https://stackoverflow.com/questions/8316882/what-is-an-easing-function
 * @param {number} t current time,
 * @param {number} b beginning value,
 * @param {number} c change in value,
 * @param {number} d duration
 * @returns 
 */
function linear(t, b, c, d) {
    return c * (t / d) + b;
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

function endAnimation() {
    time_func = null;
    next_func = null;
    while (movingCard.length > 0)
        movingCard.pop();
}

// 一張牌在一幀內的移動
function step_move(cardID, sX, sY, dX, dY, flip = false) {
    return function(time) {
        const deltaTime = (time - startTime) / MOVE_TIME;
        if (deltaTime >= 1) {
            card[cardID].px = dX;
            card[cardID].py = dY;
            card[cardID].scaleX = 1;
            startTime = null;
            time_func = next_func;
        } else {
            // moving animation
            card[cardID].px = easeInOutQuad(time-startTime, sX, (dX-sX)*deltaTime, MOVE_TIME);// sX + (dX - sX) * deltaTime;
            card[cardID].py = easeInOutQuad(time-startTime, sY, (dY-sY)*deltaTime, MOVE_TIME);// sY + (dY - sY) * deltaTime;
            // flip
            if (flip) {
                card[cardID].scaleX = Math.abs(easeOutQuad(time-startTime, 1, -2*deltaTime, FLIP_TIME*0.5));
                if (deltaTime >= 0.5)
                    card[cardID].back = false;
            }
        }
    }
}

/* shuffle deck */
function shuffle(deck) {
    while (true) {
        // shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[r]] = [deck[r], deck[i]];
        }
        // 檢查場上(deck[0...7])會不會出現3張以上同月分的牌(會不會有牌永遠留在場上無法被吃掉)
        let month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let flag = true;
        for (let i = CARD_NUM - 1; i >= CARD_NUM - HAND_NUM; i--) {
            month[Math.floor(deck[i] / 4)] += 1;
            if (month[Math.floor(deck[i] / 4)] >= 3) {
                flag = false;
                break;
            }
        }
        if (!flag) continue;
        // 檢查手牌(deck[8...15,16...23])會不會出現4張同月分的牌(防止手四)或4組配對的月份牌(防止喰付)
        month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let count = 0;
        for (let i = CARD_NUM - HAND_NUM - 1; i >= CARD_NUM - HAND_NUM * 2; i--)
            month[Math.floor(deck[i] / 4)] += 1;
        for (const m of month) {
            if (m == 4) {
                flag = false;
                break;
            } else if (m == 2)
                count++;
        }
        if (!flag || count == 4) continue;
        month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        count = 0;
        for (let i = CARD_NUM - HAND_NUM * 2 - 1; i >= CARD_NUM - HAND_NUM * 3; i--)
            month[Math.floor(deck[i] / 4)] += 1;
        for (const m of month) {
            if (m == 4) {
                flag = false;
                break;
            } else if (m == 2)
                count++;
        }
        if (!flag || count == 4) continue;

        break;
    }
}

// 畫旋轉圖
// cx, cy : 圖的中心點
// angleInRadians : 角度
function draw_rotate_card_large(ID, cx, cy, angleInRadians) {
    //context.save();
    context.translate(cx * R, cy * R);
    context.rotate(angleInRadians);
    context.drawImage(cardImg[ID], (-CARD_LARGE_W / 2) * R, (-CARD_LARGE_H / 2) * R, CARD_LARGE_W * R, CARD_LARGE_H * R);
    //context.rotate(-angleInRadians);
    //context.translate(-cx * R, -cy * R);
    //context.restore();
    context.setTransform(1, 0, 0, 1, 0, 0);
}

function isArray(obj) {
    if (typeof Array.isArray === "function")
        return Array.isArray(obj); // 如果瀏覽器支援就用 isArray() 方法
    else  // 否則就使用 toString 方法
        return (Object.prototype.toString.call(obj) === "[object Array]");
}

function compareArrFormat(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        const ia = isArray(a[i]);
        const ib = isArray(b[i]);
        if (ia != ib)
            return false;
        if (ia && !compareArrFormat(a[i], b[i]))
            return false
    }
    return true;
}

/* compare whether two objs have same format */
function equalObjFormat(o1, o2) {
    const a = Object.entries(o1);
    const b = Object.entries(o2);
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (a[i][0] != b[i][0])
            return false;
    return compareArrFormat(a, b)
}