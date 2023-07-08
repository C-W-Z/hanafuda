/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 * @language 繁體中文, 日本語
 * @repo https://github.com/C-W-Z/Hanafuda.git
 */

/* Main Function */
window.onload = function()
{
    /* get canvas */
    canvas = document.getElementById('canvas');
    R = window.devicePixelRatio;
    canvas.width = SCREEN_W * R;
    canvas.height = SCREEN_H * R;
    // auto adaptive size by height
    scaleRate = self.innerHeight / SCREEN_H;
    canvas.style.width = SCREEN_W * scaleRate + 'px';
    canvas.style.height = SCREEN_H * scaleRate + 'px';
    context = canvas.getContext('2d');
    // text settings
    context.textAlign = "center";
    context.textBaseline = 'middle';
    // control settings
    canvas.onmousedown = click_func;
    document.addEventListener('keydown', keydown_func);

    init_game();
    animate(startTime);
}

//#region Control Functions

function click_func(event) {
    /* must be left click */
    if (event.button != 0) return;
    updateMouseXY(event);

    if (game == null) return;
    switch (game.state) {
        case gameState.title:
            game.state = gameState.start;
            start_game();
            break;
        case gameState.player_select_hand:
            player[PLR].selected_handID = pointedPlayerHandIndex();
            if (player[PLR].selected_handID >= 0) {
                player_select_hand(player[PLR].selected_handID);
                game.state = gameState.player_select_field;
            }
            break;
        case gameState.player_select_field:
            player[PLR].selected_fieldID = pointedFieldIndex();
            if (player[PLR].selected_fieldID >= 0 &&
               (player[PLR].needToThrow && field.card[player[PLR].selected_fieldID] == -1) ||
                Math.floor(player[PLR].hand[player[PLR].selected_handID]/4) == Math.floor(field.card[player[PLR].selected_fieldID]/4)) {
                // 玩家出牌
                player_play_card(PLR, player[PLR].selected_handID, player[PLR].selected_fieldID);
            } else {
                let tmp = pointedPlayerHandIndex();
                if (tmp >= 0) {
                    // 選擇另一張手牌
                    player_unselect_hand(player[PLR].selected_handID);
                    player_select_hand(tmp);
                } else {
                    // 取消選擇
                    player_unselect_hand(player[PLR].selected_handID);
                    game.state = gameState.player_select_hand;
                }
            }
            break;
        case gameState.player_choose_card:
            // 抽牌後選擇場牌(有2張同月份牌時)
            player[PLR].selected_fieldID = pointedFieldIndex();
            if (Math.floor(player[PLR].draw_cardID/4) == Math.floor(field.card[player[PLR].selected_fieldID]/4)) {
                field.update_noticed(-1);
                draw_card_animation(PLR, player[PLR].draw_cardID, player[PLR].selected_fieldID, field.card[player[PLR].selected_fieldID]);
            }
            break;
        case gameState.player_decide_koi:
            end_button.check_press();
            koi_button.check_press();
            break;
        case gameState.month_end:
            if (game.month == game.MAXMONTH)
                to_result_button.check_press();
            else
                next_month_button.check_press();
            break;
        default:
            break;
    }
}

function keydown_func(e) {
    const key = e.key;
    switch (key) {
        case 'r':
            /* resize screen */
            R = window.devicePixelRatio;
            canvas.width = SCREEN_W * R;
            canvas.height = SCREEN_H * R;
            // auto adaptive size by height
            scaleRate = self.innerHeight / SCREEN_H;
            canvas.style.width = SCREEN_W * scaleRate + 'px';
            canvas.style.height = SCREEN_H * scaleRate + 'px';
            context.textAlign = "center";
            context.textBaseline = 'middle';
            break;
    
        default:
            break;
    }
}

// get mouse coorfinates
function updateMouseXY(event) {
    var rect = event.target.getBoundingClientRect();
    if (scaleRate > 0) {
        mouse.x = (event.clientX - rect.left) / scaleRate;
        mouse.y = (event.clientY - rect.top ) / scaleRate;
    }
}

