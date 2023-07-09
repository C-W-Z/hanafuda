/* constants */
const SCREEN_W = 1200;
const SCREEN_H = 675;
const CARD_IMG_W = 976; // width of card in img
const CARD_IMG_H = 1600; // height of card in img
const CARD_W = 75;
const CARD_H = CARD_W * 1600/976;
const CARD_GAP = 5;
const CARD_NUM = 48; // num of total cards
const HAND_NUM = 8; // num of cards be distributed to a player when game starts
const FIELD_SPACE = 12; // max num of cards can be place on the field
const PLR = 0; // player
const CPU = 1; // computer
// cardID = 0 ~ 47
const CARD_BACK_ID = 48; // 牌背
const DECK_P = {x: SCREEN_W / 2 - CARD_W / 2, y: SCREEN_H / 2 - CARD_H / 2};
// 牌的種類（カス・短冊・タネ・五光）
const card_type = [3,1,0,0, 2,1,0,0, 3,1,0,0, 2,1,0,0, 2,1,0,0, 2,1,0,0, 2,1,0,0, 3,2,0,0, 2,1,0,0, 2,1,0,0, 3,2,1,0, 3,0,0,0];
// 役(yaku)
const yaku_score = [   6  ,  1   , 1   ,  1  ,   5  ,  5  ,   5   ,  5   ,   7   ,   8  ,  10 ,  4  ,     3     ,    3     ,  5   , 5 ];
const yaku_name  = ["親権","カス","短冊","タネ","青短","赤短","猪鹿蝶","三光","雨四光","四光","五光","月札","花見で一杯","月見で一杯","飲み","草"];
const YAKU_NUM = yaku_name.length;
const tuki_name  = ["松","梅","桜","藤","菖蒲","牡丹","萩","芒","菊","紅葉","雨","桐"];
// 數字
const NUMBER = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
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
const gameState = {
    title: 0,
    start: 1,
    deal: 2,
    player_select_hand: 3,
    player_select_field: 4,
    player_play_card: 5,
    player_choose_card: 6, // when draw a card with two cards on field can be paired
    player_end_round: 7,
    player_decide_koi: 8,
    cpu_play: 9,
    koikoi_animation: 10,
    month_end: 11,
    game_result: 12
};

/* canvas & sources & control */
let R = window.devicePixelRatio;
let scaleRate = 1; // the scale rate of canvas
let canvas;
let context;
let mouse = { x: 0, y: 0 }; // the mouse coordinates
let menu; // right click menu
let cardImg = new Array();

/* game variables */
let card; // the card objs
let deck; // the deck obj(array)
let player; // the player objs ()
let field; // the field obj
let game; // the game data obj

/* animation */
let MOVE_TIME = normalMoveTime; // 牌移動的時間
let startTime = null;
let time_func = new Function();
time_func = null;
let next_func = new Function();
next_func = null;
let movingCard;

/* UI */
// 文
let score_panel = new Array(2);
// when ask player for koikoi
let koi_panel;
let end_button;
let koi_button;
let koikoi_banner;
// when game end -> show yaku and score
let yaku_panel;
let next_month_button;
let to_result_button;
let result_panel;

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
        context.strokeStyle = "gold";
        context.lineWidth = 2 * R;
        context.strokeRect(px * R, py * R, CARD_W * R, CARD_H * R);
    }
}
// draw card outline on field
function draw_noticed(px, py) {
    context.strokeStyle = "darkred";
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