function pointedFieldIndex() {
    if (card == null) return -1;
    for (let i = 0; i < FIELD_SPACE; i++)
        if (mouse.x >= Field.X(i) && mouse.x <= Field.X(i) + CARD_W &&
            mouse.y >= Field.Y(i) && mouse.y <= Field.Y(i) + CARD_H)
            return i;
    return -1;
}

function pointedPlayerHandIndex() {
    if (card == null) return -1;
    for (let i = 0; i < player[PLR].hand.length; i++)
        if (mouse.x >= card[player[PLR].hand[i]].px && mouse.x <= card[player[PLR].hand[i]].px + CARD_W &&
            mouse.y >= card[player[PLR].hand[i]].py && mouse.y <= card[player[PLR].hand[i]].py + CARD_H)
            return i;
    return -1;
}

//#endregion

//#region Game & Graph Functions

function animate(time) {
    if (!startTime) // it's the first frame
        startTime = time || performance.now();

    // 清除整個canvas畫面
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (time_func != null)
        time_func(time);

    // 重畫整個畫面
    if (game.state == gameState.title)
        draw_title();
    else
        draw_gaming();

    requestAnimationFrame(animate);
}

function endAnimation() {
    time_func = null;
    next_func = null;
    while (movingCard.length > 0)
        movingCard.pop();
}

function draw_title() {
    context.textAlign = "center";
    context.fillStyle = 'rgb(0,0,0)';
    context.font = 108 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("花札", SCREEN_W/2 * R, (SCREEN_H/2 - 108/2) * R);
    context.font = 81 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("こいこい", SCREEN_W/2 * R, (SCREEN_H/2 + 81/2) * R);
    context.font = 40.5 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("クリックして開始", SCREEN_W/2 * R, (SCREEN_H/2 + 108) * R);
}

/* draw canvas when gaming */
function draw_gaming() {
    // draw field background
    //context.fillStyle = 'darkred';
    //context.fillRect((Field.X(0) - (CARD_IMG_W - CARD_W) / 2) * R, (Field.Y(0) - (CARD_IMG_H - CARD_H) / 2) * R, (CARD_IMG_W + Field.X(FIELD_SPACE-1) - Field.X(0)) * R, (CARD_IMG_H + Field.Y(FIELD_SPACE-1) - Field.Y(0)) * R);

    // draw the deck at center
    draw_card(CARD_BACK_ID, DECK_P.x, DECK_P.y);

    player[CPU].update_card_info();
    player[PLR].update_card_info();

    // draw the field cards
    field.update_card_info();
    for (let i = 0; i < FIELD_SPACE; i++) {
        if (field.card[i] >= 0)
            card[field.card[i]].draw();
        else if (player[PLR].selected_handID >= 0 && player[PLR].noticed[player[PLR].selected_handID] == false)
            draw_noticed(Field.X(i), Field.Y(i));
    }

    for (let i = 0; i < 2; i++) {
        // draw the collect cards of players
        for (const arr of player[i].collect)
            for (const c of arr)
                card[c].draw();
        // draw the hand cards of players
        for (const c of player[i].hand)
            card[c].draw();
    }

    // draw moving cards
    for (let i = 0; i < movingCard.length; i++)
        //if (card[c].px != DECK_P.x && card[c].py != DECK_P.y)
        card[movingCard[i]].draw();

    /* draw the information of this game */
    
    context.font = FONT_SIZE * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    // 幾月
    context.lineWidth = 2 * R;
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    if (game.MAXMONTH >= 10)
        context.fillText(NUMBER[10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 - FONT_SIZE*3 + (FONT_SIZE * (0+0.5))) * R);
    context.fillText(NUMBER[game.MAXMONTH%10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 - FONT_SIZE*2 + (FONT_SIZE * (0+0.5))) * R);
    context.fillText("月"                 , (FONT_SIZE/2+1) * R, (SCREEN_H/2 - FONT_SIZE*2 + (FONT_SIZE * (1+0.5))) * R);
    context.strokeRect(0, (SCREEN_H/2 - FONT_SIZE*3) * R, (FONT_SIZE+2) * R, (FONT_SIZE*3) * R);
    // 幾戰目
    if (game.month >= 10)
        context.fillText(NUMBER[10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (0+0.5))) * R);
    context.fillText(NUMBER[game.month%10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (1+0.5))) * R);
    context.fillText("戦"              , (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (2+0.5))) * R);
    context.fillText("目"              , (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (3+0.5))) * R);
    context.strokeRect(0, SCREEN_H/2 * R, (FONT_SIZE+2) * R, (FONT_SIZE * 4) * R);

    // 親
    const circleY = (game.first == CPU) ? 30 : SCREEN_H - 30;
    context.beginPath();
    context.arc((SCREEN_W - 30) * R, circleY * R, 15 * R, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.strokeStyle = 'black';
    context.lineWidth = 3 * R;
    context.stroke();
    context.fillStyle = 'black';
    context.font = FONT_SIZE * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("親", (SCREEN_W - 30) * R, circleY * R);

    // 文
    score_panel[PLR].text = `${player[PLR].total_money}文`;
    score_panel[CPU].text = `${player[CPU].total_money}文`;
    score_panel[PLR].draw();
    score_panel[CPU].draw();

    /* draw UI */
    switch (game.state) {
        case gameState.player_decide_koi:
            draw_decide_koi();
            break;
        case gameState.koikoi_animation:
            draw_koikoi();
            break;
        case gameState.month_end:
            draw_show_yaku();
            break;
        case gameState.game_result:
            draw_game_result();
            break;
        default:
            break;
    }
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

// 一張牌在一幀內的移動
// 回傳結束了沒
function step_move(cardID, sX, sY, dX, dY, flip = false) {
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
            const px = SCREEN_W / 2 + (CARD_W+CARD_GAP*2) * (i - HAND_NUM / 2) + CARD_GAP;
            const cx = SCREEN_W / 2 + (CARD_W+CARD_GAP*2) * (HAND_NUM / 2 - i - 1) + CARD_GAP;
            const dy = CARD_GAP;
            // to cpu hand
            step_move(cards[CPU + 1][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, cx, dy, false)(time);
            // to player hand
            step_move(cards[PLR + 1][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, px, SCREEN_H - (CARD_H+CARD_GAP*2) + dy, true)(time);
            // 發下2張牌
            next_func = deal_step(cards, i + 1);
        }

    return function(time) {
        for (let i = 0; i < HAND_NUM; i++) {
            const fx = Field.X(i + (FIELD_SPACE - HAND_NUM) / 2);
            const fy = Field.Y(i);
            // to field
            step_move(cards[0][i], (SCREEN_W-CARD_W)/2, (SCREEN_H-CARD_H)/2, fx, fy, true)(time);
        }
        next_func = after_deal(cards);
    }
}

function init_game() {
    /* card images */
    for (let i = 0; i < CARD_NUM+1; i++) {
        cardImg[i] = new Image();
        cardImg[i].src = `imgs/${i}.png`;
    }

    /* init game data */
    game = new Game();

    /* init UI in game */
    let w, h;
    // 文
    w = 60, h = 35;
    score_panel[CPU] = new Button(5, 5, w, h, 5, '0文', 20);
    score_panel[PLR] = new Button(5, SCREEN_H-h-5, w, h, 5, '0文', 20);
    // the size of panel of decide koi
    w = 400, h = 200;
    koi_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
    end_button = new Button(SCREEN_W/2-w/2+w/8-w/24, SCREEN_H/2 + h/8, w/3, h/4, 10, "あがり", 24, ()=>{player_win(PLR);}, 'lightgray');
    koi_button = new Button(SCREEN_W/2+w/2-w/8+w/24-w/3, SCREEN_H/2 + h/8, w/3, h/4, 10, "こいこい", 24, ()=>{koikoi(PLR);}, 'lightgray');
    // the size of banner of koi koi
    w = SCREEN_W + 20, h = 100;
    koikoi_banner = new Button(-10, SCREEN_H/2-h/2, w, h, 0, "こいこい", 52, null);
    // the size of the panel of showing yaku and score
    w = 400, h = 400;
    yaku_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2 - 50/2, w, h, 10);
    // the size of restart button
    w = 400, h = 50;
    next_month_button = new Button(SCREEN_W/2-w/2, yaku_panel.y+yaku_panel.h + 5, w, h, 10, '次の対局へ', 24, start_month);
    to_result_button = new Button(SCREEN_W/2-w/2, yaku_panel.y+yaku_panel.h + 5, w, h, 10, '対局結果へ', 24, result_game);
    // the size of  result panel
    w = 400, h = 480;
    result_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
}

/* init new game */
function start_game() {
    // init all cards
    card = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        card[i] = new Card(i);

    // init field
    field = new Field();

    // init player & cpu
    player = new Array(2);
    player[PLR] = new Player(PLR); // player
    player[CPU] = new Player(CPU); // cpu

    // init moving cards array
    movingCard = new Array();

    /* 正式開始 */
    // 決定親權 (0:player, 1:cpu)
    game.first = Math.floor(Math.random() * 2);
    start_month();
}

function start_month() {
    /* init month */
    // init deck
    deck = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        deck[i] = i;

    // reset cards
    for (let i = 0; i < CARD_NUM; i++)
        card[i].reset_month();
    
    // reset field
    field.reset_month();;

    // reset players
    player[PLR].reset_month();
    player[CPU].reset_month();

    // reset game info
    game.reset_month();
    game.month++;
    game.first = Number(!game.first);

    // reset animation
    endAnimation();

    // shuffle
    shuffle(deck);
    // 發牌
    deal_cards(game.first);
}

/* shuffle deck */
function shuffle(deck) {
    let shuffle_end = false;
    while (!shuffle_end) {
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
            if (month[Math.floor(deck[i] / 4)] >= 3)
                flag = false;
        }
        shuffle_end = flag;
    }
}

/* 發牌 */
function deal_cards() {
    game.state = gameState.deal;

    // distribute cards
    let new_card = [[], [], []]; // 0:field, 1:player, 2:cpu
    for (let j = 0; j < 3; j++)
        for (let i = 0; i < HAND_NUM; i++) {
            new_card[j].push(deck.pop());
            movingCard.push(new_card[j][i]);
            card[new_card[j][i]].place = cardPlace.moving;
        }

    // animation
    startTime = performance.now(); // reset startTime
    time_func = deal_step(new_card, 0);
}

function after_deal(new_card) {
    return function (time) {
        endAnimation();

        // put to players' hand & field
        for (let i = 0; i < HAND_NUM; i++)
            field.insertCard(i+(FIELD_SPACE-HAND_NUM)/2, new_card[0][i]);
        for (let i = 0; i < HAND_NUM; i++)
            player[PLR].addHand(new_card[PLR + 1][i]);
        for (let i = 0; i < HAND_NUM; i++)
            player[CPU].addHand(new_card[CPU + 1][i]);

        // 第一回合開始
        game.round = 0;
        (game.round % 2 == game.first) ? player_play() : cpu_play();
    }
}

/* 玩家的回合 */
function player_play() {
    game.state = gameState.player_select_hand;
}

/* 玩家出牌 */
function player_play_card(playerID, handID, fieldID) {
    if (playerID == PLR)
        game.state = gameState.player_play_card;

    let handCardID = player[playerID].hand[handID];
    // 從手牌和場上移除handID和fieldID的2張牌
    player[playerID].removeHand(handID);

    // animation
    startTime = performance.now(); // reset startTime
    movingCard.push(handCardID);
    // 分為(手牌與場牌)有可以配對的與無可配對的2種情況
    if (field.card[fieldID] == -1) {
        // 棄牌
        time_func = step_move(handCardID, card[handCardID].px, card[handCardID].py, Field.X(fieldID), Field.Y(fieldID));
        next_func = after_play(playerID, handCardID, -1, fieldID);
    } else {
        time_func = step_move(handCardID, card[handCardID].px, card[handCardID].py, Field.X(fieldID), Field.Y(fieldID) + 10);
        next_func = player_collect_animation(playerID, handCardID, fieldID);
    }
}

function player_collect_animation(playerID, handCardID, fieldID) {
    return function (time) {
        //endAnimation();
        //console.log("f", field.card[fieldID]);
        let fieldCardID = field.card[fieldID];
        field.removeCard(fieldID);
        // next animation
        // startTime = performance.now(); // reset startTime
        // this is temp -> next is move to cards to collect
        time_func = after_play(playerID, handCardID, fieldCardID);
    }
}

function after_play(playerID, handCardID, fieldCardID, fieldID = -1) {
    return function (time) {
        // 保證月份相同
        // 手牌已經移除打出的牌，場上也移除對應的牌，都移到movingCard了

        endAnimation();

        if (fieldCardID >= 0) {
            // put to player's collect
            player[playerID].addCollect(handCardID);
            player[playerID].addCollect(fieldCardID);
        } else {
            // put to field
            field.insertCard(fieldID, handCardID);
        }

        // draw card from deck
        draw_new_card(playerID);
    }
}

function draw_new_card(playerID) {
    // draw card
    let new_card = deck.pop();
    player[playerID].draw_cardID = new_card;

    // show the new card
    card[new_card].back = false;
    card[new_card].place = cardPlace.moving;
    movingCard.push(new_card);

    // find the pair card
    let fieldID;
    let pairFieldID = [];
    // find if there are pair cards
    for (let i = 0; i < FIELD_SPACE; i++)
        if (Math.floor(field.card[i] / 4) == Math.floor(new_card / 4))
            pairFieldID.push(i);

    if (pairFieldID.length == 0)
    {
        // find space on field
        for (let i = 0; i < FIELD_SPACE; i++)
            if (field.card[i] == -1) {
                fieldID = i;
                break;
            }
        draw_card_animation(playerID, new_card, fieldID, -1);
    }
    else if (pairFieldID.length >= 2)
    {
        if (playerID == PLR) {
            // wait for player choose
            game.state = gameState.player_choose_card;
            field.update_noticed(Math.floor(new_card/4));
        } else /* CPU */ {
            // 未完成
            fieldID = pairFieldID[0];
            draw_card_animation(playerID, new_card, fieldID, field.card[fieldID]);
        }
    }
    else // only one card can pair
    {
        fieldID = pairFieldID[0];
        draw_card_animation(playerID, new_card, fieldID, field.card[fieldID]);
    }
}

function draw_card_animation(playerID, new_card, fieldID, fieldCardID) {
    if (playerID == PLR)
        game.state = gameState.player_end_round;

    if (fieldCardID >= 0) {
        // remove the card from field
        field.removeCard(fieldID);
    }
    // animation
    startTime = performance.now(); // reset startTime
    time_func = step_move(new_card, DECK_P.x, DECK_P.y, Field.X(fieldID), Field.Y(fieldID));
    // 這裡還要加上collect的動畫
    next_func = after_draw_new_card(playerID, new_card, fieldID, fieldCardID);
}

function after_draw_new_card(playerID, new_cardID, fieldID, fieldCardID) {
    return function (time) {
        endAnimation();

        if (fieldCardID != -1) {
            // put to player's collect
            player[playerID].addCollect(new_cardID);
            player[playerID].addCollect(fieldCardID);
        } else {
            // put to field
            field.insertCard(fieldID, new_cardID);
        }

        // round end
        // check yaku and check win or next round
        check_win(playerID);
    }
}

function check_win(playerID) {
    const win = player[playerID].check_yaku();
    if (player[CPU].hand.length == 0 && player[PLR].hand.length == 0)
    {
        // end this month
        if (win)
            player_win(playerID);
        else if (game.koi != -1)
            player_win(game.koi);
        else {
            // 親權
            player[game.first].yaku[0] = 1;
            player[game.first].score += yaku_score[0];
            player_win(game.first);
        }
    } else if (win) {
        // 若是最後一回合 => 強制結束
        if (player[playerID].hand.length == 0)
            player_win(playerID);

        // ask koi koi or not
        if (playerID == PLR)
            game.state = gameState.player_decide_koi;
        else {
            if (Math.floor(Math.random() * 2))
                koikoi(CPU);
            else
                player_win(CPU);
        }
    } else {
        // next round
        game.round++;
        (game.round % 2 == game.first) ? player_play() : cpu_play();
    }
}

function player_win(playerID) {
    game.winner = playerID;
    game.state = gameState.month_end;
    player[playerID].money[game.month-1] = player[playerID].score * (game.koi_bouns ? player[playerID].koi_time+1 : 1);
    player[playerID].total_money += player[playerID].money[game.month-1];
}

function draw_decide_koi() {
    // draw panel
    koi_panel.draw();

    // the size of panel of decide koi
    const w = koi_panel.w, h = koi_panel.h;
    // draw texts
    context.fillStyle = 'white';
    context.font = 32 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("こいこいしますか？", (SCREEN_W/2) * R, (SCREEN_H/2 - h/4) * R);
    context.font = 20 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText(`現在の獲得文数：${player[PLR].score}文`, (SCREEN_W/2) * R, (SCREEN_H/2 - h/24) * R);

    // draw buttons
    end_button.draw();
    koi_button.draw();
}

function koikoi(playerID) {
    game.state = gameState.koikoi_animation;
    game.koi = playerID;
    player[playerID].koi_time++;

    // animation
    startTime = performance.now();
    time_func = koi_step();
    next_func = function (time) {
        endAnimation();
        // next round
        game.round++;
        (game.round % 2 == game.first) ? player_play() : cpu_play();
    }
}

function draw_koikoi() {
    koikoi_banner.draw();
}

// show koikoi UI
function koi_step() {
    return function (time) {
        const duration = (7 * MOVE_TIME);
        const deltaTime = (time - startTime) / duration;
        const open_speed = 6;
        if (deltaTime >= 1) {
            // end
            koikoi_banner.fillColor = 'rgba(0,0,0,0)';
            koikoi_banner.borderColor = 'rgba(0,0,0,0)';
            koikoi_banner.textColor = 'rgba(0,0,0,0)';
            startTime = null;
            time_func = next_func;
        } else if (deltaTime > 0.6) {
            // fade
            const alpha = easeInQuad(time-startTime, 1, -2*(deltaTime-0.6), duration*0.4);
            koikoi_banner.fillColor = `rgba(255,215,0,${alpha})`;
            koikoi_banner.borderColor = `rgba(255,255,255,${alpha})`;
            koikoi_banner.textColor = `rgba(255,0,0,${alpha})`;
        } else if (deltaTime > 0.4) {
            // show 0.2*duration ms
            koikoi_banner.fillColor = 'gold';
            koikoi_banner.borderColor = 'white';
            koikoi_banner.textColor = 'red';
        } else {
            // emerge
            const alpha = easeOutQuad(time-startTime, 0, 4*deltaTime, duration*0.4);
            //koikoi_banner.fillColor = `rgba(255,215,0,${alpha})`;
            //koikoi_banner.borderColor = `rgba(255,255,255,${alpha})`;
            koikoi_banner.fillColor = 'gold';
            koikoi_banner.borderColor = 'white';
            koikoi_banner.textColor = `rgba(255,0,0,${alpha})`;
            if (deltaTime <= 1/open_speed) {
                const width = easeInOutQuad(time-startTime, 0, open_speed*(deltaTime), duration/open_speed) * 100;
                koikoi_banner.y = SCREEN_H/2 - width/2;
                koikoi_banner.h = width;
            }
        }
    }
}

function draw_show_yaku() {
    yaku_panel.draw();
    const w = yaku_panel.w, h = yaku_panel.h, py = yaku_panel.y;
    // draw who win
    context.fillStyle = 'white';
    const fontsize = 32;
    context.font = fontsize * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    const text = (game.winner == PLR) ? '勝利' : '敗北';
    const title_h = 100;
    context.fillText(text, (SCREEN_W/2) * R, (py + title_h/2) * R);
    // draw yaku
    context.font = 20 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    let count = 0;
    const max_show = (game.koi_bouns) ? 8 : 9;
    for (let i = 0; i < YAKU_NUM; i++)
        if (player[game.winner].yaku[i] > 0) {
            count++;
            if (count <= max_show) {
                context.fillText(yaku_name[i], (SCREEN_W/2 - w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
                context.fillText(`${player[game.winner].yaku[i] * yaku_score[i]}文`, (SCREEN_W/2 + w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
            } else if (count == max_show+1) {
                context.fillText('···', (SCREEN_W/2 - w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
                context.fillText('···', (SCREEN_W/2 + w/4) * R, (py + title_h/2 + fontsize + count * 24) * R);
            }
        }
    if (game.koi_bouns) {
        // draw koi koi time
        context.fillText(`こいこい${player[game.winner].koi_time}次`, (SCREEN_W/2 - w/4) * R, (py + h - title_h/2 - fontsize) * R);
        context.fillText(`x${player[game.winner].koi_time+1}`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2 - fontsize) * R);
        // draw total score
        context.fillText('合計', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2) * R);
        context.fillText(`${player[game.winner].score * (player[game.winner].koi_time+1)}文`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2) * R);
    } else {
        context.fillText('合計', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2) * R);
        context.fillText(`${player[game.winner].score}文`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2) * R);
    }

    // draw button
    if (game.month < game.MAXMONTH)
        next_month_button.draw();
    else
        to_result_button.draw();
}

function result_game() {
    game.state = gameState.game_result;
}

function draw_game_result() {
    result_panel.draw();
    const w = result_panel.w, h = result_panel.h, py = result_panel.y;

    // draw who win
    context.fillStyle = 'white';
    const fontsize = 32;
    context.font = fontsize * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    const text = (player[PLR].total_money > player[CPU].total_money) ? '勝利' : '敗北';
    const title_h = 100;
    context.fillText(text, (SCREEN_W/2) * R, (py + title_h/2) * R);

    // draw scores
    context.font = 20 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText('あなた', (SCREEN_W/2) * R, (py + title_h) * R);
    context.fillText('相手', (SCREEN_W/2 + w/4) * R, (py + title_h) * R);
    for (let i = 1; i <= game.MAXMONTH; i++) {
        context.fillText(`${i}月`, (SCREEN_W/2 - w/4) * R, (py + title_h + i * 24) * R);
        context.fillText((player[PLR].money[i-1] > 0) ? `${player[PLR].money[i-1]}文` : '-',
                         (SCREEN_W/2) * R, (py + title_h + i * 24) * R);
        context.fillText((player[CPU].money[i-1] > 0) ? `${player[CPU].money[i-1]}文` : '-',
                         (SCREEN_W/2 + w/4) * R, (py + title_h + i * 24) * R);
    }
    context.fillText('合計', (SCREEN_W/2 - w/4) * R, (py + h - title_h/2) * R);
    context.fillText(`${player[PLR].total_money}文`, (SCREEN_W/2) * R, (py + h - title_h/2) * R);
    context.fillText(`${player[CPU].total_money}文`, (SCREEN_W/2 + w/4) * R, (py + h - title_h/2) * R);
}

/* AI的回合 */
function cpu_play() {
    game.state = gameState.cpu_play;

    // 找出所有可以出的牌與對應的場牌
    // 找到價值最高的
    player[CPU].selected_handID = -1;
    player[CPU].selected_fieldID = -1;
    for (let i = 0; i < player[CPU].hand.length; i++)
        for (let j = 0; j < FIELD_SPACE; j++) {
            if (field.card[j] < 0) continue;
            if (Math.floor(player[CPU].hand[i]/4) == Math.floor(field.card[j]/4))
            {
                if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) 
                {
                    player[CPU].selected_handID = i;
                    player[CPU].selected_fieldID = j;
                }
                else if (card_type[player[CPU].hand[i]] + card_type[field.card[j]] > 
                    card_type[player[CPU].hand[player[CPU].selected_handID]] + card_type[field.card[player[CPU].selected_fieldID]])
                {
                    player[CPU].selected_handID = i;
                    player[CPU].selected_fieldID = j;
                }
            }
        }

    // 如果沒找到可配對的 -> 棄牌
    if (player[CPU].selected_handID < 0 || player[CPU].selected_fieldID < 0) {
        player[CPU].selected_handID = 0;
        for (let i = 1; i < player[CPU].hand.length; i++)
            if (card_type[player[CPU].hand[i]] > card_type[player[CPU].hand[player[CPU].selected_handID]])
                player[CPU].selected_handID = i;
        for (let j = 0; j < FIELD_SPACE; j++)
            if (field.card[j] == -1) {
                player[CPU].selected_fieldID = j;
                break;
            }
    }
    
    player_play_card(CPU, player[CPU].selected_handID, player[CPU].selected_fieldID);
}

function player_select_hand(handID) {
    card[player[PLR].hand[handID]].selected = true;
    field.update_noticed(Math.floor(player[PLR].hand[handID] / 4));
    player[PLR].selected_handID = handID;
}
function player_unselect_hand(handID) {
    card[player[PLR].hand[handID]].selected = false;
    field.update_noticed(-1);
    player[PLR].selected_handID = -1;
}

//#endregion